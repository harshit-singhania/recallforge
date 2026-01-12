import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = Cookies.get('refreshToken');
                if (refreshToken) {
                    // Try to refresh the token
                    const res = await axios.post(`${api.defaults.baseURL}/auth/jwt/refresh/`, {
                        refresh: refreshToken
                    });

                    if (res.data.access) {
                        Cookies.set('accessToken', res.data.access);
                        
                        // Retry the original request with new token
                        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                // Refresh failed
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                // Optional: redirect to login
                // window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
