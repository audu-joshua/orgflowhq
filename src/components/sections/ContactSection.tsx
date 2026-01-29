'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function ContactSection() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        companySize: '',
        message: '',
        scheduleDemo: false
    });

    const companySizeOptions = [
        "1-10 employees",
        "11-50 employees",
        "51-200 employees",
        "201-500 employees",
        "500+ employees"
    ];

    useEffect(() => {
        if (isDropdownOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // If less than 200px below and more space above, open upward
            if (spaceBelow < 200 && spaceAbove > spaceBelow) {
                setOpenUpward(true);
            } else {
                setOpenUpward(false);
            }
        }
    }, [isDropdownOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('success');
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    companySize: '',
                    message: '',
                    scheduleDemo: false
                });
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <section id="contact" className="py-32 bg-[#020617] relative overflow-hidden">
            {/* Glowing Dome Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] aspect-square bg-gradient-to-b from-[#0fadaa]/20 to-transparent rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[#0fadaa] font-semibold tracking-wider uppercase text-sm"
                    >
                        Contacts
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6"
                    >
                        Get in Touch with Us
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg"
                    >
                        Please fill out the form below to share your feedback or request information about our services.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative">
                        {status === 'success' ? (
                            <div className="text-center py-12">
                                <CheckCircle2 className="w-16 h-16 text-[#0fadaa] mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                                <p className="text-slate-400 mb-8">Thank you for reaching out. Our team will get back to you shortly.</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="px-8 py-3 bg-[#0fadaa] text-white rounded-xl font-semibold hover:opacity-90 transition-all"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">First name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Enter your first name"
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-white/5 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0fadaa]/50 transition-all"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Last name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Enter your last name"
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-white/5 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0fadaa]/50 transition-all"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Work email</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="Enter work email"
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-white/5 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0fadaa]/50 transition-all"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-sm font-medium text-slate-300">Company size</label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-white/5 rounded-xl text-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#0fadaa]/50 transition-all shadow-inner"
                                            >
                                                <span className={formData.companySize ? 'text-white' : 'text-slate-500'}>
                                                    {formData.companySize || 'Select Company size'}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            <AnimatePresence>
                                                {isDropdownOpen && (
                                                    <motion.div
                                                        ref={dropdownRef}
                                                        initial={{ opacity: 0, y: openUpward ? 10 : -10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: openUpward ? 10 : -10, scale: 0.95 }}
                                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                                        className={`absolute z-50 w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden py-1 ${openUpward ? 'bottom-full mb-2' : 'mt-2'
                                                            }`}
                                                    >
                                                        {companySizeOptions.map((option) => (
                                                            <button
                                                                key={option}
                                                                type="button"
                                                                className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-[#0fadaa] hover:text-white transition-colors flex items-center gap-2 group"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, companySize: option });
                                                                    setIsDropdownOpen(false);
                                                                }}
                                                            >
                                                                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${formData.companySize === option ? 'bg-white' : 'bg-transparent group-hover:bg-white/50'}`} />
                                                                {option}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="How can we help you?"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/5 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0fadaa]/50 transition-all resize-none"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-white/5">
                                    <div className="space-y-0.5">
                                        <span className="text-white font-medium">Schedule a Demo Call</span>
                                        <p className="text-xs text-slate-400">Our manager will contact you shortly.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.scheduleDemo}
                                            onChange={(e) => setFormData({ ...formData, scheduleDemo: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0fadaa]"></div>
                                    </label>
                                </div>

                                {status === 'error' && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>Something went wrong. Please try again.</span>
                                    </div>
                                )}

                                <button
                                    disabled={status === 'loading'}
                                    type="submit"
                                    className="w-full py-4 bg-[#0fadaa] text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-[#0fadaa]/20"
                                >
                                    {status === 'loading' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'Submit'
                                    )}
                                </button>

                                <p className="text-center text-[10px] text-slate-500">
                                    By contacting with us you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>
                                </p>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
