import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function generateContributions(weeks: number) {
  const data: { date: string; count: number; level: number }[] = [];
  const now = new Date();

  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const rand = Math.random();

      let count: number;
      if (isWeekend) {
        count = rand < 0.5 ? 0 : Math.floor(rand * 6);
      } else {
        count = rand < 0.15 ? 0 : Math.floor(rand * 12 + 1);
      }

      let level: number;
      if (count === 0) level = 0;
      else if (count <= 3) level = 1;
      else if (count <= 6) level = 2;
      else if (count <= 9) level = 3;
      else level = 4;

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        count,
        level,
      });
    }
  }

  return data;
}

const levelColors = [
  'bg-white/[0.04]',
  'bg-green-500/20',
  'bg-green-500/40',
  'bg-green-500/65',
  'bg-green-500',
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function GitHubHeatmap() {
  const weeks = 26;
  const contributions = useMemo(() => generateContributions(weeks), []);
  const totalContributions = useMemo(() => contributions.reduce((s, c) => s + c.count, 0), [contributions]);

  const weekColumns = useMemo(() => {
    const cols: typeof contributions[] = [];
    for (let i = 0; i < contributions.length; i += 7) {
      cols.push(contributions.slice(i, i + 7));
    }
    return cols;
  }, [contributions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="premium-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold font-display text-lg">Contribution Activity</h3>
        <span className="text-sm text-muted-foreground">
          {totalContributions} contributions in the last 6 months
        </span>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-2">
        <div className="inline-flex flex-col gap-0">
          {/* Month labels */}
          <div className="flex gap-[3px] mb-1 ml-8">
            {weekColumns.map((week, wi) => {
              if (wi === 0) return <div key={wi} className="w-[11px]" />;
              const firstDay = week[0];
              const prevWeek = weekColumns[wi - 1]?.[0];
              if (!firstDay || !prevWeek) return <div key={wi} className="w-[11px]" />;
              const curMonth = new Date(firstDay.date).getMonth();
              const prevMonth = new Date(prevWeek.date).getMonth();
              if (curMonth !== prevMonth) {
                return (
                  <span key={wi} className="text-[10px] text-muted-foreground w-[11px] text-center">
                    {months[curMonth]}
                  </span>
                );
              }
              return <div key={wi} className="w-[11px]" />;
            })}
          </div>

          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-1 text-[10px] text-muted-foreground">
              <span className="h-[11px]" />
              <span className="h-[11px] leading-[11px]">Mon</span>
              <span className="h-[11px]" />
              <span className="h-[11px] leading-[11px]">Wed</span>
              <span className="h-[11px]" />
              <span className="h-[11px] leading-[11px]">Fri</span>
              <span className="h-[11px]" />
            </div>

            {/* Grid */}
            <div className="flex gap-[3px]">
              {weekColumns.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day, di) => (
                    <Tooltip key={`${wi}-${di}`}>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: (wi * 7 + di) * 0.002 }}
                          className={`w-[11px] h-[11px] rounded-sm ${levelColors[day.level]} cursor-default transition-all hover:ring-1 hover:ring-primary/50`}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <strong>{day.count} contributions</strong> on {day.date}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {levelColors.map((color, i) => (
          <div key={i} className={`w-[11px] h-[11px] rounded-sm ${color}`} />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </motion.div>
  );
}
