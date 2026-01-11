// file: /app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Sparkles } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await register(username, email, password);
            router.push('/'); // Registration includes auto-login, go to home
        } catch (err: any) {
            console.error(err);
            setError('Registration failed. Username or email might be taken.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <GlassCard className="w-full max-w-md" hoverEffect={false}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold">Join RecallForge</h2>
                    <p className="text-[var(--text-secondary)] text-sm">Start your AI-powered learning journey.</p>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Input
                    label="Username"
                    placeholder="johndoe"
                    icon={<User size={18} />}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <Input
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    icon={<Mail size={18} />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock size={18} />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    icon={!isLoading && <Sparkles />}
                    disabled={isLoading}
                >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <div className="text-center text-sm text-[var(--text-secondary)]">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
                        Sign in
                    </Link>
                </div>
            </form>
        </GlassCard>
    );
}
