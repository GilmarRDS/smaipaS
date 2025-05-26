import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Descritor } from '@/types/gabaritos';

interface DownloadTemplateGabaritoProps {
  numQuestoes: string;
  descritores: Descritor[];
}

const DownloadTemplateGabarito: React.FC<DownloadTemplateGabaritoProps> = ({ numQuestoes, descritores }) => {
  const handleDownload = () => {
    const num = parseInt(numQuestoes, 10);
    if (!num || num <= 0) return;

    // Criar dados da primeira aba (Gabarito)
    const gabaritoData = [
      ['Questão', 'Resposta', 'Descritor Código'],
      ...Array.from({ length: num }, (_, i) => [
        (i + 1).toString(),
        '',
        ''
      ])
    ];

    // Criar dados da segunda aba (Descritores)
    const descritoresData = [
      ['Código', 'Descrição'],
      ...descritores.map(d => [d.codigo, d.descricao])
    ];

    // Criar workbook
    const wb = XLSX.utils.book_new();

    // Adicionar aba do Gabarito
    const wsGabarito = XLSX.utils.aoa_to_sheet(gabaritoData);
    XLSX.utils.book_append_sheet(wb, wsGabarito, 'Gabarito');

    // Adicionar aba de Descritores (somente se houver descritores)
    if (descritores.length > 0) {
      const wsDescritores = XLSX.utils.aoa_to_sheet(descritoresData);
      XLSX.utils.book_append_sheet(wb, wsDescritores, 'Descritores');
    }

    // Gerar arquivo
    XLSX.writeFile(wb, 'template_gabarito.xlsx');
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      disabled={!numQuestoes || parseInt(numQuestoes, 10) <= 0}
      className="w-full"
    >
      <Download className="mr-2 h-4 w-4" />
      Baixar Template (com Descritores)
    </Button>
  );
};

export default DownloadTemplateGabarito; 