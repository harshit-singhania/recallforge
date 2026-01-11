// file: /app/review/[deckId]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import {
    ArrowLeft,
    RotateCcw,
    Loader2,
    CheckCircle,
    Brain,
    Zap
} from 'lucide-react';

interface Card {
    id: number;
    front: string;
    back: string;
    visual_payload?: string;
}

interface RatingOption {
    value: number;
    label: string;
    color: string;
    description: string;
}

const RATING_OPTIONS: RatingOption[] = [
    { value: 0, label: 'Again', color: 'bg-red-500', description: 'Forgot completely' },
    { value: 2, label: 'Hard', color: 'bg-orange-500', description: 'Struggled to recall' },
    { value: 3, label: 'Good', color: 'bg-green-500', description: 'Recalled with effort' },
    { value: 5, label: 'Easy', color: 'bg-blue-500', description: 'Instant recall' },
];

export default function ReviewPage() {
    const params = useParams();
    const router = useRouter();
    const deckId = params.deckId as string;

    const [card, setCard] = useState<Card | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isRating, setIsRating] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [reviewCount, setReviewCount] = useState(0);
    const [deckName, setDeckName] = useState('');

    const fetchNextCard = useCallback(async () => {
        setLoading(true);
        setIsFlipped(false);

        try {
            const queryParam = deckId && deckId !== 'all' ? `?deck=${deckId}` : '';
            const res = await api.get(`/api/v1/review/next/${queryParam}`);

            if (res.data.message === 'No cards due for review') {
                setCard(null);
                setCompleted(true);
            } else {
                setCard(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch next card', err);
            setCard(null);
            setCompleted(true);
        } finally {
            setLoading(false);
        }
    }, [deckId]);

    useEffect(() => {
        fetchNextCard();

        // Fetch deck name if reviewing specific deck
        if (deckId && deckId !== 'all') {
            api.get(`/api/v1/decks/${deckId}/`)
                .then(res => setDeckName(res.data.name))
                .catch(() => { });
        }
    }, [deckId, fetchNextCard]);

    async function handleRate(rating: number) {
        if (!card) return;

        setIsRating(true);

        try {
            await api.post(`/api/v1/review/${card.id}/rate/`, { rating });
            setReviewCount(prev => prev + 1);
            fetchNextCard();
        } catch (err) {
            console.error('Failed to submit rating', err);
        } finally {
            setIsRating(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-[var(--text-secondary)]">
                <Loader2 className="animate-spin mr-2" /> Loading cards...
            </div>
        );
    }

    if (completed) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-400" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">All Done! 🎉</h1>
                    <p className="text-[var(--text-secondary)] mb-2">
                        {reviewCount > 0
                            ? `You reviewed ${reviewCount} card${reviewCount > 1 ? 's' : ''} this session.`
                            : 'No cards are due for review right now.'
                        }
                    </p>
                    <p className="text-[var(--text-muted)] text-sm mb-8">
                        Come back later to review more cards as they become due.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/">
                            <Button variant="ghost" icon={<ArrowLeft />}>
                                Back to Decks
                            </Button>
                        </Link>
                        <Button
                            variant="primary"
                            icon={<RotateCcw />}
                            onClick={() => {
                                setCompleted(false);
                                setReviewCount(0);
                                fetchNextCard();
                            }}
                        >
                            Review Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col p-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 max-w-4xl mx-auto w-full">
                <Link
                    href={deckId && deckId !== 'all' ? `/decks/${deckId}` : '/'}
                    className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <ArrowLeft size={18} /> Exit Review
                </Link>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Brain size={18} className="text-[var(--accent)]" />
                        <span>{deckName || 'Quick Study'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Zap size={18} className="text-yellow-400" />
                        <span>{reviewCount} reviewed</span>
                    </div>
                </div>
            </header>

            {/* Flashcard */}
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-2xl">
                    {/* Card */}
                    <div
                        className="perspective-1000 cursor-pointer mb-8"
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <div
                            className={`relative transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* Front */}
                            <GlassCard
                                hoverEffect={false}
                                className={`min-h-[300px] flex flex-col items-center justify-center p-8 text-center transition-opacity duration-300 ${isFlipped ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'}`}
                            >
                                <p className="text-xs text-[var(--text-muted)] mb-4">QUESTION</p>
                                <p className="text-2xl font-medium leading-relaxed">{card?.front}</p>
                                <p className="text-[var(--text-muted)] text-sm mt-8">
                                    Click to reveal answer
                                </p>
                            </GlassCard>

                            {/* Back */}
                            <GlassCard
                                hoverEffect={false}
                                className={`min-h-[300px] flex flex-col items-center justify-center p-8 text-center transition-opacity duration-300 ${!isFlipped ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'}`}
                            >
                                <p className="text-xs text-[var(--text-muted)] mb-4">ANSWER</p>
                                <p className="text-xl leading-relaxed text-[var(--text-primary)]">{card?.back}</p>
                            </GlassCard>
                        </div>
                    </div>

                    {/* Rating Buttons - Only show when flipped */}
                    {isFlipped && (
                        <div className="space-y-4 animate-fade-in">
                            <p className="text-center text-[var(--text-secondary)] text-sm">
                                How well did you recall this?
                            </p>
                            <div className="grid grid-cols-4 gap-3">
                                {RATING_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleRate(option.value)}
                                        disabled={isRating}
                                        className={`
                                            p-4 rounded-xl border border-[var(--border-subtle)] 
                                            bg-[var(--glass-bg)] hover:bg-white/10 
                                            transition-all duration-200 
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            group
                                        `}
                                    >
                                        <div className={`w-3 h-3 rounded-full ${option.color} mx-auto mb-2`} />
                                        <p className="font-medium text-sm">{option.label}</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {option.description}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
