// file: /app/(auth)/layout.tsx
import { ReactNode } from 'react';
import { Brain } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[#050505] -z-20" />
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10" />

            {/* Brand Header */}
            <div className="mb-8 flex flex-col items-center animate-fade-in-up">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 border border-white/10">
                    <Brain className="text-white w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">RecallForge</h1>
                <p className="text-[var(--text-secondary)] text-sm">Design your knowledge.</p>
            </div>

            {children}
        </div>
    );
}
