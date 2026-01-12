// file: /app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Check } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import { useAuth } from '@/context/AuthContext';

const benefits = [
    'AI-powered flashcard generation from any content',
    'Scientifically-proven spaced repetition',
    'Import from YouTube, PDFs, and web articles',
    'Track progress and optimize your learning',
];

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await register(username, email, password, dateOfBirth || undefined);
            router.push('/');
        } catch (err: any) {
            console.error(err);
            setError('Registration failed. Username or email might be taken.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Hero */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[var(--surface)] flex-col justify-between p-12">
                {/* Background decoration - smoother gradients */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-[var(--info)]/5" />
                    <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-[var(--accent)]/8 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] bg-[var(--info)]/8 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 space-y-10">
                    {/* Branding - integrated with content */}
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
                            Start mastering<br />
                            <span className="text-[var(--accent)]">anything</span> today
                        </h1>
                        <p className="text-lg text-[var(--text-secondary)] max-w-md">
                            Join thousands of learners who retain more knowledge with less effort.
                        </p>
                    </div>

                    <ul className="space-y-4">
                        {benefits.map((benefit, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="flex items-start gap-3"
                            >
                                <div className="w-6 h-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check size={14} className="text-[var(--accent)]" />
                                </div>
                                <span className="text-[var(--text-secondary)]">{benefit}</span>
                            </motion.li>
                        ))}
                    </ul>
                </div>

                <div className="relative z-10">
                    <p className="text-sm text-[var(--text-muted)]">
                        Trusted by students, professionals, and lifelong learners
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
                            Create your account
                        </h2>
                        <p className="text-[var(--text-secondary)]">
                            Get started for free. No credit card required.
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
                            label="Email"
                            type="email"
                            placeholder="john@example.com"
                            icon={<Mail size={18} className="text-[var(--accent)]" />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <DatePicker
                            label="Date of Birth"
                            value={dateOfBirth}
                            onChange={setDateOfBirth}
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

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            icon={!isLoading && <ArrowRight size={18} />}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
                        By signing up, you agree to our{' '}
                        <Link href="#" className="text-[var(--accent)] hover:underline">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="#" className="text-[var(--accent)] hover:underline">
                            Privacy Policy
                        </Link>
                    </p>

                    <div className="mt-8 pt-6 border-t border-[var(--glass-border)] text-center">
                        <p className="text-[var(--text-secondary)]">
                            Already have an account?{' '}
                            <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
