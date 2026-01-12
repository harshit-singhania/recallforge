// file: /components/ui/GlassCard.tsx
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hoverEffect?: boolean;
    animate?: boolean;
}

export default function GlassCard({
    children,
    className,
    onClick,
    hoverEffect = true,
    animate = true
}: GlassCardProps) {
    const Component = animate ? motion.div : 'div';

    const baseClasses = cn(
        "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6",
        "transition-all duration-200",
        hoverEffect && "cursor-pointer hover:border-[var(--glass-border-hover)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5",
        className
    );

    if (animate) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={onClick}
                className={baseClasses}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div onClick={onClick} className={baseClasses}>
            {children}
        </div>
    );
}
