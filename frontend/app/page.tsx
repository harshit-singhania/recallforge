// file: /app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import CreateDeckModal from "@/components/CreateDeckModal";
import { Brain, Plus, Zap, User as UserIcon, LogOut } from "lucide-react";

interface Deck {
  id: number;
  name: string;
  description: string;
  card_count: number;
}

export default function Home() {
  const { user, loading, logout } = useAuth();
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--text-secondary)]">Loading Reality...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      {/* Header Section */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-gradient">
            RecallForge
          </h1>
          <p className="text-[var(--text-secondary)]">Your AI-Native Knowledge OS</p>
        </div>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <div className="flex items-center gap-2 mr-4 text-sm text-[var(--text-secondary)]">
                <UserIcon size={16} /> {user.username}
              </div>
              <Link href="/review">
                <Button variant="ghost" icon={<Zap />}>Quick Study</Button>
              </Link>
              <Button
                variant="primary"
                icon={<Plus />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                New Deck
              </Button>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[var(--text-secondary)]"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="primary">Sign In to Sync</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {user ? (
          <>
            {decks.length === 0 ? (
              <div className="col-span-full text-center py-20 text-[var(--text-secondary)]">
                You have no decks yet. Create one to get started!
              </div>
            ) : (
              decks.map(deck => (
                <Link key={deck.id} href={`/decks/${deck.id}`}>
                  <GlassCard className="h-64 flex flex-col justify-between cursor-pointer">
                    <div>
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                        <Brain size={20} />
                      </div>
                      <h3 className="text-xl font-semibold mb-1">{deck.name}</h3>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{deck.description || "No description"}</p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/review/${deck.id}`;
                      }}
                    >
                      Review Now
                    </Button>
                  </GlassCard>
                </Link>
              ))
            )}

            {/* Create New Trigger */}
            <GlassCard
              hoverEffect={false}
              className="h-64 flex flex-col items-center justify-center border-dashed border-[var(--border-highlight)] bg-transparent cursor-pointer"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Button variant="ghost" icon={<Plus />}>Create New Deck</Button>
            </GlassCard>
          </>
        ) : (
          <div className="col-span-full text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Welcome to the future of memory.</h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
              RecallForge uses Gemini AI to turn any content into smart flashcards. Sign in to start building your second brain.
            </p>
            <Link href="/register">
              <Button variant="primary" size="lg">Get Started</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Create Deck Modal */}
      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleDeckCreated}
      />
    </div>
  );
}
