// file: /app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import CreateDeckModal from "@/components/CreateDeckModal";
import FeatureCarousel from "@/components/FeatureCarousel";
import Footer from "@/components/layout/Footer";
import {
  Brain,
  Plus,
  Zap,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Play,
  Clock,
  Target,
  TrendingUp
} from "lucide-react";

interface Deck {
  id: number;
  name: string;
  description: string;
  card_count: number;
}

export default function Home() {
  const { user, loading } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/api/v1/decks/')
        .then(res => setDecks(res.data))
        .catch(err => console.error("Failed to fetch decks", err));
    }
  }, [user]);

  const handleDeckCreated = (newDeck: Deck) => {
    setDecks(prev => [...prev, newDeck]);
  };

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

  // Unauthenticated - Landing Page
  if (!user) {
    return <LandingPage />;
  }

  // Authenticated - Dashboard
  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--accent)]/10 via-transparent to-transparent">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM3Y2I1ODkiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative px-6 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-2"
                >
                  Good {getTimeOfDay()}, {user.username} 👋
                </motion.h1>
                <p className="text-[var(--text-secondary)] text-lg">
                  Ready to strengthen your memory?
                </p>
              </div>

              <div className="flex gap-3">
                <Link href="/review">
                  <Button variant="primary" size="lg" icon={<Play size={18} />}>
                    Start Studying
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<Plus size={18} />}
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  New Deck
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto space-y-10">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStat
            icon={<Brain />}
            value={decks.length}
            label="Decks"
            color="accent"
          />
          <QuickStat
            icon={<Target />}
            value={12}
            label="Due Today"
            color="warning"
            highlight
          />
          <QuickStat
            icon={<TrendingUp />}
            value="5"
            label="Day Streak"
            color="success"
          />
          <QuickStat
            icon={<Clock />}
            value="23m"
            label="Study Time"
            color="info"
          />
        </div>

        {/* Due for Review - Prominent CTA */}
        {decks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[#5a9e6a] p-6 lg:p-8"
          >
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-1">
                  You have 12 cards due for review
                </h2>
                <p className="text-white/80">
                  Keep your streak going! Reviews take about 5 minutes.
                </p>
              </div>
              <Link href="/review">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-[var(--accent)] hover:bg-white/90 border-0 shadow-lg"
                  icon={<Zap size={18} />}
                >
                  Review Now
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Your Decks */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Your Decks</h2>
            <Link
              href="/decks"
              className="flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
            >
              View all <ChevronRight size={16} />
            </Link>
          </div>

          {decks.length === 0 ? (
            <EmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {decks.slice(0, 7).map((deck, i) => (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <DeckCard deck={deck} />
                </motion.div>
              ))}

              {/* Add New Deck Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="group cursor-pointer rounded-2xl border-2 border-dashed border-[var(--border-default)] hover:border-[var(--accent)] bg-[var(--accent-muted)]/30 hover:bg-[var(--accent-muted)] transition-all duration-300 h-52 flex flex-col items-center justify-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-muted)] group-hover:bg-[var(--accent)]/20 flex items-center justify-center mb-3 transition-colors">
                  <Plus size={28} className="text-[var(--accent)]" />
                </div>
                <span className="font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  Create New Deck
                </span>
              </motion.div>
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Recent Activity</h2>
          <div className="space-y-3">
            <ActivityItem
              action="Reviewed 15 cards"
              deck="Biology 101"
              time="2 hours ago"
              icon={<Zap size={16} />}
            />
            <ActivityItem
              action="Created new deck"
              deck="Machine Learning Fundamentals"
              time="Yesterday"
              icon={<Plus size={16} />}
            />
            <ActivityItem
              action="Ingested content from"
              deck="YouTube: 3Blue1Brown"
              time="2 days ago"
              icon={<Sparkles size={16} />}
            />
          </div>
        </section>
      </div>

      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleDeckCreated}
      />
    </div>
  );
}

// Landing Page for unauthenticated users
function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-[var(--info)]/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--accent)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--info)]/10 rounded-full blur-3xl" />

        <div className="relative px-6 py-20 lg:py-32">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-muted)] text-[var(--accent)] text-sm font-medium mb-8"
            >
              <Sparkles size={16} />
              Study smarter, not harder
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-[var(--text-primary)] mb-6"
            >
              Master anything.
              <br />
              <span className="text-[var(--accent)]">Forget nothing.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg lg:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10"
            >
              Paste a YouTube link, drop a PDF, or share any URL.
              Our AI transforms your content into smart flashcards with
              scientifically-proven spaced repetition.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/register">
                <Button variant="primary" size="lg" icon={<ArrowRight size={20} />}>
                  Start Learning Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="lg">
                  I already have an account
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Carousel */}
      <section className="px-6 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Everything you need to master any subject
          </h2>
          <p className="text-lg text-[var(--text-secondary)]">
            Powerful tools designed for serious learners
          </p>
        </div>

        <FeatureCarousel
          features={[
            {
              id: 'ai-gen',
              title: 'AI-Powered Cards',
              description: 'Drop in any content and let AI do the heavy lifting. It extracts key concepts, generates questions, and creates perfectly structured flashcards—so you can focus on learning.',
              image: '/assets/ai-brain-art.png',
              color: '#8b5cf6',
              tags: ['Effortless', 'Instant Generation', 'Smart Context']
            },
            {
              id: 'spaced-rep',
              title: 'Spaced Repetition',
              description: 'Our SM-2 algorithm ensures you review material at the perfect moment—right before you are about to forget it. Maximize retention with minimum effort.',
              image: '/assets/spaced-repetition-art.png',
              color: '#10b981',
              tags: ['SM-2 Algorithm', 'Efficiency', 'Long-term Memory']
            },
            {
              id: 'any-source',
              title: 'Any Source',
              description: 'Learning happens everywhere. Import content seamlessly from YouTube videos, PDF textbooks, web articles, or your own notes. We unify your knowledge.',
              image: '/assets/multi-source-art.png',
              color: '#f97316',
              tags: ['YouTube', 'PDFs', 'Web', 'Docs']
            }
          ]}
        />
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 bg-[var(--surface)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Your memory, supercharged
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-8">
            Join learners who remember more with less effort.
          </p>
          <Link href="/register">
            <Button variant="primary" size="lg">
              Get Started — It's Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Sub-components
function QuickStat({ icon, value, label, color, highlight }: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  highlight?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    accent: 'text-[var(--accent)]',
    warning: 'text-[var(--warning)]',
    success: 'text-[var(--success)]',
    info: 'text-[var(--info)]',
  };

  return (
    <div className={`p-5 rounded-2xl ${highlight ? 'bg-[var(--accent-muted)] ring-2 ring-[var(--accent)]/30' : 'bg-[var(--glass-bg)] border border-[var(--glass-border)]'}`}>
      <div className={`${colorClasses[color]} mb-2`}>{icon}</div>
      <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

function DeckCard({ deck }: { deck: Deck }) {
  return (
    <Link href={`/decks/${deck.id}`}>
      <div className="group h-52 p-5 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--accent)]/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer">
        <div>
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-muted)] group-hover:bg-[var(--accent)]/20 flex items-center justify-center mb-3 transition-colors">
            <Brain size={24} className="text-[var(--accent)]" />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)] line-clamp-1 mb-1 group-hover:text-[var(--accent)] transition-colors">
            {deck.name}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
            {deck.description || "No description"}
          </p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
          <span className="text-sm text-[var(--text-muted)]">
            {deck.card_count || 0} cards
          </span>
          <span className="text-sm text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Open <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="text-center py-20 px-6 rounded-2xl border-2 border-dashed border-[var(--border-default)] bg-[var(--accent-muted)]/20">
      <div className="w-20 h-20 rounded-2xl bg-[var(--accent-muted)] flex items-center justify-center mx-auto mb-6">
        <Brain size={40} className="text-[var(--accent)]" />
      </div>
      <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
        Create your first deck
      </h3>
      <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
        Start by creating a deck, then add content from YouTube, PDFs, or any URL to generate flashcards.
      </p>
      <Button variant="primary" size="lg" icon={<Plus />} onClick={onCreateClick}>
        Create Deck
      </Button>
    </div>
  );
}

function ActivityItem({ action, deck, time, icon }: {
  action: string;
  deck: string;
  time: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
      <div className="w-10 h-10 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center text-[var(--accent)]">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[var(--text-primary)]">
          {action} <span className="font-semibold">{deck}</span>
        </p>
      </div>
      <span className="text-sm text-[var(--text-muted)]">{time}</span>
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
