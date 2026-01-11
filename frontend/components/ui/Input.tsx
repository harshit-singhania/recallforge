// file: /components/ui/Input.tsx
'use client';

import { InputHTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends HTMLMotionProps<"input"> {
    label?: string;
    icon?: ReactNode;
    wrapperClassName?: string;
}

export default function Input({ label, icon, className, wrapperClassName, ...props }: InputProps) {
    return (
        <div className={cn("space-y-2", wrapperClassName)}>
            {label && (
                <label className="text-xs font-medium text-[var(--text-secondary)] ml-1 uppercase tracking-wide">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--accent)] transition-colors">
                        {icon}
                    </div>
                )}
                <motion.input
                    initial={false}
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={cn(
                        "w-full bg-white/5 border border-[var(--border-subtle)] rounded-xl py-3 px-4 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition-all duration-300",
                        "focus:border-[var(--accent-primary)] focus:bg-white/[0.07] focus:shadow-[0_0_0_1px_var(--accent-primary)]",
                        icon && "pl-10",
                        className
                    )}
                    {...props}
                />
            </div>
        </div>
    );
}
