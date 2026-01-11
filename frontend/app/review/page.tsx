// file: /app/review/page.tsx
// Quick Study - Reviews cards from all decks
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function QuickStudyPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to review with 'all' to review from all decks
        router.replace('/review/all');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center text-[var(--text-secondary)]">
            Loading Quick Study...
        </div>
    );
}
