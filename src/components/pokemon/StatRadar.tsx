import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { Stat } from '../../types/pokemon';

interface StatRadarProps {
  stats: Stat[];
}

// Default-exported so it can be React.lazy()-loaded (keeps Recharts out of the
// initial detail bundle until the user switches to the radar view).
export default function StatRadar({ stats }: StatRadarProps) {
  const data = stats.map((s) => ({ stat: s.label, value: s.value, fullMark: 255 }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
        <PolarAngleAxis
          dataKey="stat"
          tick={{ fill: 'currentColor', fontSize: 12 }}
          className="text-gray-500 dark:text-gray-400"
        />
        <PolarRadiusAxis domain={[0, 255]} tick={false} axisLine={false} />
        <Radar
          name="Base"
          dataKey="value"
          stroke="#e53e3e"
          fill="#e53e3e"
          fillOpacity={0.45}
          isAnimationActive
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
