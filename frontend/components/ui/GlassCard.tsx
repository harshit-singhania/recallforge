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
}

export default function GlassCard({ children, className, onClick, hoverEffect = true }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={onClick}
            className={cn(
                "glass rounded-2xl p-6",
                hoverEffect && "cursor-pointer hover:bg-white/5 active:scale-[0.99] transition-all duration-200",
                className
            )}
        >
            {children}
        </motion.div>
    );
}
