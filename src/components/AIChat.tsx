'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);
    const [spinCompass, setSpinCompass] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const toggleChat = useCallback(() => {
        setIsOpen(prev => {
            if (!prev) {
                setSpinCompass(true);
                setTimeout(() => setSpinCompass(false), 2000);
            }
            return !prev;
        });
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
                e.preventDefault();
                toggleChat();
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, toggleChat]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    useEffect(() => {
        const hasSeenTooltip = localStorage.getItem('chatTooltipSeen');
        if (hasSeenTooltip) {
            setShowTooltip(false);
        } else {
            const timer = setTimeout(() => {
                setShowTooltip(false);
                localStorage.setItem('chatTooltipSeen', 'true');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userText = inputValue.trim();
        setInputValue('');

        if (userText.startsWith('/')) {
            const routes: Record<string, string> = {
                '/portfolio': '/projects',
                '/projects': '/projects',
                '/contact': '/contact',
                '/resume': '/resume',
                '/home': '/',
                '/about': '/',
            };
            const target = routes[userText.toLowerCase()];
            if (target) {
                window.location.href = target;
                return;
            }
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: userText
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText })
            });

            const data = await response.json();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.content
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error('Error:', err);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, something went wrong. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                {showTooltip && (
                    <div className="absolute bottom-20 right-0 mb-2 mr-2 bg-[#1B2933] text-[#D3CCB9] text-xs px-3 py-2 rounded-lg shadow-xl border border-[#D3CCB9]/20 whitespace-nowrap animate-fade-in">
                        Press <kbd className="px-1.5 py-0.5 rounded bg-[#D3CCB9]/20 font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[#D3CCB9]/20 font-mono">Q</kbd>
                        <div className="absolute top-full right-4 -mt-1 border-8 border-transparent border-t-[#1B2933]" />
                    </div>
                )}
                <button
                    onClick={toggleChat}
                    className="relative w-20 h-20 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
                >
                    <img 
                        src="/images/compass_logo.jpeg" 
                        alt="Open AI Chat"
                        className={`w-16 h-16 rounded-full object-cover ${spinCompass ? 'animate-spin-slow' : 'group-hover:rotate-12'} transition-transform duration-500`}
                    />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg" />
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />
            <div className="relative w-full max-w-lg mx-auto bg-[#1B2933] rounded-2xl shadow-2xl border border-[#D3CCB9]/20 overflow-hidden max-h-[80vh] flex flex-col animate-slide-up">
                <div className="p-4 border-b border-[#D3CCB9]/20 bg-[#1B2933]/95 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center ${spinCompass ? 'animate-spin-slow' : ''}`}>
                                <img 
                                    src="/images/compass_logo.jpeg" 
                                    alt="AI Guide"
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="text-[#D3CCB9] font-semibold">Joshua's AI</h3>
                                <p className="text-xs text-[#D3CCB9]/50">Your guide through my journey</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#D3CCB9]/10 text-[#D3CCB9]/40 text-xs">
                                <kbd className="px-1.5 py-0.5 rounded bg-[#D3CCB9]/20 font-mono text-[10px]">Ctrl</kbd>
                                <kbd className="px-1.5 py-0.5 rounded bg-[#D3CCB9]/20 font-mono text-[10px]">Q</kbd>
                                to close
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-lg bg-[#D3CCB9]/10 hover:bg-[#D3CCB9]/20 flex items-center justify-center text-[#D3CCB9] transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center py-8">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden ${spinCompass ? 'animate-spin-slow' : ''}`}>
                                <img 
                                    src="/images/compass_logo.jpeg" 
                                    alt="Compass"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <p className="text-[#D3CCB9] font-medium mb-2">Let me guide you through my journey</p>
                            <div className="flex flex-wrap justify-center gap-2 text-xs">
                                <span className="px-3 py-1 rounded-full bg-[#D3CCB9]/10 text-[#D3CCB9]/70">/projects</span>
                                <span className="px-3 py-1 rounded-full bg-[#D3CCB9]/10 text-[#D3CCB9]/70">/contact</span>
                                <span className="px-3 py-1 rounded-full bg-[#D3CCB9]/10 text-[#D3CCB9]/70">/resume</span>
                                <span className="px-3 py-1 rounded-full bg-[#D3CCB9]/10 text-[#D3CCB9]/70">skills</span>
                            </div>
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                                msg.role === 'user'
                                    ? 'bg-[#D3CCB9] text-[#1B2933] rounded-tr-none'
                                    : 'bg-[#2A3F4F] text-white rounded-tl-none border border-[#D3CCB9]/10 shadow-xl'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-[#2A3F4F] text-white rounded-2xl rounded-tl-none border border-[#D3CCB9]/10 p-4 shadow-sm">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[#D3CCB9]/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-[#D3CCB9]/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-[#D3CCB9]/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-t border-[#D3CCB9]/20 bg-[#1B2933]/95 backdrop-blur-md">
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-[#2A3F4F] border border-[#D3CCB9]/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-[#D3CCB9]/30 focus:outline-none focus:border-[#D3CCB9]/30 transition-all"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#D3CCB9] text-[#1B2933] flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-[#D3CCB9]/30">
                        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[#D3CCB9]/10">/</kbd> for shortcuts</span>
                        <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-[#D3CCB9]/10">Esc</kbd> to close</span>
                    </div>
                </form>
            </div>
        </div>
    );
}
