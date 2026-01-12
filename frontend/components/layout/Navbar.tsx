'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import {
    Search,
    Menu,
    X,
    Home,
    Layers,
    PlayCircle,
    User,
    Settings,
    LogOut,
    ChevronDown
} from 'lucide-react';

const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/decks', label: 'Decks', icon: Layers },
    { href: '/review', label: 'Review', icon: PlayCircle },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-[var(--glass-border)] bg-[var(--glass-bg)]/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-9 h-9 transition-transform group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="RecallForge"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-xl font-bold text-[var(--text-primary)] hidden sm:block">
                            RecallForge
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                                            ? 'bg-[var(--accent-muted)] text-[var(--accent)]'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden lg:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                            <input
                                type="text"
                                placeholder="Search decks, cards..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-[var(--glass-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all"
                            />
                            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs text-[var(--text-muted)] bg-white/5 rounded border border-[var(--glass-border)]">
                                ⌘K
                            </kbd>
                        </div>
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            /* User Menu */
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--info)] flex items-center justify-center text-white font-semibold text-sm">
                                        {user.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={`text-[var(--text-muted)] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--surface)] border border-[var(--glass-border)] shadow-xl overflow-hidden"
                                        >
                                            <div className="p-3 border-b border-[var(--glass-border)]">
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">{user.username}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                                            </div>
                                            <div className="p-1">
                                                <Link
                                                    href="/profile"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors"
                                                >
                                                    <User size={16} /> Profile
                                                </Link>
                                                <Link
                                                    href="/settings"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors"
                                                >
                                                    <Settings size={16} /> Settings
                                                </Link>
                                                <button
                                                    onClick={() => { logout(); setIsUserMenuOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <LogOut size={16} /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            /* Auth Buttons */
                            <div className="hidden sm:flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">Log in</Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="primary" size="sm">Get Started</Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)]"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-t border-[var(--glass-border)] overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {/* Mobile Search */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-[var(--glass-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                                />
                            </div>

                            {/* Mobile Nav Links */}
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive(link.href)
                                                ? 'bg-[var(--accent-muted)] text-[var(--accent)]'
                                                : 'text-[var(--text-secondary)] hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        {link.label}
                                    </Link>
                                );
                            })}

                            {/* Mobile Auth */}
                            {!user && (
                                <div className="pt-4 border-t border-[var(--glass-border)] flex flex-col gap-2">
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="ghost" size="lg" className="w-full">Log in</Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="primary" size="lg" className="w-full">Get Started</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
