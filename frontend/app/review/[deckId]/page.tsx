// file: /app/review/[deckId]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import {
    ArrowLeft,
    RotateCcw,
    Loader2,
    CheckCircle,
    Brain,
    Zap,
    Lightbulb,
    Tag,
    ChevronRight
} from 'lucide-react';

interface Card {
    id: number;
    front: string;
    back: string;
    hint?: string;
    difficulty?: 'basic' | 'intermediate' | 'advanced';
    tags?: string[];
    visual_payload?: string;
}

interface RatingOption {
    value: number;
    label: string;
    color: string;
    description: string;
    shortcut: string;
}

const RATING_OPTIONS: RatingOption[] = [
    { value: 0, label: 'Again', color: 'bg-red-500', description: 'Forgot completely', shortcut: '1' },
    { value: 2, label: 'Hard', color: 'bg-orange-500', description: 'Struggled to recall', shortcut: '2' },
    { value: 3, label: 'Good', color: 'bg-green-500', description: 'Recalled with effort', shortcut: '3' },
    { value: 5, label: 'Easy', color: 'bg-blue-500', description: 'Instant recall', shortcut: '4' },
];

const DIFFICULTY_STYLES = {
    basic: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Basic' },
    intermediate: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Intermediate' },
    advanced: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Advanced' },
};

export default function ReviewPage() {
    const params = useParams();
    const router = useRouter();
    const deckId = params.deckId as string;

    const [card, setCard] = useState<Card | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isRating, setIsRating] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [reviewCount, setReviewCount] = useState(0);
    const [deckName, setDeckName] = useState('');

    const fetchNextCard = useCallback(async () => {
        setLoading(true);
        setIsFlipped(false);
        setShowHint(false);

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

        if (deckId && deckId !== 'all') {
            api.get(`/api/v1/decks/${deckId}/`)
                .then(res => setDeckName(res.data.name))
                .catch(() => { });
        }
    }, [deckId, fetchNextCard]);

    // Keyboard shortcuts
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setIsFlipped(f => !f);
            } else if (e.key === 'h' && !isFlipped && card?.hint) {
                setShowHint(s => !s);
            } else if (isFlipped && ['1', '2', '3', '4'].includes(e.key)) {
                const rating = RATING_OPTIONS[parseInt(e.key) - 1];
                if (rating) handleRate(rating.value);
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFlipped, card]);

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

    if (completed) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="w-24 h-24 rounded-full bg-[var(--accent)]/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} className="text-[var(--accent)]" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">
                        Session Complete! 🎉
                    </h1>
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
                            <Button variant="secondary" icon={<ArrowLeft size={18} />}>
                                Back to Decks
                            </Button>
                        </Link>
                        <Button
                            variant="primary"
                            icon={<RotateCcw size={18} />}
                            onClick={() => {
                                setCompleted(false);
                                setReviewCount(0);
                                fetchNextCard();
                            }}
                        >
                            Review Again
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const difficultyStyle = card?.difficulty ? DIFFICULTY_STYLES[card.difficulty] : null;

    return (
        <div className="min-h-screen flex flex-col p-6 lg:p-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 max-w-4xl mx-auto w-full">
                <Link
                    href={deckId && deckId !== 'all' ? `/decks/${deckId}` : '/'}
                    className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <ArrowLeft size={18} /> Exit
                </Link>

                <div className="flex items-center gap-6">
                    {/* Deck Name */}
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Brain size={18} className="text-[var(--accent)]" />
                        <span className="hidden sm:inline">{deckName || 'Quick Study'}</span>
                    </div>

                    {/* Review Count */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-muted)]">
                        <Zap size={16} className="text-[var(--accent)]" />
                        <span className="font-medium text-[var(--text-primary)]">{reviewCount}</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-2xl">
                    {/* Card Metadata */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {/* Difficulty Badge */}
                            {difficultyStyle && (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${difficultyStyle.bg} ${difficultyStyle.text}`}>
                                    {difficultyStyle.label}
                                </span>
                            )}

                            {/* Tags */}
                            {card?.tags && card.tags.length > 0 && (
                                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                                    <Tag size={12} />
                                    <span className="text-xs">{card.tags.slice(0, 2).join(', ')}</span>
                                </div>
                            )}
                        </div>

                        {/* Hint Toggle */}
                        {card?.hint && !isFlipped && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowHint(!showHint);
                                }}
                                className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--warning)] transition-colors"
                            >
                                <Lightbulb size={14} />
                                {showHint ? 'Hide Hint' : 'Show Hint (H)'}
                            </button>
                        )}
                    </div>

                    {/* Flashcard */}
                    <motion.div
                        className="cursor-pointer mb-6"
                        onClick={() => setIsFlipped(!isFlipped)}
                        whileTap={{ scale: 0.98 }}
                    >
                        <AnimatePresence mode="wait">
                            {!isFlipped ? (
                                <motion.div
                                    key="front"
                                    initial={{ rotateY: 180, opacity: 0 }}
                                    animate={{ rotateY: 0, opacity: 1 }}
                                    exit={{ rotateY: -180, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <GlassCard
                                        hoverEffect={false}
                                        animate={false}
                                        className="min-h-[320px] flex flex-col items-center justify-center p-8 text-center"
                                    >
                                        <p className="text-xs text-[var(--text-muted)] mb-6 uppercase tracking-wider">
                                            Question
                                        </p>
                                        <p className="text-xl lg:text-2xl font-medium leading-relaxed text-[var(--text-primary)]">
                                            {card?.front}
                                        </p>

                                        {/* Hint Display */}
                                        <AnimatePresence>
                                            {showHint && card?.hint && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="mt-6 p-4 rounded-xl bg-[var(--warning)]/10 border border-[var(--warning)]/20"
                                                >
                                                    <div className="flex items-center gap-2 text-[var(--warning)] text-sm">
                                                        <Lightbulb size={16} />
                                                        <span className="font-medium">Hint:</span>
                                                    </div>
                                                    <p className="text-[var(--text-secondary)] mt-1 text-sm">
                                                        {card.hint}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <p className="text-[var(--text-muted)] text-sm mt-8 flex items-center gap-1">
                                            Click or press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] text-xs">Space</kbd> to reveal
                                        </p>
                                    </GlassCard>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="back"
                                    initial={{ rotateY: -180, opacity: 0 }}
                                    animate={{ rotateY: 0, opacity: 1 }}
                                    exit={{ rotateY: 180, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <GlassCard
                                        hoverEffect={false}
                                        animate={false}
                                        className="min-h-[320px] flex flex-col items-center justify-center p-8 text-center bg-[var(--accent-muted)]/30"
                                    >
                                        <p className="text-xs text-[var(--accent)] mb-6 uppercase tracking-wider font-medium">
                                            Answer
                                        </p>
                                        <p className="text-lg lg:text-xl leading-relaxed text-[var(--text-primary)]">
                                            {card?.back}
                                        </p>

                                        {/* Visual Payload (SVG) */}
                                        {card?.visual_payload && (
                                            <div
                                                className="mt-6 p-4 rounded-xl bg-white/5"
                                                dangerouslySetInnerHTML={{ __html: card.visual_payload }}
                                            />
                                        )}
                                    </GlassCard>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Rating Buttons */}
                    <AnimatePresence>
                        {isFlipped && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="space-y-4"
                            >
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
                                                p-4 rounded-xl border border-[var(--glass-border)]
                                                bg-[var(--glass-bg)] hover:bg-white/10 
                                                hover:border-[var(--glass-border-hover)]
                                                transition-all duration-200 
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                group
                                            `}
                                        >
                                            <div className={`w-3 h-3 rounded-full ${option.color} mx-auto mb-2`} />
                                            <p className="font-medium text-sm text-[var(--text-primary)]">{option.label}</p>
                                            <p className="text-xs text-[var(--text-muted)] mt-1">
                                                {option.description}
                                            </p>
                                            <kbd className="text-[10px] text-[var(--text-muted)] mt-2 inline-block opacity-50">
                                                {option.shortcut}
                                            </kbd>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
