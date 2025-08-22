import { Alert } from 'react-native';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
}

export const makeAuthenticatedRequest = async (
  url: string,
  accessToken: string,
  options: ApiRequestOptions = {}
) => {
  const defaultHeaders = {
    'Authorization': `Bearer ${accessToken}`,
    'accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const requestOptions = {
    method: options.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...(options.body && { body: options.body }),
  };

  try {
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      if (response.status === 401) {
        Alert.alert('Session Expired', 'Please log in again.');
        // You might want to trigger a logout here
        throw new Error('Unauthorized');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// API endpoints
export const API_BASE_URL = 'https://arif194-skincheck.hf.space';

export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/auth/`,
  SIGNUP: `${API_BASE_URL}/signup/`,
  PREDICT_HISTORY: `${API_BASE_URL}/predict/history`,
  PREDICT: `${API_BASE_URL}/predict/`,
} as const;
