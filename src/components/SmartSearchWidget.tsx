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
      muted: root.getPropertyValue('--muted-foreground')?.trim() || 'hsl(220 10% 40%)',
      cardBg: 'hsl(var(--card) / 0.9)',
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
  const assistantBubble = { background: 'hsl(var(--muted) / 0.5)', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' };

  return (
    <>
      <style>{`
        .chat-messages::-webkit-scrollbar { width: 0px; background: transparent; }
        .chat-messages { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* Launcher */}
      <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              ref={launcherRef}
              onClick={() => setIsOpen(true)}
              className="relative rounded-full flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-card border-2 border-border shadow-lg"
              style={{ boxShadow: '0 4px 16px hsl(var(--primary) / 0.2)' }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop — mobile only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 sm:bg-black/20"
              onClick={() => { setIsOpen(false); setMessages([]); setQuickVisible(true); }}
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:right-6 sm:bottom-6 z-50 w-full sm:w-[380px] h-[70vh] sm:h-[520px] bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border"
              ref={wrapperRef}
              onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
              onTouchEnd={(e) => {
                if (touchStartY.current !== null) {
                  const dy = e.changedTouches[0].clientY - touchStartY.current;
                  if (dy > 80) { setIsOpen(false); setMessages([]); setQuickVisible(true); }
                  touchStartY.current = null;
                }
              }}
            >
              {/* Swipe indicator — mobile */}
              <div className="sm:hidden flex justify-center pt-2 pb-0">
                <div className="w-8 h-1 rounded-full bg-muted-foreground/20" />
              </div>

              {/* Header */}
              <div className="px-3 sm:px-4 py-2 flex items-center justify-between shrink-0" style={{ background: `linear-gradient(90deg, ${css.primary}, ${css.accent})` }}>
                <div className="flex items-center gap-2 min-w-0">
                  <Brain className="w-4 h-4 text-white shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-xs truncate">AI-Powered Portfolio Search</div>
                    <div className="text-[10px] text-white/70 truncate">{greeting}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {loading && <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />}
                  <button onClick={() => { setIsOpen(false); setMessages([]); setQuickVisible(true); }} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages flex-1 overflow-y-auto p-3 space-y-2">
                {/* Quick Questions */}
                <AnimatePresence>
                  {quickVisible && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap gap-1.5">
                      {quickQuestions.map((q, i) => (
                        <motion.button
                          key={q}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => handleQuick(q)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium surface-subtle border border-subtle hover:border-primary/30 transition-colors text-foreground"
                        >
                          {q}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Conversation */}
                <motion.div variants={variants.container} initial="hidden" animate="show" className="space-y-2">
                  {messages.map((m, i) => {
                    const isUser = m.role === 'user';
                    return (
                      <React.Fragment key={m.ts ?? i}>
                        <motion.div variants={variants.message} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[85%] px-3 py-2 rounded-xl shadow-sm break-words text-xs leading-relaxed" style={isUser ? userBubble : assistantBubble}>
                            <div
                              className="whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{
                                __html: m.content
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline">$1</a>')
                              }}
                            />
                            {!isUser && (
                              <div className="mt-1.5 flex items-center justify-end">
                                <button className="text-[10px] px-1.5 py-0.5 rounded surface-subtle hover:opacity-80 text-foreground">
                                  <ThumbsUp className="w-3 h-3 inline-block mr-0.5" /> Helpful
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
                                className="px-2 py-0.5 rounded-full text-[10px] font-medium surface-subtle border border-subtle hover:border-primary/30 transition-colors text-foreground"
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
                      <div className="px-3 py-2 rounded-xl surface-subtle">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1 items-end">
                            <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                          </div>
                          <span className="text-[10px] text-muted-foreground">Analyzing...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={bottomRef} />
                </motion.div>
              </div>

              {/* Input */}
              <div className="px-3 py-2 border-t border-border bg-card shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Ask about experience, projects..."
                    className="flex-1 rounded-lg px-3 py-2 text-xs bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  <button
                    disabled={loading || !input.trim()}
                    onClick={handleSend}
                    className="p-2 rounded-lg shrink-0 text-white disabled:opacity-40 transition-opacity"
                    style={{ background: `linear-gradient(135deg, ${css.primary}, ${css.accent})` }}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[9px] text-center mt-1 text-muted-foreground/60">
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
