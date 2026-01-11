// file: /app/decks/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import Input from '@/components/ui/Input';
import {
    ArrowLeft,
    Brain,
    Zap,
    Link as LinkIcon,
    Trash2,
    Loader2,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';

interface Deck {
    id: number;
    name: string;
    description: string;
}

interface Card {
    id: number;
    front: string;
    back: string;
    next_review_at?: string;
}

interface Source {
    id: number;
    url: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    created_at: string;
}

export default function DeckDetailPage() {
    const params = useParams();
    const router = useRouter();
    const deckId = params.id as string;

    const [deck, setDeck] = useState<Deck | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [sources, setSources] = useState<Source[]>([]);
    const [loading, setLoading] = useState(true);
    const [url, setUrl] = useState('');
    const [isIngesting, setIsIngesting] = useState(false);
    const [ingestError, setIngestError] = useState('');

    useEffect(() => {
        async function loadData() {
            try {
                const [deckRes, cardsRes] = await Promise.all([
                    api.get(`/api/v1/decks/${deckId}/`),
                    api.get(`/api/v1/cards/?deck=${deckId}`)
                ]);
                setDeck(deckRes.data);
                setCards(cardsRes.data);
            } catch (err) {
                console.error('Failed to load deck', err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [deckId]);

    async function handleIngestUrl(e: React.FormEvent) {
        e.preventDefault();
        if (!url.trim()) return;

        setIsIngesting(true);
        setIngestError('');

        try {
            const res = await api.post('/api/v1/ingest/', {
                url,
                deck: parseInt(deckId)
            });
            setSources(prev => [res.data, ...prev]);
            setUrl('');
            // Poll for updates
            pollSourceStatus(res.data.id);
        } catch (err: any) {
            console.error(err);
            setIngestError('Failed to process URL. Please try again.');
        } finally {
            setIsIngesting(false);
        }
    }

    async function pollSourceStatus(sourceId: number) {
        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/api/v1/ingest/${sourceId}/`);
                setSources(prev => prev.map(s => s.id === sourceId ? res.data : s));

                if (res.data.status === 'COMPLETED' || res.data.status === 'FAILED') {
                    clearInterval(interval);
                    // Refresh cards if completed
                    if (res.data.status === 'COMPLETED') {
                        const cardsRes = await api.get(`/api/v1/cards/?deck=${deckId}`);
                        setCards(cardsRes.data);
                    }
                }
            } catch (err) {
                clearInterval(interval);
            }
        }, 2000);
    }

    async function handleDeleteDeck() {
        if (!confirm('Are you sure you want to delete this deck? This cannot be undone.')) return;

        try {
            await api.delete(`/api/v1/decks/${deckId}/`);
            router.push('/');
        } catch (err) {
            console.error('Failed to delete deck', err);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-[var(--text-secondary)]">
                <Loader2 className="animate-spin mr-2" /> Loading deck...
            </div>
        );
    }

    if (!deck) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-[var(--text-secondary)]">
                <p className="mb-4">Deck not found</p>
                <Link href="/">
                    <Button variant="primary">Go Home</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 transition-colors"
                    >
                        <ArrowLeft size={18} /> Back to Decks
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Brain size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{deck.name}</h1>
                            <p className="text-[var(--text-secondary)]">
                                {deck.description || 'No description'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href={`/review/${deckId}`}>
                        <Button variant="primary" icon={<Zap />}>
                            Start Review
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        icon={<Trash2 size={18} />}
                        onClick={handleDeleteDeck}
                        className="text-red-400 hover:bg-red-500/10"
                    >
                        Delete
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <GlassCard className="text-center py-6" hoverEffect={false}>
                    <p className="text-3xl font-bold text-[var(--accent)]">{cards.length}</p>
                    <p className="text-sm text-[var(--text-secondary)]">Total Cards</p>
                </GlassCard>
                <GlassCard className="text-center py-6" hoverEffect={false}>
                    <p className="text-3xl font-bold text-green-400">
                        {cards.filter(c => new Date(c.next_review_at || 0) <= new Date()).length || 0}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">Due for Review</p>
                </GlassCard>
                <GlassCard className="text-center py-6" hoverEffect={false}>
                    <p className="text-3xl font-bold text-blue-400">{sources.length}</p>
                    <p className="text-sm text-[var(--text-secondary)]">Sources</p>
                </GlassCard>
            </div>

            {/* Ingest Section */}
            <GlassCard hoverEffect={false}>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <LinkIcon size={20} className="text-[var(--accent)]" />
                    Add Content from URL
                </h2>
                <form onSubmit={handleIngestUrl} className="flex gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder="Paste a URL (article, documentation, etc.)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            icon={<LinkIcon size={18} />}
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isIngesting || !url.trim()}
                    >
                        {isIngesting ? (
                            <>
                                <Loader2 className="animate-spin mr-2" size={18} />
                                Processing...
                            </>
                        ) : (
                            'Generate Cards'
                        )}
                    </Button>
                </form>
                {ingestError && (
                    <p className="text-red-500 text-sm mt-2">{ingestError}</p>
                )}

                {/* Source Status */}
                {sources.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {sources.map(source => (
                            <div
                                key={source.id}
                                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                            >
                                <span className="text-sm truncate max-w-md">{source.url}</span>
                                <div className="flex items-center gap-2">
                                    {source.status === 'PROCESSING' && (
                                        <span className="flex items-center gap-1 text-yellow-400 text-sm">
                                            <Clock size={14} className="animate-pulse" /> Processing
                                        </span>
                                    )}
                                    {source.status === 'COMPLETED' && (
                                        <span className="flex items-center gap-1 text-green-400 text-sm">
                                            <CheckCircle size={14} /> Completed
                                        </span>
                                    )}
                                    {source.status === 'FAILED' && (
                                        <span className="flex items-center gap-1 text-red-400 text-sm">
                                            <XCircle size={14} /> Failed
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>

            {/* Cards List */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Cards ({cards.length})</h2>
                {cards.length === 0 ? (
                    <GlassCard hoverEffect={false} className="text-center py-12 text-[var(--text-secondary)]">
                        No cards yet. Add a URL above to generate flashcards with AI!
                    </GlassCard>
                ) : (
                    <div className="space-y-3">
                        {cards.map(card => (
                            <GlassCard key={card.id} hoverEffect={false} className="p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)] mb-1">FRONT</p>
                                        <p className="text-sm">{card.front}</p>
                                    </div>
                                    <div className="border-l border-[var(--border-subtle)] pl-4">
                                        <p className="text-xs text-[var(--text-muted)] mb-1">BACK</p>
                                        <p className="text-sm text-[var(--text-secondary)]">{card.back}</p>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
