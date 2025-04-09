
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DifficultyAnalysis: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Principais Dificuldades Identificadas</CardTitle>
        <CardDescription>
          Descritores com menor percentual de acerto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-1 bg-red-500 rounded"></div>
                <span className="font-medium">D15 - Reconhecer diferentes formas de tratar a informação</span>
              </div>
              <span className="font-semibold">42.3%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '42.3%' }}></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-1 bg-orange-500 rounded"></div>
                <span className="font-medium">D23 - Resolver problemas com números racionais</span>
              </div>
              <span className="font-semibold">48.7%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '48.7%' }}></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-1 bg-yellow-500 rounded"></div>
                <span className="font-medium">D08 - Interpretar textos que articulam linguagens verbais e não verbais</span>
              </div>
              <span className="font-semibold">52.5%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '52.5%' }}></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-1 bg-yellow-500 rounded"></div>
                <span className="font-medium">D30 - Calcular área de figuras planas</span>
              </div>
              <span className="font-semibold">54.2%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '54.2%' }}></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-1 bg-green-500 rounded"></div>
                <span className="font-medium">D03 - Inferir o sentido de uma palavra ou expressão</span>
              </div>
              <span className="font-semibold">61.8%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '61.8%' }}></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DifficultyAnalysis;
