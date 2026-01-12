// file: /app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Sparkles } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const features = [
    'Pick up right where you left off',
    'Your decks are synced and ready',
    'Smart reviews waiting for you',
];

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login(username, password);
            router.push('/');
        } catch (err: any) {
            if (err.response?.status !== 401) {
                console.error(err);
            }
            setError('Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Hero */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[var(--surface)] flex-col justify-between p-12">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-[var(--info)]/5" />
                    <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-[var(--accent)]/8 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] bg-[var(--info)]/8 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 space-y-10">
                    {/* Branding */}
                    <Link href="/" className="inline-flex items-center gap-4 group">
                        <div className="relative w-14 h-14 transition-transform group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="RecallForge"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-2xl font-semibold text-[var(--text-primary)] opacity-90">
                            RecallForge
                        </span>
                    </Link>

                    <div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-[var(--text-primary)] leading-tight mb-4">
                            Welcome back,<br />
                            <span className="text-[var(--accent)]">learner</span>
                        </h1>
                        <p className="text-lg text-[var(--text-secondary)] max-w-md">
                            Your knowledge is waiting. Let's continue building your memory.
                        </p>
                    </div>

                    <ul className="space-y-4">
                        {features.map((feature, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-6 h-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0">
                                    <Sparkles size={12} className="text-[var(--accent)]" />
                                </div>
                                <span className="text-[var(--text-secondary)]">{feature}</span>
                            </motion.li>
                        ))}
                    </ul>
                </div>

                <div className="relative z-10">
                    <p className="text-sm text-[var(--text-muted)]">
                        Secure login with encrypted credentials
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-[var(--background)]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="relative w-10 h-10">
                            <Image
                                src="/logo.png"
                                alt="RecallForge"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-xl font-bold text-[var(--text-primary)]">
                            RecallForge
                        </span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-2">
                            Sign in to your account
                        </h2>
                        <p className="text-[var(--text-secondary)]">
                            Enter your credentials to continue learning
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Username"
                            placeholder="johndoe"
                            icon={<User size={18} className="text-[var(--accent)]" />}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            icon={<Lock size={18} className="text-[var(--accent)]" />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <div className="flex items-center justify-end">
                            <Link href="#" className="text-sm text-[var(--accent)] hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            icon={!isLoading && <ArrowRight size={18} />}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[var(--glass-border)] text-center">
                        <p className="text-[var(--text-secondary)]">
                            New to RecallForge?{' '}
                            <Link href="/register" className="text-[var(--accent)] hover:underline font-medium">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
