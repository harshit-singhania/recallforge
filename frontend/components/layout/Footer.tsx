'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';

const footerLinks = {
    product: {
        title: 'Product',
        links: [
            { label: 'Flashcards', href: '/decks' },
            { label: 'Spaced Repetition', href: '#features' },
            { label: 'AI Generation', href: '#features' },
            { label: 'Study Modes', href: '#' },
        ],
    },
    resources: {
        title: 'Resources',
        links: [
            { label: 'Help Center', href: '#' },
            { label: 'Blog', href: '#' },
            { label: 'Changelog', href: '#' },
            { label: 'API Docs', href: '#' },
        ],
    },
    company: {
        title: 'Company',
        links: [
            { label: 'About', href: '#' },
            { label: 'Careers', href: '#' },
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
        ],
    },
};

const socialLinks = [
    {
        label: 'GitHub',
        href: 'https://github.com/harshit-singhania',
        icon: Github,
    },
    {
        label: 'LinkedIn',
        href: 'https://linkedin.com/in/h-singhania',
        icon: Linkedin,
    },
    {
        label: 'Email',
        href: 'mailto:harshitsinghaniawork@gmail.com',
        icon: Mail,
    },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-[var(--surface)] border-t border-[var(--glass-border)]">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6 py-16">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-6">
                            <div className="relative w-10 h-10">
                                <Image
                                    src="/logo.png"
                                    alt="RecallForge"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xl font-bold text-[var(--text-primary)]">
                                RecallForge
                            </span>
                        </Link>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 max-w-xs">
                            Transform any content into smart flashcards with AI.
                            Master anything, forget nothing.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-xl bg-white/5 border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent-muted)] transition-all"
                                        aria-label={social.label}
                                    >
                                        <Icon size={18} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {Object.values(footerLinks).map((column) => (
                        <div key={column.title}>
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                                {column.title}
                            </h3>
                            <ul className="space-y-3">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-[var(--glass-border)]">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-[var(--text-muted)] order-2 md:order-1">
                            © {currentYear} RecallForge. All rights reserved.
                        </p>

                        <div className="flex items-center gap-1 text-sm text-[var(--text-muted)] order-1 md:order-2">
                            <span>Made with</span>
                            <Heart size={14} className="text-red-500 fill-red-500 mx-1" />
                            <span>by</span>
                            <a
                                href="https://github.com/harshit-singhania"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--accent)] hover:underline ml-1"
                            >
                                Harshit Singhania
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
