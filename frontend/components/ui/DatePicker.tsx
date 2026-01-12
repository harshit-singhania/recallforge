'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
    label?: string;
    value: string;
    onChange: (date: string) => void;
    required?: boolean;
    placeholder?: string;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function DatePicker({
    label,
    value,
    onChange,
    required,
    placeholder = 'Select date'
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
        if (value) return new Date(value);
        // Default to 18 years ago for DOB
        const d = new Date();
        d.setFullYear(d.getFullYear() - 18);
        return d;
    });
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedDate = value ? new Date(value) : null;

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handleDateSelect = (day: number) => {
        // Create date in local time
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);

        // Format manually to YYYY-MM-DD to avoid timezone shifts
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayStr = String(date.getDate()).padStart(2, '0');
        const formatted = `${year}-${month}-${dayStr}`;

        onChange(formatted);
        setIsOpen(false);
    };

    const prevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const prevYear = () => {
        setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
    };

    const nextYear = () => {
        setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
    };

    const formatDisplayDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Empty cells for days before first day of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-9 h-9" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected = selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;

            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
            ${isSelected
                            ? 'bg-[var(--accent)] text-white'
                            : isToday
                                ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                                : 'text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)]'
                        }`}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    return (
        <div className="space-y-1.5" ref={containerRef}>
            {label && (
                <label className="text-sm font-medium text-[var(--text-secondary)] ml-0.5">
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center gap-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-2.5 px-3 text-left transition-all
            ${isOpen ? 'border-[var(--accent)] ring-2 ring-[var(--input-focus)]' : 'hover:border-[var(--accent)]/50'}
          `}
                >
                    <Calendar size={18} className="text-[var(--accent)]" />
                    <span className={value ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
                        {value ? formatDisplayDate(value) : placeholder}
                    </span>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 mt-2 w-full min-w-[300px] p-4 rounded-xl bg-[var(--surface)] border border-[var(--glass-border)] shadow-xl"
                        >
                            {/* Header - Year Navigation */}
                            <div className="flex items-center justify-between mb-2">
                                <button
                                    type="button"
                                    onClick={prevYear}
                                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-sm font-semibold text-[var(--text-primary)]">
                                    {viewDate.getFullYear()}
                                </span>
                                <button
                                    type="button"
                                    onClick={nextYear}
                                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Header - Month Navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    type="button"
                                    onClick={prevMonth}
                                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="text-base font-semibold text-[var(--text-primary)]">
                                    {MONTHS[viewDate.getMonth()]}
                                </span>
                                <button
                                    type="button"
                                    onClick={nextMonth}
                                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Day Labels */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {DAYS.map(day => (
                                    <div key={day} className="w-9 h-8 flex items-center justify-center text-xs font-medium text-[var(--text-muted)]">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {renderCalendar()}
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-4 pt-3 border-t border-[var(--glass-border)] flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange('');
                                        setIsOpen(false);
                                    }}
                                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="text-sm text-[var(--accent)] hover:underline"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
