/**
 * Typed API client for all backend resources.
 * All API calls go through this module — never call fetch directly from components.
 */

// Standard API response shape from all endpoints
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Generic fetch wrapper with error handling
async function apiCall<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const data: ApiResponse<T> = await response.json()

    if (!response.ok && !data.error) {
      return {
        success: false,
        error: `Request failed with status ${response.status}`,
      }
    }

    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// ===================================================
// Customer API
// ===================================================

export const customerApi = {
  list: (params?: { search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set('search', params.search)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    return apiCall(`/api/customers?${searchParams.toString()}`)
  },

  getById: (id: string) => apiCall(`/api/customers/${id}`),

  create: (data: Record<string, unknown>) =>
    apiCall('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    apiCall(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall(`/api/customers/${id}`, {
      method: 'DELETE',
    }),
}

// ===================================================
// Appointment API
// ===================================================

export const appointmentApi = {
  list: (params?: {
    search?: string
    page?: number
    limit?: number
    start?: string
    end?: string
    therapistId?: string
    status?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set('search', params.search)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.start) searchParams.set('start', params.start)
    if (params?.end) searchParams.set('end', params.end)
    if (params?.therapistId)
      searchParams.set('therapistId', params.therapistId)
    if (params?.status) searchParams.set('status', params.status)
    return apiCall(`/api/appointments?${searchParams.toString()}`)
  },

  getById: (id: string) => apiCall(`/api/appointments/${id}`),

  create: (data: Record<string, unknown>) =>
    apiCall('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    apiCall(`/api/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall(`/api/appointments/${id}`, {
      method: 'DELETE',
    }),
}

// ===================================================
// Staff API
// ===================================================

export const staffApi = {
  list: (params?: {
    search?: string
    page?: number
    limit?: number
    role?: string
    status?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set('search', params.search)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.role) searchParams.set('role', params.role)
    if (params?.status) searchParams.set('status', params.status)
    return apiCall(`/api/staff?${searchParams.toString()}`)
  },

  getById: (id: string) => apiCall(`/api/staff/${id}`),

  create: (data: Record<string, unknown>) =>
    apiCall('/api/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    apiCall(`/api/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall(`/api/staff/${id}`, {
      method: 'DELETE',
    }),

  getSchedule: (id: string) => apiCall(`/api/staff/${id}/schedule`),

  updateSchedule: (id: string, data: Record<string, unknown>) =>
    apiCall(`/api/staff/${id}/schedule`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// ===================================================
// Finance API
// ===================================================

export const financeApi = {
  overview: () => apiCall('/api/finance/overview'),

  transactions: {
    list: (params?: {
      page?: number
      limit?: number
      type?: string
      category?: string
      startDate?: string
      endDate?: string
      customerId?: string
      paymentMethod?: string
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      if (params?.type) searchParams.set('type', params.type)
      if (params?.category) searchParams.set('category', params.category)
      if (params?.startDate) searchParams.set('startDate', params.startDate)
      if (params?.endDate) searchParams.set('endDate', params.endDate)
      if (params?.customerId) searchParams.set('customerId', params.customerId)
      if (params?.paymentMethod) searchParams.set('paymentMethod', params.paymentMethod)
      return apiCall(`/api/finance/transactions?${searchParams.toString()}`)
    },

    create: (data: Record<string, unknown>) =>
      apiCall('/api/finance/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Record<string, unknown>) =>
      apiCall(`/api/finance/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiCall(`/api/finance/transactions/${id}`, {
        method: 'DELETE',
      }),
  },

  budgets: {
    list: () => apiCall('/api/finance/budgets'),

    create: (data: Record<string, unknown>) =>
      apiCall('/api/finance/budgets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Record<string, unknown>) =>
      apiCall(`/api/finance/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiCall(`/api/finance/budgets/${id}`, {
        method: 'DELETE',
      }),
  },

  savings: {
    list: () => apiCall('/api/finance/savings'),

    create: (data: Record<string, unknown>) =>
      apiCall('/api/finance/savings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Record<string, unknown>) =>
      apiCall(`/api/finance/savings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiCall(`/api/finance/savings/${id}`, {
        method: 'DELETE',
      }),
  },
}

// ===================================================
// Notes API
// ===================================================

export const noteApi = {
  list: (params?: {
    page?: number
    limit?: number
    customerId?: string
    isPrivate?: boolean
    search?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.customerId) searchParams.set('customerId', params.customerId)
    if (params?.isPrivate !== undefined) searchParams.set('isPrivate', String(params.isPrivate))
    if (params?.search) searchParams.set('search', params.search)
    return apiCall(`/api/notes?${searchParams.toString()}`)
  },

  getById: (id: string) => apiCall(`/api/notes/${id}`),

  create: (data: Record<string, unknown>) =>
    apiCall('/api/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    apiCall(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall(`/api/notes/${id}`, {
      method: 'DELETE',
    }),
}

// ===================================================
// Notification API
// ===================================================

export const notificationApi = {
  list: (params?: { page?: number; limit?: number; isRead?: boolean; userId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.isRead !== undefined) searchParams.set('isRead', String(params.isRead))
    if (params?.userId) searchParams.set('userId', params.userId)
    return apiCall(`/api/notifications?${searchParams.toString()}`)
  },

  getById: (id: string) => apiCall(`/api/notifications/${id}`),

  markAsRead: (id: string) =>
    apiCall(`/api/notifications/${id}`, {
      method: 'PATCH',
    }),

  markAllRead: (userId: string) =>
    apiCall('/api/notifications/mark-all-read', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  unreadCount: (userId: string) =>
    apiCall(`/api/notifications/unread-count?userId=${encodeURIComponent(userId)}`),

  delete: (id: string) =>
    apiCall(`/api/notifications/${id}`, {
      method: 'DELETE',
    }),
}

// ===================================================
// Services API (categories, items, pricing)
// ===================================================

export const serviceApi = {
  categories: {
    list: () => apiCall('/api/services/categories'),

    getById: (id: string) => apiCall(`/api/services/categories/${id}`),

    create: (data: Record<string, unknown>) =>
      apiCall('/api/services/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Record<string, unknown>) =>
      apiCall(`/api/services/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiCall(`/api/services/categories/${id}`, {
        method: 'DELETE',
      }),
  },

  items: {
    list: (params?: {
      page?: number
      limit?: number
      categoryId?: string
      isActive?: boolean
      search?: string
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      if (params?.categoryId) searchParams.set('categoryId', params.categoryId)
      if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive))
      if (params?.search) searchParams.set('search', params.search)
      return apiCall(`/api/services/items?${searchParams.toString()}`)
    },

    getById: (id: string) => apiCall(`/api/services/items/${id}`),

    create: (data: Record<string, unknown>) =>
      apiCall('/api/services/items', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Record<string, unknown>) =>
      apiCall(`/api/services/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiCall(`/api/services/items/${id}`, {
        method: 'DELETE',
      }),
  },

  pricing: {
    list: (params?: { serviceItemId?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.serviceItemId) searchParams.set('serviceItemId', params.serviceItemId)
      return apiCall(`/api/services/pricing?${searchParams.toString()}`)
    },

    create: (data: Record<string, unknown>) =>
      apiCall('/api/services/pricing', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Record<string, unknown>) =>
      apiCall(`/api/services/pricing/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiCall(`/api/services/pricing/${id}`, {
        method: 'DELETE',
      }),
  },
}

// ===================================================
// Dashboard API
// ===================================================

export const dashboardApi = {
  getOverview: (includeActivity = false) => {
    const params = includeActivity ? '?includeActivity=true' : ''
    return apiCall(`/api/dashboard${params}`)
  },
}

// ===================================================
// Inventory API
// ===================================================

export const inventoryApi = {
  list: (params?: {
    search?: string
    page?: number
    limit?: number
    status?: string
    category?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set('search', params.search)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.status) searchParams.set('status', params.status)
    if (params?.category) searchParams.set('category', params.category)
    return apiCall(`/api/inventory?${searchParams.toString()}`)
  },

  getById: (id: string) => apiCall(`/api/inventory/${id}`),

  create: (data: Record<string, unknown>) =>
    apiCall('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    apiCall(`/api/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall(`/api/inventory/${id}`, {
      method: 'DELETE',
    }),

  summary: () => apiCall('/api/inventory/summary'),
}

// ===================================================
// Upload API
// ===================================================

// ===================================================
// Payments API
// ===================================================

export const paymentApi = {
  createCheckout: (data: {
    customerId: string
    appointmentId?: string
    amount: number
    currency?: string
    description?: string
    successUrl: string
    cancelUrl: string
    idempotencyKey: string
  }) =>
    apiCall<{ sessionId: string; url: string | null }>('/api/payments/create-checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createIntent: (data: {
    customerId: string
    appointmentId?: string
    amount: number
    currency?: string
    description?: string
    idempotencyKey: string
  }) =>
    apiCall<{ clientSecret: string | null; paymentIntentId: string }>('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  recordManual: (data: {
    customerId: string
    appointmentId?: string
    amount: number
    currency?: string
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'OTHER'
    reference?: string
    notes?: string
    description?: string
  }) =>
    apiCall('/api/payments/manual', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

export const uploadApi = {
  avatar: async (file: File): Promise<ApiResponse<{ url: string; path: string }>> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }
    }
  },
}
