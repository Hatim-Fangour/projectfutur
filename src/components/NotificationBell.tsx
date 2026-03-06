'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bell, Check, CheckCheck, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { notificationApi } from '@/lib/api-client'
import { useAuth } from '@/providers/AuthProvider'
import { useRealtime } from '@/providers/RealtimeProvider'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  userId: string
  resourceType: string | null
  resourceId: string | null
  createdAt: string
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const NOTIFICATION_TYPE_ICON: Record<string, string> = {
  GENERAL: 'bg-gray-100 text-gray-600',
  APPOINTMENT: 'bg-blue-100 text-blue-600',
  INVENTORY: 'bg-orange-100 text-orange-600',
  FINANCE: 'bg-green-100 text-green-600',
  SYSTEM: 'bg-purple-100 text-purple-600',
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return
    try {
      const res = await notificationApi.unreadCount()
      if (res.success && res.data != null) {
        const count = typeof res.data === 'number' ? res.data : (res.data as { count: number }).count ?? 0
        setUnreadCount(count)
      }
    } catch {
      /* non-critical */
    }
  }, [user])

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await notificationApi.list({ limit: 20 })
      if (res.success && res.data) {
        setNotifications(res.data as Notification[])
      }
    } catch {
      /* non-critical */
    } finally {
      setLoading(false)
    }
  }, [user])

  // Realtime: subscribe to notification changes for instant updates
  const { onNotificationChange } = useRealtime()

  useEffect(() => {
    const unsubscribe = onNotificationChange(() => {
      fetchUnreadCount()
      // If the popover is open, also refresh the list
      if (open) {
        fetchNotifications()
      }
    })
    return unsubscribe
  }, [onNotificationChange, fetchUnreadCount, fetchNotifications, open])

  // Fallback poll every 60 seconds (in case realtime is disconnected)
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Fetch full list when popover opens
  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open, fetchNotifications])

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await notificationApi.markAsRead(id)
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllRead = async () => {
    if (!user) return
    try {
      const res = await notificationApi.markAllRead()
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
        toast.success('All notifications marked as read')
      }
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await notificationApi.delete(id)
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        // If it was unread, decrement the count
        const deleted = notifications.find((n) => n.id === id)
        if (deleted && !deleted.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      }
    } catch {
      toast.error('Failed to delete notification')
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell aria-hidden="true" className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <span className="sr-only">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0" sideOffset={10}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleMarkAllRead}>
              <CheckCheck aria-hidden="true" className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="max-h-80">
          {loading && notifications.length === 0 ? (
            <div role="status" aria-label="Loading notifications" className="flex items-center justify-center py-8">
              <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Bell aria-hidden="true" className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <ul role="list" className="divide-y">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
                    !n.isRead ? 'bg-muted/30' : ''
                  }`}
                >
                  {/* Type indicator */}
                  <div
                    className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                      !n.isRead ? 'bg-primary' : 'bg-transparent'
                    }`}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-tight ${!n.isRead ? 'font-semibold' : 'font-medium'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMarkAsRead(n.id)}
                        aria-label="Mark as read"
                      >
                        <Check aria-hidden="true" className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(n.id)}
                      aria-label="Delete notification"
                    >
                      <Trash2 aria-hidden="true" className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t px-4 py-2 text-center">
            <Button variant="link" size="sm" className="text-xs" onClick={() => setOpen(false)}>
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
