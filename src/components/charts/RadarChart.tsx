import React from 'react';
import { RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface RadarChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  dataKey: string;
  nameKey: string;
  colors: string[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RadarChart: React.FC<RadarChartProps> = ({ data, dataKey, nameKey, colors }) => {
  const chartConfig = {
    value: {
      label: 'Desempenho',
      color: colors[0]
    }
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis
            dataKey={nameKey}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <Radar
            name="Desempenho"
            dataKey={dataKey}
            stroke={colors[0]}
            fill={colors[0]}
            fillOpacity={0.6}
          />
          <Tooltip content={<CustomTooltip />} />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;
