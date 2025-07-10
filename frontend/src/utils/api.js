// API configuration
const IS_DEVELOPMENT = import.meta.env.NODE_ENV === 'development';

// Always use relative URLs for Nginx proxy
export const getApiUrl = (endpoint) => {
  return endpoint; // Always use relative: /api/tasks (Nginx will proxy)
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};