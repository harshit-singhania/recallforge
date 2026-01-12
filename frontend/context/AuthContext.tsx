"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import api from '@/utils/axios';

// Separate axios instance for auth routes (no /api/v1 prefix)
const authApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

interface AuthContextType {
    user: any;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, dateOfBirth?: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Load user on mount
    React.useEffect(() => {
        const loadUser = async () => {
            const token = Cookies.get('accessToken');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await authApi.get('/auth/users/me/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
            } catch (err: any) {
                // Only log if it's not a 401 (Unauthorized) which is expected when not logged in
                if (err.response?.status !== 401) {
                    console.error("Failed to load user", err);
                }
                Cookies.remove('accessToken');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = async (username: string, password: string) => {
        const res = await authApi.post('/auth/jwt/create/', { username, password });
        const { access, refresh } = res.data;
        Cookies.set('accessToken', access);
        Cookies.set('refreshToken', refresh);

        // Fetch user details immediately
        const userRes = await authApi.get('/auth/users/me/', {
            headers: { Authorization: `Bearer ${access}` }
        });
        setUser(userRes.data);
    };

    const register = async (username: string, email: string, password: string, dateOfBirth?: string) => {
        const payload: Record<string, string> = {
            username,
            email,
            password,
        };

        // Only include date_of_birth if provided
        if (dateOfBirth) {
            payload.date_of_birth = dateOfBirth;
        }

        try {
            await authApi.post('/auth/users/', payload);
        } catch (error: any) {
            console.error('Registration error response:', error.response?.data);
            throw error;
        }
        // Auto login
        await login(username, password);
    };

    const logout = () => {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                isAuthenticated: !!user,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
