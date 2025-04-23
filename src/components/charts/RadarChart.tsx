import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';

interface RadarChartDataItem {
  [key: string]: string | number;
}

interface RadarChartProps {
  data: RadarChartDataItem[];
  dataKey: string;
  nameKey: string;
  title?: string;
  colors?: string[];
}

const RadarChartComponent: React.FC<RadarChartProps> = ({ 
  data, 
  dataKey,
  nameKey,
  title,
  colors = ['#1E88E5', '#26A69A'] 
}) => {
  return (
    <div className="w-full h-full">
      {title && <h3 className="text-base font-medium mb-2 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey={nameKey} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar 
            name="Desempenho" 
            dataKey={dataKey} 
            stroke={colors[0]} 
            fill={colors[0]} 
            fillOpacity={0.6} 
          />
          <Tooltip formatter={(value) => [`${value}%`, 'Desempenho']} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChartComponent;
