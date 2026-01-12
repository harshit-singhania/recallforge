'use client';

import { useState, useEffect, useRef } from 'react';
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
    ChevronDown,
    Plus
} from 'lucide-react';

const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/decks', label: 'My Decks', icon: Layers },
    { href: '/review', label: 'Study', icon: PlayCircle },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[var(--background)]/95 backdrop-blur-xl">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
                <div className="flex items-center h-16">

                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-3 group shrink-0">
                        <div className="relative w-10 h-10 transition-transform duration-200 group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="RecallForge"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-lg font-semibold text-[var(--text-primary)] tracking-tight hidden sm:block">
                            RecallForge
                        </span>
                    </Link>

                    {/* Spacer */}
                    <div className="w-12 lg:w-16" />

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${active
                                            ? 'text-[var(--text-primary)] bg-white/10'
                                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
                                        }`}
                                >
                                    <Icon size={17} strokeWidth={active ? 2.5 : 2} />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Flexible Spacer */}
                    <div className="flex-1" />

                    {/* Search Bar (Desktop) */}
                    <div className="hidden lg:flex items-center mr-6">
                        <div className="relative group">
                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--text-secondary)] transition-colors"
                                size={16}
                            />
                            <input
                                type="text"
                                placeholder="Search decks, cards..."
                                className="w-72 pl-11 pr-16 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:bg-white/8 focus:border-[var(--accent)]/40 transition-all duration-200"
                            />
                            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] text-[var(--text-muted)] bg-white/5 rounded-md border border-white/10 font-medium">
                                ⌘K
                            </kbd>
                        </div>
                    </div>

                    {/* Actions Section */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                {/* Create Button */}
                                <Link href="/decks/new" className="hidden sm:block">
                                    <Button size="sm" variant="primary" icon={<Plus size={16} />}>
                                        Create
                                    </Button>
                                </Link>

                                {/* User Menu */}
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 py-1.5 px-2 rounded-full hover:bg-white/5 transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-emerald-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-[var(--accent)]/20">
                                            {user.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <ChevronDown
                                            size={14}
                                            className={`text-[var(--text-muted)] transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                                transition={{ duration: 0.12 }}
                                                className="absolute right-0 mt-3 w-64 rounded-2xl bg-[var(--surface)] border border-white/10 shadow-2xl overflow-hidden"
                                            >
                                                {/* User Info */}
                                                <div className="p-4 bg-gradient-to-br from-white/5 to-transparent">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--accent)] to-emerald-600 flex items-center justify-center text-white font-semibold shadow-lg">
                                                            {user.username?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                                                {user.username}
                                                            </p>
                                                            <p className="text-xs text-[var(--text-muted)] truncate">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="p-2">
                                                    <Link
                                                        href="/profile"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors"
                                                    >
                                                        <User size={16} />
                                                        <span>Profile</span>
                                                    </Link>
                                                    <Link
                                                        href="/settings"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors"
                                                    >
                                                        <Settings size={16} />
                                                        <span>Settings</span>
                                                    </Link>
                                                </div>

                                                {/* Logout */}
                                                <div className="p-2 border-t border-white/5">
                                                    <button
                                                        onClick={() => {
                                                            logout();
                                                            setIsUserMenuOpen(false);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <LogOut size={16} />
                                                        <span>Log out</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            /* Auth Buttons for logged out users */
                            <div className="hidden sm:flex items-center gap-3">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">
                                        Log in
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="primary" size="sm">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2.5 rounded-xl hover:bg-white/5 text-[var(--text-secondary)] transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
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
                        className="md:hidden border-t border-white/5 overflow-hidden bg-[var(--background)]"
                    >
                        <div className="px-5 py-5 space-y-2">
                            {/* Mobile Search */}
                            <div className="relative mb-5">
                                <Search
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                                    size={16}
                                />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/40"
                                />
                            </div>

                            {/* Mobile Nav Links */}
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const active = isActive(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-medium transition-colors ${active
                                                ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                                                : 'text-[var(--text-secondary)] hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}

                            {/* Mobile Auth */}
                            {!user && (
                                <div className="pt-5 mt-3 border-t border-white/5 flex flex-col gap-3">
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="ghost" size="lg" className="w-full">
                                            Log in
                                        </Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="primary" size="lg" className="w-full">
                                            Get Started
                                        </Button>
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
