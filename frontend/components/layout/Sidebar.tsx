// file: /components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid,
    Library,
    Zap,
    Settings,
    LogOut,
    Brain,
    User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';

const navItems = [
    { label: 'Dashboard', icon: LayoutGrid, href: '/' },
    { label: 'My Decks', icon: Library, href: '/decks' }, // Placeholder route
    { label: 'Study Session', icon: Zap, href: '/study' }, // Placeholder route
    { label: 'Profile', icon: User, href: '/profile' }, // Placeholder route
    { label: 'Settings', icon: Settings, href: '/settings' }, // Placeholder route
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <motion.aside
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed left-0 top-0 h-screen w-64 glass border-r border-white/10 z-50 flex flex-col"
        >
            {/* Brand */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[image:var(--accent-gradient)] flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Brain className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-lg tracking-tight">RecallForge</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-2 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "text-white bg-white/10 shadow-inner border border-white/5"
                                        : "text-[var(--text-secondary)] hover:text-white hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)] rounded-l-xl"
                                    />
                                )}
                                <item.icon size={20} className={clsx(isActive ? "text-[var(--accent)]" : "group-hover:text-[var(--accent-primary)] transition-colors")} />
                                <span className="font-medium">{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </motion.aside>
    );
}
