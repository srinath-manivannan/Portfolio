import { motion } from 'framer-motion';

const techStack = [
  { name: 'React', color: '#61DAFB' },
  { name: 'TypeScript', color: '#3178C6' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'Node.js', color: '#339933' },
  { name: 'Python', color: '#3776AB' },
  { name: 'MongoDB', color: '#47A248' },
  { name: 'PostgreSQL', color: '#4169E1' },
  { name: 'AWS', color: '#FF9900' },
  { name: 'Docker', color: '#2496ED' },
  { name: 'TailwindCSS', color: '#06B6D4' },
  { name: 'Supabase', color: '#3FCF8E' },
  { name: 'Framer Motion', color: '#BB4B96' },
  { name: 'Three.js', color: '#ffffff' },
  { name: 'Redis', color: '#DC382D' },
  { name: 'GraphQL', color: '#E10098' },
  { name: 'n8n', color: '#EA4B71' },
  { name: 'LangChain', color: '#1C3C3C' },
  { name: 'OpenAI', color: '#00A67E' },
  { name: 'Vite', color: '#646CFF' },
  { name: 'Git', color: '#F05032' },
];

export default function TechMarquee() {
  const doubled = [...techStack, ...techStack];

  return (
    <div className="relative overflow-hidden py-6">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

      <motion.div
        className="flex gap-4 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((tech, i) => (
          <div
            key={`${tech.name}-${i}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-primary/20 transition-all flex-shrink-0 group cursor-default"
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 transition-transform group-hover:scale-150"
              style={{ backgroundColor: tech.color }}
            />
            <span className="text-sm font-medium text-muted-foreground/80 group-hover:text-foreground transition-colors">
              {tech.name}
            </span>
          </div>
        ))}
      </motion.div>

      <motion.div
        className="flex gap-4 whitespace-nowrap mt-3"
        animate={{ x: ['-50%', '0%'] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
      >
        {[...doubled].reverse().map((tech, i) => (
          <div
            key={`${tech.name}-rev-${i}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-primary/20 transition-all flex-shrink-0 group cursor-default"
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 transition-transform group-hover:scale-150"
              style={{ backgroundColor: tech.color }}
            />
            <span className="text-sm font-medium text-muted-foreground/80 group-hover:text-foreground transition-colors">
              {tech.name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
