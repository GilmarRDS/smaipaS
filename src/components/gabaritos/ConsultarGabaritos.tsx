
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GabaritoMock } from '@/types/gabaritos';

interface ConsultarGabaritosProps {
  gabaritos: GabaritoMock[];
}

const ConsultarGabaritos: React.FC<ConsultarGabaritosProps> = ({ gabaritos }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gabaritos Cadastrados</CardTitle>
        <CardDescription>
          Visualize e gerencie os gabaritos das avaliações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avaliação</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-center">Questões</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gabaritos.map((gabarito) => (
                <TableRow key={gabarito.id}>
                  <TableCell className="font-medium">{gabarito.avaliacao}</TableCell>
                  <TableCell>{new Date(gabarito.data).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-center">{gabarito.questoes}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">Visualizar</Button>
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="destructive" size="sm">Excluir</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultarGabaritos;
