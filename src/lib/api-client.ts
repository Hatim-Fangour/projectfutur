import axios from 'axios';


type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

// Create axios instance
export const api = axios.create({
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Generic API call function
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
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Customer API functions
export const customerApi = {
  create: async (data: any) => {
    const res = await api.post('/api/customers', data);
    console.log('📥 Response:', res.data);
    return res.data;
  },
  
  update: async (id: string, data: any) => {
    const res = await api.put(`/api/customers/${id}`, data);
    return res.data;
  },
  
  delete: async (id: string) => {
    const res = await api.delete(`/api/customers/${id}`);
    return res.data;
  },
};


