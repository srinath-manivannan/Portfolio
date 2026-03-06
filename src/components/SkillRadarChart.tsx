import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SkillData {
  name: string;
  value: number;
}

interface SkillRadarChartProps {
  skills?: SkillData[];
  size?: number;
}

const defaultSkills: SkillData[] = [
  { name: 'Frontend', value: 95 },
  { name: 'Backend', value: 88 },
  { name: 'DevOps', value: 75 },
  { name: 'AI/ML', value: 80 },
  { name: 'Database', value: 85 },
  { name: 'UI/UX', value: 78 },
];

export default function SkillRadarChart({ skills = defaultSkills, size = 280 }: SkillRadarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const padding = 50;
  const svgSize = size + padding * 2;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const maxR = size * 0.35;
  const levels = 5;
  const angleStep = (Math.PI * 2) / skills.length;

  const rings = useMemo(() => {
    return Array.from({ length: levels }, (_, level) => {
      const r = (maxR / levels) * (level + 1);
      return skills
        .map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        })
        .join(' ');
    });
  }, [skills, cx, cy, maxR, angleStep]);

  const dataPoints = useMemo(() => {
    return skills.map((skill, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = (skill.value / 100) * maxR;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), skill };
    });
  }, [skills, cx, cy, maxR, angleStep]);

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const labelPositions = useMemo(() => {
    return skills.map((skill, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const labelR = maxR + 35;
      return {
        x: cx + labelR * Math.cos(angle),
        y: cy + labelR * Math.sin(angle),
        skill,
      };
    });
  }, [skills, cx, cy, maxR, angleStep]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative"
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${svgSize} ${svgSize}`} className="mx-auto" style={{ maxWidth: svgSize, maxHeight: svgSize }}>
        <defs>
          <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(220, 90%, 56%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(262, 83%, 58%)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(220, 90%, 56%)" />
            <stop offset="100%" stopColor="hsl(262, 83%, 58%)" />
          </linearGradient>
        </defs>

        {/* Grid rings */}
        {rings.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={i === rings.length - 1 ? 1 : 0.5}
            opacity={0.3}
          />
        ))}

        {/* Axis lines */}
        {skills.map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + maxR * Math.cos(angle)}
              y2={cy + maxR * Math.sin(angle)}
              stroke="hsl(var(--border))"
              strokeWidth={0.5}
              opacity={0.3}
            />
          );
        })}

        {/* Data polygon */}
        <motion.polygon
          points={dataPolygon}
          fill="url(#radarFill)"
          stroke="url(#radarStroke)"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Data points */}
        {dataPoints.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={hoveredIndex === i ? 6 : 4}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth={2}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 + i * 0.1 }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer"
            style={{ transformOrigin: `${point.x}px ${point.y}px` }}
          />
        ))}

        {/* Labels */}
        {labelPositions.map((pos, i) => (
          <text
            key={i}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-xs font-medium fill-current transition-colors ${
              hoveredIndex === i ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {pos.skill.name}
          </text>
        ))}
      </svg>

      {/* Hovered skill tooltip */}
      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl px-4 py-2 pointer-events-none"
            style={{ background: 'hsl(var(--card) / 0.95)', backdropFilter: 'blur(24px)', border: '1px solid hsl(var(--border))' }}
          >
            <div className="text-center">
              <div className="text-sm font-bold">{skills[hoveredIndex].name}</div>
              <div className="text-2xl font-bold gradient-text-premium">{skills[hoveredIndex].value}%</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
