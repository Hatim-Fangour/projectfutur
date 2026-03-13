'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/AuthProvider'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================================
// Types
// ===================================================

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE'

interface RealtimePayload {
  eventType: RealtimeEvent
  table: string
  new: Record<string, unknown>
  old: Record<string, unknown>
}

type RealtimeCallback = (payload: RealtimePayload) => void

interface RealtimeContextValue {
  /**
   * Register a callback for appointment table changes.
   * Returns an unsubscribe function.
   */
  onAppointmentChange: (cb: RealtimeCallback) => () => void

  /**
   * Register a callback for notification table changes.
   * Returns an unsubscribe function.
   */
  onNotificationChange: (cb: RealtimeCallback) => () => void

  /**
   * Register a callback for inventory_items table changes.
   * Returns an unsubscribe function.
   */
  onInventoryChange: (cb: RealtimeCallback) => () => void

  /**
   * Whether the realtime connection is active.
   */
  isConnected: boolean
}

const RealtimeContext = createContext<RealtimeContextValue>({
  onAppointmentChange: () => () => {},
  onNotificationChange: () => () => {},
  onInventoryChange: () => () => {},
  isConnected: false,
})

// ===================================================
// Throttle utility
// ===================================================

/**
 * Creates a throttled version of a callback.
 * Will execute at most once per `delayMs` milliseconds.
 */
function createThrottle(delayMs: number) {
  let lastRun = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  return (fn: () => void) => {
    const now = Date.now()
    const remaining = delayMs - (now - lastRun)

    if (remaining <= 0) {
      lastRun = now
      fn()
    } else if (!timer) {
      timer = setTimeout(() => {
        lastRun = Date.now()
        timer = null
        fn()
      }, remaining)
    }
  }
}

// ===================================================
// Provider
// ===================================================

/** Minimum interval between refetch triggers (ms) */
const THROTTLE_MS = 2000

/** Reconnection backoff settings */
const INITIAL_BACKOFF_MS = 1000
const MAX_BACKOFF_MS = 30000

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)

  // Subscriber registries -- using refs to avoid re-subscribing on every render
  const appointmentCallbacksRef = useRef<Set<RealtimeCallback>>(new Set())
  const notificationCallbacksRef = useRef<Set<RealtimeCallback>>(new Set())
  const inventoryCallbacksRef = useRef<Set<RealtimeCallback>>(new Set())

  // Channel ref for cleanup
  const channelRef = useRef<RealtimeChannel | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const backoffRef = useRef(INITIAL_BACKOFF_MS)

  // Ref to hold the latest subscribe function (breaks circular dependency)
  const subscribeRef = useRef<() => void>(() => {})

  // Throttled dispatchers
  const throttleAppointment = useMemo(() => createThrottle(THROTTLE_MS), [])
  const throttleNotification = useMemo(() => createThrottle(THROTTLE_MS), [])
  const throttleInventory = useMemo(() => createThrottle(THROTTLE_MS), [])

  // Dispatch to all registered callbacks for a table
  const dispatchEvent = useCallback(
    (
      table: string,
      payload: RealtimePayload,
    ) => {
      if (table === 'appointments') {
        throttleAppointment(() => {
          appointmentCallbacksRef.current.forEach((cb) => cb(payload))
        })
      } else if (table === 'notifications') {
        // Only dispatch notifications for the current user
        const targetUserId = (payload.new as Record<string, unknown>)?.userId
        if (targetUserId && targetUserId !== user?.id) return

        throttleNotification(() => {
          notificationCallbacksRef.current.forEach((cb) => cb(payload))
        })
      } else if (table === 'inventory_items') {
        throttleInventory(() => {
          inventoryCallbacksRef.current.forEach((cb) => cb(payload))
        })
      }
    },
    [throttleAppointment, throttleNotification, throttleInventory, user?.id]
  )

  // Exponential backoff reconnection (declared before subscribe, calls subscribeRef)
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
    }

    const delay = backoffRef.current
    backoffRef.current = Math.min(delay * 2, MAX_BACKOFF_MS)

    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null
      subscribeRef.current()
    }, delay)
  }, [])

  // Subscribe to Supabase Realtime
  const subscribe = useCallback(() => {
    if (!user) return

    const supabase = createClient()

    // Clean up any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channel = supabase
      .channel('db-changes', {
        config: { private: false },
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          dispatchEvent('appointments', {
            eventType: payload.eventType as RealtimeEvent,
            table: 'appointments',
            new: (payload.new ?? {}) as Record<string, unknown>,
            old: (payload.old ?? {}) as Record<string, unknown>,
          })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          dispatchEvent('notifications', {
            eventType: payload.eventType as RealtimeEvent,
            table: 'notifications',
            new: (payload.new ?? {}) as Record<string, unknown>,
            old: (payload.old ?? {}) as Record<string, unknown>,
          })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_items' },
        (payload) => {
          dispatchEvent('inventory_items', {
            eventType: payload.eventType as RealtimeEvent,
            table: 'inventory_items',
            new: (payload.new ?? {}) as Record<string, unknown>,
            old: (payload.old ?? {}) as Record<string, unknown>,
          })
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          backoffRef.current = INITIAL_BACKOFF_MS // Reset backoff on success
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false)
          console.error('Realtime channel error:', status, err)
          scheduleReconnect()
        } else if (status === 'CLOSED') {
          setIsConnected(false)
        }
      })

    channelRef.current = channel
  }, [user, dispatchEvent, scheduleReconnect])

  // Keep subscribeRef up to date so scheduleReconnect always calls the latest version
  useEffect(() => {
    subscribeRef.current = subscribe
  }, [subscribe])

  // Effect: subscribe when user is authenticated, cleanup on unmount
  useEffect(() => {
    if (!user) return

    subscribe()

    return () => {
      // Cleanup channel
      if (channelRef.current) {
        const supabase = createClient()
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }

      // Clear reconnect timer
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
    }
  }, [user, subscribe])

  // Derive isConnected = false when there is no user (no setState needed)
  const effectiveIsConnected = user ? isConnected : false

  // Registration functions -- stable references via useCallback
  const onAppointmentChange = useCallback((cb: RealtimeCallback) => {
    appointmentCallbacksRef.current.add(cb)
    return () => {
      appointmentCallbacksRef.current.delete(cb)
    }
  }, [])

  const onNotificationChange = useCallback((cb: RealtimeCallback) => {
    notificationCallbacksRef.current.add(cb)
    return () => {
      notificationCallbacksRef.current.delete(cb)
    }
  }, [])

  const onInventoryChange = useCallback((cb: RealtimeCallback) => {
    inventoryCallbacksRef.current.add(cb)
    return () => {
      inventoryCallbacksRef.current.delete(cb)
    }
  }, [])

  const value = useMemo<RealtimeContextValue>(
    () => ({
      onAppointmentChange,
      onNotificationChange,
      onInventoryChange,
      isConnected: effectiveIsConnected,
    }),
    [onAppointmentChange, onNotificationChange, onInventoryChange, effectiveIsConnected]
  )

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}

/**
 * Hook to access realtime event subscriptions.
 * Must be used within a RealtimeProvider.
 */
export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}
