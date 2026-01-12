// file: /app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/axios';
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
  TrendingUp,
  Youtube,
  FileText,
  Globe,
  Layers
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
    <div className="min-h-screen pb-16">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Welcome Section - Clean and simple */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--text-primary)] mb-1">
              Welcome back, {user.username}
            </h1>
            <p className="text-[var(--text-muted)]">
              {getTimeGreeting()}
            </p>
          </motion.div>
        </section>

        {/* Feature Cards - Quizlet-inspired promotional cards */}
        <section className="space-y-4">
          {/* Main Feature Card - Study Session */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/review">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--surface)] to-[var(--background)] border border-white/10 p-6 lg:p-8 hover:border-[var(--accent)]/30 transition-all cursor-pointer">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center">
                      <Zap size={24} className="text-[var(--accent)]" />
                    </div>
                    <div>
                      <h2 className="text-xl lg:text-2xl font-semibold text-[var(--text-primary)] mb-2">
                        Ready for your daily review?
                      </h2>
                      <p className="text-[var(--text-secondary)] max-w-md">
                        You have cards due for review. A quick session can strengthen your memory significantly.
                      </p>
                    </div>
                    <Button variant="primary" icon={<Play size={16} />}>
                      Start studying
                    </Button>
                  </div>

                  {/* Decorative illustration area */}
                  <div className="hidden lg:flex items-center justify-center w-48 h-40 rounded-xl bg-gradient-to-br from-[var(--accent)]/10 to-[var(--info)]/10">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-[var(--accent)]/20 flex items-center justify-center">
                        <Brain size={40} className="text-[var(--accent)]" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">
                        12
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Secondary Feature Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Create New Deck Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div
                onClick={() => setIsCreateModalOpen(true)}
                className="group relative overflow-hidden rounded-2xl bg-[var(--surface)] border border-white/10 p-6 hover:border-[var(--accent)]/30 transition-all cursor-pointer h-full"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center shrink-0">
                    <Layers size={22} className="text-[var(--accent)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent)] transition-colors">
                      Create a new deck
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      Start from scratch or import from your content
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                </div>
              </div>
            </motion.div>

            {/* Import Content Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/decks">
                <div className="group relative overflow-hidden rounded-2xl bg-[var(--surface)] border border-white/10 p-6 hover:border-[var(--accent)]/30 transition-all cursor-pointer h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--info)]/15 flex items-center justify-center shrink-0">
                      <Sparkles size={22} className="text-[var(--info)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent)] transition-colors">
                        AI-powered import
                      </h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        Generate flashcards from YouTube, PDFs, or URLs
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Supported Sources Section */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Import from anywhere
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <SourceChip icon={<Youtube size={18} />} label="YouTube" />
            <SourceChip icon={<FileText size={18} />} label="PDFs" />
            <SourceChip icon={<Globe size={18} />} label="Web URLs" />
          </div>
        </motion.section>

        {/* Your Decks Section */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Your Decks</h2>
            {decks.length > 0 && (
              <Link
                href="/decks"
                className="flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
              >
                View all <ChevronRight size={16} />
              </Link>
            )}
          </div>

          {decks.length === 0 ? (
            <EmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
          ) : (
            <div className="space-y-3">
              {decks.slice(0, 5).map((deck, i) => (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                >
                  <DeckRow deck={deck} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Quick Stats - Minimal row */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Your progress
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard value={decks.length} label="Decks" />
            <StatCard value="12" label="Due today" highlight />
            <StatCard value="5" label="Day streak" />
            <StatCard value="2.3h" label="Study time" />
          </div>
        </motion.section>

      </div>

      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleDeckCreated}
      />
    </div>
  );
}

// Helper Components

function SourceChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--surface)] border border-white/5 text-[var(--text-secondary)]">
      <span className="text-[var(--accent)]">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function StatCard({ value, label, highlight }: { value: string | number; label: string; highlight?: boolean }) {
  return (
    <div className={`px-4 py-4 rounded-xl border ${highlight ? 'bg-[var(--accent)]/10 border-[var(--accent)]/20' : 'bg-[var(--surface)] border-white/5'}`}>
      <div className={`text-2xl font-bold mb-1 ${highlight ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
        {value}
      </div>
      <div className="text-sm text-[var(--text-muted)]">{label}</div>
    </div>
  );
}

function DeckRow({ deck }: { deck: Deck }) {
  return (
    <Link href={`/decks/${deck.id}`}>
      <div className="group flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)] border border-white/5 hover:border-[var(--accent)]/30 transition-all">
        <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center shrink-0">
          <Layers size={20} className="text-[var(--accent)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
            {deck.name}
          </h3>
          <p className="text-sm text-[var(--text-muted)] truncate">
            {deck.card_count || 0} cards
          </p>
        </div>
        <ChevronRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
      </div>
    </Link>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-white/10 bg-[var(--surface)]/50">
      <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/15 flex items-center justify-center mx-auto mb-5">
        <Layers size={32} className="text-[var(--accent)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        No decks yet
      </h3>
      <p className="text-[var(--text-muted)] mb-6 max-w-sm mx-auto text-sm">
        Create your first deck to start learning with AI-powered flashcards
      </p>
      <Button variant="primary" icon={<Plus size={16} />} onClick={onCreateClick}>
        Create your first deck
      </Button>
    </div>
  );
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning. Ready to learn something new?";
  if (hour < 17) return "Good afternoon. Time for a quick review?";
  return "Good evening. Let's strengthen your memory.";
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
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <FeatureCarousel features={LANDING_FEATURES} />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-[var(--surface)]/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Why RecallForge?
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              We combine cutting-edge AI with proven learning science to help you remember more with less effort.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles size={24} />}
              title="AI-Powered Generation"
              description="Drop any content and watch as AI creates perfectly-structured flashcards in seconds."
            />
            <FeatureCard
              icon={<Target size={24} />}
              title="Spaced Repetition"
              description="Our algorithm shows you cards right before you'd forget them, making review effortless."
            />
            <FeatureCard
              icon={<TrendingUp size={24} />}
              title="Track Progress"
              description="See your learning stats and watch your knowledge grow over time."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Ready to supercharge your learning?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Join thousands of learners who are mastering new skills every day.
          </p>
          <Link href="/register">
            <Button variant="primary" size="lg" icon={<ArrowRight size={20} />}>
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const LANDING_FEATURES = [
  {
    id: 'feature-1',
    title: 'Turn anything into flashcards',
    description: 'Paste a YouTube link or upload a PDF. Our AI analyzes the content and generates high-quality flashcards instantly.',
    image: '/logo.png', // Placeholder
    color: '#7cb589',
    tags: ['AI Generation', 'Content Ingestion']
  },
  {
    id: 'feature-2',
    title: 'Never forget what you learn',
    description: 'Our spaced repetition algorithm schedules reviews at the perfect time to move knowledge into your long-term memory.',
    image: '/logo.png', // Placeholder
    color: '#3b82f6',
    tags: ['Spaced Repetition', 'Memory Science']
  },
  {
    id: 'feature-3',
    title: 'Study anywhere, anytime',
    description: 'Your decks sync across all devices. Start on your laptop and review on your phone during your commute.',
    image: '/logo.png', // Placeholder
    color: '#8b5cf6',
    tags: ['Cross-platform', 'Cloud Sync']
  }
];

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-[var(--surface)] border border-white/5">
      <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)] mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-[var(--text-secondary)] text-sm">{description}</p>
    </div>
  );
}
