import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ChevronLeft, ChevronRight, Code2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const codeSnippets = [
  {
    title: 'AI Agent Pipeline',
    language: 'typescript',
    label: 'AI / LLM',
    code: `const agent = new LangChainAgent({
  model: "gpt-4-turbo",
  tools: [webSearch, codeRunner, dbQuery],
  memory: new ConversationBuffer(),
});

const result = await agent.invoke({
  input: "Analyze the latest trends in AI",
  callbacks: [streamHandler],
});`,
  },
  {
    title: 'Real-time API',
    language: 'typescript',
    label: 'Backend',
    code: `app.ws('/stream/:channel', (ws, req) => {
  const { channel } = req.params;
  
  pubsub.subscribe(channel, (data) => {
    ws.send(JSON.stringify({
      event: 'update',
      payload: data,
      timestamp: Date.now(),
    }));
  });
});`,
  },
  {
    title: 'Custom Hook',
    language: 'typescript',
    label: 'React',
    code: `function useIntersection<T extends Element>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null);
  const [entry, setEntry] = useState<
    IntersectionObserverEntry
  >();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => setEntry(e), options
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return { ref, entry };
}`,
  },
  {
    title: 'Cloud Deploy',
    language: 'yaml',
    label: 'DevOps',
    code: `name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: aws-actions/configure-aws@v4
      - run: aws s3 sync dist/ s3://my-app
      - run: aws cloudfront invalidate --all`,
  },
];

function highlightSyntax(code: string): string {
  return code
    .replace(/(\/\/.*$)/gm, '<span class="text-muted-foreground/60">$1</span>')
    .replace(/\b(const|let|var|function|return|await|new|import|from|export|default|async|if|else)\b/g, '<span class="text-purple-400">$1</span>')
    .replace(/\b(useRef|useEffect|useState|useCallback|useMemo)\b/g, '<span class="text-yellow-400">$1</span>')
    .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="text-green-400">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>')
    .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-red-400">$1</span>')
    .replace(/([\{\}\[\]\(\)])/g, '<span class="text-yellow-300/70">$1</span>')
    .replace(/\b(name|on|push|branches|jobs|deploy|runs-on|steps|uses|run)\b(?=:)/g, '<span class="text-cyan-400">$1</span>');
}

export default function CodeShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const snippet = codeSnippets[activeIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % codeSnippets.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    toast.success('Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="premium-card rounded-2xl !p-0 overflow-hidden max-w-2xl mx-auto w-full min-w-0"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="ml-3 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono text-muted-foreground/50">{snippet.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary border border-primary/20 font-medium flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            {snippet.label}
          </span>
          <button onClick={copyCode} className="p-1.5 rounded-md hover:bg-white/[0.04] transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground/50" />}
          </button>
        </div>
      </div>

      {/* Code */}
      <div className="relative min-h-[250px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-5"
          >
            <pre className="font-mono text-[11px] sm:text-sm leading-relaxed overflow-x-auto custom-scrollbar whitespace-pre-wrap break-words">
              <code dangerouslySetInnerHTML={{ __html: highlightSyntax(snippet.code) }} />
            </pre>
          </motion.div>
        </AnimatePresence>

        {/* Line numbers gutter */}
        <div className="absolute top-5 left-0 flex flex-col font-mono text-sm leading-relaxed text-muted-foreground/30 pl-2 select-none pointer-events-none">
          {snippet.code.split('\n').map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.04]">
        <button
          onClick={() => setActiveIndex((i) => (i - 1 + codeSnippets.length) % codeSnippets.length)}
          className="p-1.5 rounded-md hover:bg-white/[0.04] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex gap-1.5">
          {codeSnippets.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === activeIndex ? 'bg-primary w-4' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setActiveIndex((i) => (i + 1) % codeSnippets.length)}
          className="p-1.5 rounded-md hover:bg-white/[0.04] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
