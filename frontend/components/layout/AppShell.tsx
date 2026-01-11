// file: /components/layout/AppShell.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();

    // Don't show sidebar on auth pages even if logged in (edge case) or strictly login/register
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

    if (loading) return null; // Or a splash screen

    if (user && !isAuthPage) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 ml-64 min-h-screen relative">
                    {/* Background Ambience for Dashboard */}
                    <div className="fixed inset-0 bg-[#050505] -z-20 pointer-events-none" />
                    <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            {children}
        </div>
    );
}
