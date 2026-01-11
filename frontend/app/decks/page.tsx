// file: /app/decks/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import CreateDeckModal from '@/components/CreateDeckModal';
import {
    Brain,
    Plus,
    Search,
    Filter,
    Loader2,
    ArrowLeft
} from 'lucide-react';

interface Deck {
    id: number;
    name: string;
    description: string;
    card_count?: number;
    created_at?: string;
}

export default function MyDecksPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            api.get('/api/v1/decks/')
                .then(res => {
                    setDecks(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch decks', err);
                    setLoading(false);
                });
        }
    }, [user, authLoading, router]);

    const handleDeckCreated = (newDeck: Deck) => {
        setDecks(prev => [...prev, newDeck]);
    };

    const filteredDecks = decks.filter(deck =>
        deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deck.description && deck.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-[var(--text-secondary)]">
                <Loader2 className="animate-spin mr-2" /> Loading your decks...
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 transition-colors"
                    >
                        <ArrowLeft size={18} /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold">My Decks</h1>
                    <p className="text-[var(--text-secondary)]">
                        {decks.length} deck{decks.length !== 1 ? 's' : ''} in your collection
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus />}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    New Deck
                </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />
                    <input
                        type="text"
                        placeholder="Search decks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[var(--glass-bg)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all"
                    />
                </div>
                <Button variant="ghost" icon={<Filter size={18} />}>
                    Filter
                </Button>
            </div>

            {/* Decks Grid */}
            {filteredDecks.length === 0 ? (
                <GlassCard hoverEffect={false} className="text-center py-16">
                    {searchQuery ? (
                        <>
                            <p className="text-[var(--text-secondary)] mb-2">No decks match your search</p>
                            <Button variant="ghost" onClick={() => setSearchQuery('')}>
                                Clear search
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                                <Brain size={32} className="text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No decks yet</h3>
                            <p className="text-[var(--text-secondary)] mb-6">
                                Create your first deck to start learning with AI-powered flashcards.
                            </p>
                            <Button
                                variant="primary"
                                icon={<Plus />}
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                Create Your First Deck
                            </Button>
                        </>
                    )}
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDecks.map(deck => (
                        <Link key={deck.id} href={`/decks/${deck.id}`}>
                            <GlassCard className="h-48 flex flex-col justify-between cursor-pointer">
                                <div>
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mb-3 text-indigo-400">
                                        <Brain size={20} />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-1 line-clamp-1">{deck.name}</h3>
                                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                                        {deck.description || 'No description'}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[var(--text-muted)]">
                                        {deck.card_count !== undefined ? `${deck.card_count} cards` : ''}
                                    </span>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            router.push(`/review/${deck.id}`);
                                        }}
                                    >
                                        Review
                                    </Button>
                                </div>
                            </GlassCard>
                        </Link>
                    ))}

                    {/* Create New Card */}
                    <GlassCard
                        hoverEffect={false}
                        className="h-48 flex flex-col items-center justify-center border-dashed border-[var(--border-highlight)] bg-transparent cursor-pointer"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-3">
                            <Plus size={24} className="text-[var(--accent)]" />
                        </div>
                        <p className="font-medium text-[var(--text-secondary)]">Create New Deck</p>
                    </GlassCard>
                </div>
            )}

            {/* Create Deck Modal */}
            <CreateDeckModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={handleDeckCreated}
            />
        </div>
    );
}
