"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";

interface AuthContextType {
    user: any;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
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
                const res = await api.get('/auth/users/me/');
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
        const res = await api.post('/auth/jwt/create/', { username, password });
        const { access, refresh } = res.data;
        Cookies.set('accessToken', access);
        Cookies.set('refreshToken', refresh);

        // Fetch user details immediately
        const userRes = await api.get('/auth/users/me/');
        setUser(userRes.data);
    };

    const register = async (username: string, email: string, password: string) => {
        await api.post('/auth/users/', { username, email, password });
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
