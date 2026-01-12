// file: /app/decks/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/axios';
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
    Clock,
    Upload,
    ChevronDown,
    ChevronUp,
    Lightbulb,
    Tag,
    FileText,
    Youtube
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
    hint?: string;
    difficulty?: 'basic' | 'intermediate' | 'advanced';
    tags?: string[];
    next_review_at?: string;
}

interface Source {
    id: number;
    url: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    created_at: string;
}

const DIFFICULTY_STYLES = {
    basic: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Basic' },
    intermediate: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Intermediate' },
    advanced: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Advanced' },
};

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
    const [expandedCard, setExpandedCard] = useState<number | null>(null);
    const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);

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

    // Filter cards by difficulty
    const filteredCards = filterDifficulty
        ? cards.filter(c => c.difficulty === filterDifficulty)
        : cards;

    // Count cards by difficulty
    const difficultyCounts = {
        basic: cards.filter(c => c.difficulty === 'basic').length,
        intermediate: cards.filter(c => c.difficulty === 'intermediate').length,
        advanced: cards.filter(c => c.difficulty === 'advanced').length,
    };

    // Detect URL type
    function getUrlIcon(url: string) {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return <Youtube size={14} className="text-red-400" />;
        }
        return <LinkIcon size={14} />;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Brain size={32} className="text-[var(--accent)]" />
                </motion.div>
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
        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 transition-colors"
                    >
                        <ArrowLeft size={18} /> Back to Decks
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-muted)] flex items-center justify-center">
                            <Brain size={28} className="text-[var(--accent)]" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">{deck.name}</h1>
                            <p className="text-[var(--text-secondary)]">
                                {deck.description || 'No description'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href={`/review/${deckId}`}>
                        <Button variant="primary" icon={<Zap size={18} />}>
                            Start Review
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        icon={<Trash2 size={18} />}
                        onClick={handleDeleteDeck}
                        className="text-[var(--error)] hover:bg-[var(--error)]/10"
                    >
                        Delete
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <p className="text-2xl font-bold text-[var(--accent)]">{cards.length}</p>
                    <p className="text-sm text-[var(--text-secondary)]">Total Cards</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <p className="text-2xl font-bold text-[var(--warning)]">
                        {cards.filter(c => new Date(c.next_review_at || 0) <= new Date()).length}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">Due Today</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <p className="text-2xl font-bold text-green-400">{difficultyCounts.basic}</p>
                    <p className="text-sm text-[var(--text-secondary)]">Basic</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <p className="text-2xl font-bold text-yellow-400">{difficultyCounts.intermediate}</p>
                    <p className="text-sm text-[var(--text-secondary)]">Intermediate</p>
                </div>
            </div>

            {/* Ingest Section */}
            <GlassCard hoverEffect={false}>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                    <Upload size={20} className="text-[var(--accent)]" />
                    Add Content
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Paste a URL (YouTube, articles, documentation) to generate flashcards with AI
                </p>
                <form onSubmit={handleIngestUrl} className="flex gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder="https://youtube.com/watch?v=... or any URL"
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
                    <p className="text-[var(--error)] text-sm mt-2">{ingestError}</p>
                )}

                {/* Source Status */}
                <AnimatePresence>
                    {sources.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 space-y-2"
                        >
                            {sources.map(source => (
                                <div
                                    key={source.id}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                                >
                                    <div className="flex items-center gap-2 text-sm truncate max-w-md">
                                        {getUrlIcon(source.url)}
                                        <span className="truncate">{source.url}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {source.status === 'PROCESSING' && (
                                            <span className="flex items-center gap-1 text-yellow-400 text-sm">
                                                <Clock size={14} className="animate-pulse" /> Generating...
                                            </span>
                                        )}
                                        {source.status === 'COMPLETED' && (
                                            <span className="flex items-center gap-1 text-green-400 text-sm">
                                                <CheckCircle size={14} /> Done
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>

            {/* Cards List */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        Cards ({filteredCards.length})
                    </h2>

                    {/* Difficulty Filter */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterDifficulty(null)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filterDifficulty
                                ? 'bg-[var(--accent)] text-white'
                                : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]'
                                }`}
                        >
                            All
                        </button>
                        {(['basic', 'intermediate', 'advanced'] as const).map(d => (
                            <button
                                key={d}
                                onClick={() => setFilterDifficulty(d)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterDifficulty === d
                                    ? `${DIFFICULTY_STYLES[d].bg} ${DIFFICULTY_STYLES[d].text}`
                                    : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]'
                                    }`}
                            >
                                {DIFFICULTY_STYLES[d].label} ({difficultyCounts[d]})
                            </button>
                        ))}
                    </div>
                </div>

                {filteredCards.length === 0 ? (
                    <GlassCard hoverEffect={false} className="text-center py-16">
                        <div className="w-16 h-16 rounded-full bg-[var(--accent-muted)] flex items-center justify-center mx-auto mb-4">
                            <FileText size={32} className="text-[var(--accent)]" />
                        </div>
                        <p className="text-[var(--text-secondary)]">
                            {cards.length === 0
                                ? "No cards yet. Add a URL above to generate flashcards with AI!"
                                : "No cards match this filter."
                            }
                        </p>
                    </GlassCard>
                ) : (
                    <div className="space-y-3">
                        {filteredCards.map((card, index) => {
                            const isExpanded = expandedCard === card.id;
                            const diffStyle = card.difficulty ? DIFFICULTY_STYLES[card.difficulty] : null;

                            return (
                                <motion.div
                                    key={card.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                >
                                    <div
                                        className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] cursor-pointer hover:border-[var(--glass-border-hover)] transition-colors"
                                        onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                                    >
                                        {/* Card Header */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {/* Difficulty Badge */}
                                                    {diffStyle && (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${diffStyle.bg} ${diffStyle.text}`}>
                                                            {diffStyle.label}
                                                        </span>
                                                    )}

                                                    {/* Tags */}
                                                    {card.tags && card.tags.length > 0 && (
                                                        <div className="flex items-center gap-1 text-[var(--text-muted)]">
                                                            <Tag size={12} />
                                                            <span className="text-xs">{card.tags.slice(0, 2).join(', ')}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-sm text-[var(--text-primary)] line-clamp-2">{card.front}</p>
                                            </div>

                                            <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                        </div>

                                        {/* Expanded Content */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
                                                        <p className="text-xs text-[var(--text-muted)] mb-1 uppercase">Answer</p>
                                                        <p className="text-sm text-[var(--text-secondary)]">{card.back}</p>

                                                        {card.hint && (
                                                            <div className="mt-3 p-3 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/20">
                                                                <div className="flex items-center gap-2 text-[var(--warning)] text-xs mb-1">
                                                                    <Lightbulb size={14} />
                                                                    <span className="font-medium">Hint</span>
                                                                </div>
                                                                <p className="text-sm text-[var(--text-secondary)]">{card.hint}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
