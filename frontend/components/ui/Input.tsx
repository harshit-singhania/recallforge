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
    error?: string;
}

export default function Input({
    label,
    icon,
    className,
    wrapperClassName,
    error,
    ...props
}: InputProps) {
    return (
        <div className={cn("space-y-1.5", wrapperClassName)}>
            {label && (
                <label className="text-sm font-medium text-[var(--text-secondary)] ml-0.5">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors duration-200">
                        {icon}
                    </div>
                )}
                <motion.input
                    initial={false}
                    whileFocus={{ scale: 1.005 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={cn(
                        "w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-2.5 px-3",
                        "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
                        "outline-none transition-all duration-200",
                        "focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--input-focus)]",
                        icon && "pl-10",
                        error && "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/20",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-[var(--error)] ml-0.5">{error}</p>
            )}
        </div>
    );
}
