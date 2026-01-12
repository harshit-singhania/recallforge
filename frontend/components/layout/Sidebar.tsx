// file: /components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid,
    Library,
    Zap,
    Settings,
    LogOut,
    User,
    Sun,
    Moon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { clsx } from 'clsx';

const navItems = [
    { label: 'Dashboard', icon: LayoutGrid, href: '/' },
    { label: 'My Decks', icon: Library, href: '/decks' },
    { label: 'Study Session', icon: Zap, href: '/review' },
    { label: 'Profile', icon: User, href: '/profile' },
    { label: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.aside
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed left-0 top-0 h-screen w-64 bg-[var(--surface)] border-r border-[var(--border-subtle)] z-50 flex flex-col"
        >
            {/* Brand */}
            <div className="p-6 flex items-center gap-3">
                <div className="relative w-10 h-10">
                    <Image
                        src="/logo.png"
                        alt="RecallForge"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <span className="font-semibold text-lg tracking-tight text-[var(--text-primary)]">RecallForge</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-1 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                    isActive
                                        ? "text-[var(--text-primary)] bg-[var(--accent-muted)]"
                                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-muted)]"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--accent)] rounded-r-full"
                                    />
                                )}
                                <item.icon
                                    size={20}
                                    className={clsx(
                                        "shrink-0",
                                        isActive ? "text-[var(--accent)]" : "group-hover:text-[var(--accent)] transition-colors"
                                    )}
                                />
                                <span className="font-medium text-sm">{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 space-y-1 border-t border-[var(--border-subtle)]">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-muted)] transition-all duration-200"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    <span className="font-medium text-sm">
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                </button>

                {/* Sign Out */}
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-[var(--text-secondary)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </div>
        </motion.aside>
    );
}
