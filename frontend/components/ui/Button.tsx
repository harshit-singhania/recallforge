
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
    variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
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
    ...props
}: ButtonProps) {

    const variants = {
        primary: "bg-[image:var(--accent-gradient)] text-white shadow-[0_0_20px_var(--accent-glow)] hover:brightness-110 border border-white/10 hover:shadow-[0_0_25px_var(--accent-glow)]",
        secondary: "bg-[var(--surface-raised)] text-[var(--text-primary)] hover:bg-white/10 border border-[var(--border-subtle)]",
        ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5",
        glass: "glass text-[var(--text-primary)] hover:bg-white/10"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-sm",
        lg: "px-8 py-4 text-base",
    };

    return (
        <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            type={type}
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-black",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {icon && <span className="w-4 h-4">{icon}</span>}
            {children}
        </motion.button>
    );
}
