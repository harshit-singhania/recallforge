// file: /components/CreateDeckModal.tsx
'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';

interface CreateDeckModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (deck: any) => void;
}

export default function CreateDeckModal({ isOpen, onClose, onCreated }: CreateDeckModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            setError('Deck name is required');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await api.post('/api/v1/decks/', { name, description });
            onCreated(res.data);
            setName('');
            setDescription('');
            onClose();
        } catch (err: any) {
            console.error(err);
            setError('Failed to create deck. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md mx-4 bg-[var(--glass-bg)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Create New Deck</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[var(--text-secondary)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <p className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded-lg">
                            {error}
                        </p>
                    )}

                    <Input
                        label="Deck Name"
                        placeholder="e.g., Machine Learning Fundamentals"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">
                            Description (optional)
                        </label>
                        <textarea
                            placeholder="What will you learn in this deck?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            icon={<Plus size={18} />}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating...' : 'Create Deck'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
