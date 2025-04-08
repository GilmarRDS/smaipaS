
import { ActionButton } from '@/components/ui/action-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Escola } from '@/types/escolas';

interface EscolasListProps {
  escolas: Escola[];
  onEdit: (escola: Escola) => void;
  onDelete: (id: string) => void;
}

const EscolasList = ({ escolas, onEdit, onDelete }: EscolasListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Escolas</CardTitle>
      </CardHeader>
      <CardContent>
        {escolas.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Nenhuma escola cadastrada
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código INEP</TableHead>
                <TableHead>Diretor(a)</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {escolas.map((escola) => (
                <TableRow key={escola.id}>
                  <TableCell className="font-medium">{escola.nome}</TableCell>
                  <TableCell>{escola.inep}</TableCell>
                  <TableCell>{escola.diretor}</TableCell>
                  <TableCell>{escola.telefone}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <ActionButton
                        action="edit"
                        iconOnly
                        onClick={() => onEdit(escola)}
                      />
                      <ActionButton
                        action="delete"
                        iconOnly
                        onClick={() => onDelete(escola.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default EscolasList;
