/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X, Send, Loader2, Zap, ThumbsUp, Brain, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { generateAIResponse, getTimeBasedSuggestions, getSmartGreeting, analyzeUserIntent, generatePortfolioSummary } from '@/lib/aiEngine';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  ts?: number;
  followUps?: string[];
}

interface PortfolioData {
  projects: any[];
  experiences: any[];
  skills: any[];
  certifications: any[];
  achievements: any[];
  education: any[];
  profile: any;
}

export default function SmartSearchWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickVisible, setQuickVisible] = useState(true);
  const [cachedData, setCachedData] = useState<PortfolioData | null>(null);
  const [conversationContext, setConversationContext] = useState({
    lastTopic: null as string | null,
    mentionedEntities: [] as string[],
    questionCount: 0,
    sentiment: 'neutral' as 'positive' | 'neutral' | 'curious',
  });
  const { theme } = useTheme();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const touchStartY = useRef<number | null>(null);

  const css = useMemo(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      primary: root.getPropertyValue('--primary')?.trim() || '#60a5fa',
      accent: root.getPropertyValue('--accent')?.trim() || '#a78bfa',
      foreground: root.getPropertyValue('--foreground')?.trim() || '#e6eef8',
      muted: root.getPropertyValue('--muted')?.trim() || 'rgba(255,255,255,0.35)',
      cardBg: (root.getPropertyValue('--card-bg') || 'rgba(8,10,14,0.6)').trim(),
    };
  }, [theme]);

  async function getPortfolioData(): Promise<PortfolioData> {
    if (cachedData) return cachedData;
    try {
      const [projects, experiences, skills, certifications, achievements, education, profile] = await Promise.all([
        supabase.from('projects').select('*').order('display_order'),
        supabase.from('experiences').select('*').order('display_order'),
        supabase.from('skills').select('*').order('display_order'),
        supabase.from('certifications').select('*').order('display_order'),
        supabase.from('achievements').select('*').order('display_order'),
        supabase.from('education').select('*').order('display_order'),
        supabase.from('profiles').select('*').limit(1).single(),
      ]);
      const data = {
        projects: projects.data || [],
        experiences: experiences.data || [],
        skills: skills.data || [],
        certifications: certifications.data || [],
        achievements: achievements.data || [],
        education: education.data || [],
        profile: profile.data || {},
      };
      setCachedData(data);
      return data;
    } catch {
      return { projects: [], experiences: [], skills: [], certifications: [], achievements: [], education: [], profile: {} };
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return;
    const text = input.trim();
    const ts = Date.now();
    setMessages(prev => [...prev, { role: 'user', content: text, ts }]);
    setInput('');
    setLoading(true);
    setQuickVisible(false);

    try {
      const data = await getPortfolioData();
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 250));
      const result = generateAIResponse(text, data, conversationContext);
      setConversationContext(prev => ({ ...prev, ...result.context }));
      await streamAssistant(result.response, result.followUps);
      const allUserMessages = [...messages.filter(m => m.role === 'user').map(m => m.content), text];
      const intent = analyzeUserIntent(allUserMessages);
      if (intent.confidence > 0.5 && intent.primaryInterest !== 'general') {
        const intentMsg = `\n\n💡 *It seems you're interested in **${intent.primaryInterest}**. ${intent.suggestedAction}.*`;
        await new Promise(r => setTimeout(r, 300));
        setMessages(prev => {
          const copy = [...prev];
          const lastAssistantIdx = copy.map(m => m.role).lastIndexOf('assistant');
          if (lastAssistantIdx >= 0) {
            copy[lastAssistantIdx] = { ...copy[lastAssistantIdx], content: copy[lastAssistantIdx].content + intentMsg };
          }
          return copy;
        });
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error accessing portfolio data. Please try again.' }]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  }

  async function streamAssistant(full: string, followUps: string[] = []) {
    const chunk = 100;
    let acc = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '', ts: Date.now() }]);
    for (let i = 0; i < Math.ceil(full.length / chunk); i++) {
      acc += full.slice(i * chunk, (i + 1) * chunk);
      const currentAcc = acc;
      const isLast = i === Math.ceil(full.length / chunk) - 1;
      setMessages(prev => {
        const copy = [...prev];
        const idx = copy.map(m => m.role).lastIndexOf('assistant');
        if (idx >= 0) copy[idx] = { ...copy[idx], content: currentAcc, followUps: isLast ? followUps : undefined };
        return copy;
      });
      await new Promise(r => setTimeout(r, 80));
    }
  }

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickQuestions = useMemo(() => getTimeBasedSuggestions().concat([
    'Who is Srinath?',
    'Show AI projects',
    'Contact info?',
  ]).slice(0, 6), []);

  const greeting = useMemo(() => getSmartGreeting(), []);

  function handleQuick(q: string) {
    setInput(q);
    setTimeout(() => handleSend(), 100);
  }

  // Outside click close
  useEffect(() => {
    function onDoc(e: MouseEvent | TouchEvent) {
      const panel = wrapperRef.current;
      const launcher = launcherRef.current;
      const target = e.target as Node;
      if (!panel) return;
      const insidePanel = panel.contains(target);
      const onLauncher = launcher ? launcher.contains(target) : false;
      if (!insidePanel && !onLauncher) {
        setIsOpen(false);
        setMessages([]);
        setQuickVisible(true);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', onDoc);
      document.addEventListener('touchstart', onDoc, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc as any);
    };
  }, [isOpen]);

  const variants = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } } },
    message: { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } },
  };

  const userBubble = { background: `linear-gradient(90deg, ${css.primary}, ${css.accent})`, color: '#fff' };
  const assistantBubble = { background: css.cardBg, color: css.foreground, border: '1px solid rgba(255,255,255,0.06)' };

  return (
    <>
      <style>{`
        .chat-messages::-webkit-scrollbar { width: 0px; background: transparent; }
        .chat-messages { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* Launcher */}
      <div className="fixed right-6 bottom-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              ref={launcherRef}
              onClick={() => setIsOpen(true)}
              className="relative rounded-full flex items-center justify-center"
              style={{ width: 64, height: 64, background: 'transparent', border: '2px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 20px rgba(2,6,23,0.6)' }}
              whileHover={{ scale: 1.08 }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => { setIsOpen(false); setMessages([]); setQuickVisible(true); }}
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.28 }}
              className="fixed right-2 bottom-2 sm:right-6 sm:bottom-6 z-50 w-[calc(100vw-16px)] sm:w-full sm:max-w-md h-[calc(100vh-64px)] sm:h-[640px] bg-[var(--card-bg)] rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border"
              style={{ borderColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(14px) saturate(120%)' }}
              ref={wrapperRef}
              onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
              onTouchEnd={(e) => {
                if (touchStartY.current !== null) {
                  const dy = e.changedTouches[0].clientY - touchStartY.current;
                  if (dy > 60) { setIsOpen(false); setMessages([]); setQuickVisible(true); }
                  touchStartY.current = null;
                }
              }}
            >
              {/* Header */}
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between" style={{ background: `linear-gradient(90deg, ${css.primary}, ${css.accent})` }}>
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-xs sm:text-sm truncate">Ask Srinath</div>
                    <div className="text-[10px] sm:text-xs text-white/80 truncate hidden sm:block">AI-powered portfolio search</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-white/10 text-white/90 text-[10px] sm:text-xs">
                    <Loader2 className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">{loading ? 'Analyzing...' : 'Ready'}</span>
                    <span className="sm:hidden">{loading ? '...' : '✓'}</span>
                  </div>
                  <button onClick={() => { setIsOpen(false); setMessages([]); setQuickVisible(true); }} className="p-1 rounded-md bg-white/10 hover:bg-white/12">
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4" style={{ background: `linear-gradient(180deg, rgba(0,0,0,0.02), transparent)` }}>
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg sm:rounded-xl p-2 sm:p-3" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02), transparent)' }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-medium truncate" style={{ color: css.foreground }}>
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1.5 text-primary" />
                        AI-Powered Portfolio Search
                      </div>
                      <div className="text-[10px] sm:text-xs line-clamp-1 mt-0.5" style={{ color: css.muted }}>{greeting}</div>
                    </div>
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: css.foreground }} />
                  </div>
                </motion.div>

                {/* Quick Questions */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <AnimatePresence>
                    {quickVisible && quickQuestions.map((q, i) => (
                      <motion.button
                        key={q}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => handleQuick(q)}
                        className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium"
                        style={{ background: 'rgba(255,255,255,0.03)', color: css.foreground, border: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        {q}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Conversation */}
                <motion.div variants={variants.container} initial="hidden" animate="show" className="space-y-2 sm:space-y-3">
                  {messages.map((m, i) => {
                    const isUser = m.role === 'user';
                    return (
                      <React.Fragment key={m.ts ?? i}>
                        <motion.div variants={variants.message} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[85%] sm:max-w-[85%] px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-sm break-words" style={isUser ? userBubble : assistantBubble}>
                            <div
                              className="text-xs sm:text-sm whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{
                                __html: m.content
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline">$1</a>')
                              }}
                            />
                            {!isUser && (
                              <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2 justify-end">
                                <button className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md hover:opacity-90" style={{ background: 'rgba(255,255,255,0.02)', color: css.foreground }}>
                                  <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-0.5 sm:mr-1" /> Helpful
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                        {!isUser && m.followUps && m.followUps.length > 0 && (
                          <motion.div variants={variants.message} className="flex flex-wrap gap-1 ml-1">
                            {m.followUps.map((q) => (
                              <button
                                key={q}
                                onClick={() => handleQuick(q)}
                                className="px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors hover:bg-white/5"
                                style={{ background: 'rgba(255,255,255,0.02)', color: css.foreground, border: '1px solid rgba(255,255,255,0.06)' }}
                              >
                                {q}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="max-w-[65%] px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl" style={{ background: css.cardBg, color: css.foreground }}>
                        <motion.div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="flex gap-0.5 sm:gap-1 items-end">
                            <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: css.primary }} />
                            <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.12 }} className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: css.primary }} />
                            <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.24 }} className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: css.primary }} />
                          </div>
                          <div className="text-[10px] sm:text-xs" style={{ color: css.muted }}>Analyzing...</div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={bottomRef} />
                </motion.div>
              </div>

              {/* Input */}
              <div className="px-2 sm:px-4 py-2 sm:py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.02))' }}>
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Ask about experience, projects..."
                    className="flex-1 rounded-md px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: css.foreground }}
                  />
                  <button
                    disabled={loading || !input.trim()}
                    onClick={handleSend}
                    className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md shadow shrink-0 text-white"
                    style={{ background: `linear-gradient(90deg, ${css.primary}, ${css.accent})`, opacity: (loading || !input.trim()) ? 0.5 : 1 }}
                  >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
                <div className="text-[9px] sm:text-xs text-center mt-1 sm:mt-2" style={{ color: css.muted }}>
                  🧠 AI-powered search
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
