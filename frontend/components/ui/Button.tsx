// file: /components/ui/Button.tsx
'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: ReactNode;
}

export default function Button({
    children,
    className,
    variant = 'primary',
    size = 'md',
    icon,
    type = 'button',
    disabled,
    ...props
}: ButtonProps) {

    const variants = {
        primary: "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm hover:shadow-md",
        secondary: "bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] border border-[var(--border-default)]",
        ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-muted)]",
        danger: "bg-[var(--error)] text-white hover:brightness-110"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm gap-1.5",
        md: "px-4 py-2 text-sm gap-2",
        lg: "px-6 py-3 text-base gap-2",
    };

    return (
        <motion.button
            whileTap={{ scale: disabled ? 1 : 0.97 }}
            whileHover={{ scale: disabled ? 1 : 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            type={type}
            disabled={disabled}
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
        </motion.button>
    );
}
