'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export interface FeatureSlide {
    id: string;
    title: string;
    description: string;
    image: string;
    color: string;
    tags: string[];
}

export default function FeatureCarousel({ features }: { features: FeatureSlide[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % features.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [features.length, isPaused]);

    const slideVariants: Variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeInOut" }
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.3, ease: "easeInOut" }
        })
    };

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrentIndex((prev) => (prev + newDirection + features.length) % features.length);
    };

    return (
        <div
            className="relative w-full max-w-6xl mx-auto h-[500px] group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="absolute inset-x-0 bottom-[-20px] mx-auto w-3/4 h-10 bg-black/20 blur-2xl rounded-full" />

            <div className="relative w-full h-full overflow-hidden rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-2xl backdrop-blur-xl">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0 flex flex-col lg:flex-row"
                    >
                        {/* Text Content */}
                        <div className="flex-1 p-10 lg:p-16 flex flex-col justify-center z-10 relative">
                            <div
                                className="absolute inset-0 opacity-10 bg-gradient-to-br from-[var(--glass-bg)] to-transparent pointer-events-none"
                                style={{ background: `linear-gradient(135deg, ${features[currentIndex].color}20, transparent)` }}
                            />

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {features[currentIndex].tags.map((tag, i) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 rounded-full text-sm font-medium bg-white/10 border border-white/10 text-[var(--text-primary)]"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <h2 className="text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
                                    {features[currentIndex].title}
                                </h2>

                                <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-md leading-relaxed">
                                    {features[currentIndex].description}
                                </p>
                            </motion.div>
                        </div>

                        {/* Image Content */}
                        <div className="flex-1 relative overflow-hidden bg-black/50">
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[var(--glass-bg)] z-10 lg:w-32" />
                            <motion.div
                                initial={{ scale: 1.1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.7 }}
                                className="w-full h-full relative"
                            >
                                <Image
                                    src={features[currentIndex].image}
                                    alt={features[currentIndex].title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {/* Overlay Gradient for integration */}
                                <div className="absolute inset-0 bg-[var(--background)]/20 mix-blend-overlay" />
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Controls */}
                <div className="absolute bottom-8 left-10 lg:left-16 z-20 flex items-center gap-4">
                    <button
                        onClick={() => paginate(-1)}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 text-white transition-all transform hover:scale-105 active:scale-95"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="flex gap-2 mx-2">
                        {features.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setDirection(i > currentIndex ? 1 : -1);
                                    setCurrentIndex(i);
                                }}
                                className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                                    }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => paginate(1)}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 text-white transition-all transform hover:scale-105 active:scale-95"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
