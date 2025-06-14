import React from 'react';
import { RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
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

const RadarChart: React.FC<RadarChartProps> = ({ data, dataKey, nameKey, colors }) => {
  const chartConfig = {
    value: {
      label: 'Desempenho',
      color: colors[0]
    }
  };

  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer>
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey={nameKey} tick={{ fill: '#9CA3AF' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
          <Radar
            name="Desempenho"
            dataKey={dataKey}
            stroke={colors[0]}
            fill={colors[0]}
            fillOpacity={0.6}
          />
          <ChartTooltipContent />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default RadarChart;
