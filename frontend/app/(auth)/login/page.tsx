// file: /app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

import { useAuth } from '@/context/AuthContext';

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
            // Only log if it's not a 401 (Unauthorized)
            if (err.response?.status !== 401) {
                console.error(err);
            }
            setError('Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <GlassCard className="w-full max-w-md" hoverEffect={false}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold">Welcome back</h2>
                    <p className="text-[var(--text-secondary)] text-sm">Enter your credentials to access your notes.</p>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Input
                    label="Username"
                    placeholder="student"
                    icon={<User size={18} />}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                    icon={!isLoading && <ArrowRight />}
                    disabled={isLoading}
                >
                    {isLoading ? 'Authenticating...' : 'Sign In'}
                </Button>

                <div className="text-center text-sm text-[var(--text-secondary)]">
                    New here?{' '}
                    <Link href="/register" className="text-[var(--accent)] hover:underline font-medium">
                        Create an account
                    </Link>
                </div>
            </form>
        </GlassCard>
    );
}
