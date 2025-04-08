
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Users, UserPlus, PenSquare, Trash2 } from 'lucide-react';
import { User, UserRole } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Escola } from '@/types/escolas';

interface ExtendedUser extends User {
  password?: string;
}

const USUARIOS_MOCK: ExtendedUser[] = [
  {
    id: '1',
    name: 'Admin Secretaria',
    email: 'admin@secretaria.edu.br',
    role: 'secretaria',
  },
  {
    id: '2',
    name: 'Escola Municipal A',
    email: 'escola.a@escolas.edu.br',
    role: 'escola',
    schoolId: 'escola-1',
    schoolName: 'Escola Municipal A'
  },
  {
    id: '3',
    name: 'Escola Municipal B',
    email: 'escola.b@escolas.edu.br',
    role: 'escola',
    schoolId: 'escola-2',
    schoolName: 'Escola Municipal B'
  }
];

const ESCOLAS_MOCK: Escola[] = [
  { id: 'escola-1', nome: 'Escola Municipal A', inep: '12345678', endereco: '', telefone: '', diretor: '' },
  { id: 'escola-2', nome: 'Escola Municipal B', inep: '87654321', endereco: '', telefone: '', diretor: '' },
];

const Usuarios = () => {
  const { isSecretaria } = useAuth();
  const [usuarios, setUsuarios] = useState<ExtendedUser[]>(USUARIOS_MOCK);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('escola');
  const [schoolId, setSchoolId] = useState('');

  if (!isSecretaria) {
    toast.error('Acesso restrito à Secretaria de Educação');
    return <Navigate to="/dashboard" replace />;
  }

  const handleOpenForm = (user?: ExtendedUser) => {
    if (user) {
      setEditingUser(user);
      setName(user.name);
      setEmail(user.email);
      setPassword('');
      setRole(user.role);
      setSchoolId(user.schoolId || '');
    } else {
      setEditingUser(null);
      setName('');
      setEmail('');
      setPassword('123456');
      setRole('escola');
      setSchoolId('');
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast.error('Nome e e-mail são obrigatórios');
      return;
    }

    if (role === 'escola' && !schoolId) {
      toast.error('Selecione uma escola para usuários do tipo Escola');
      return;
    }

    const selectedSchool = ESCOLAS_MOCK.find(escola => escola.id === schoolId);
    const schoolName = selectedSchool?.nome;

    if (editingUser) {
      const updatedUsuarios = usuarios.map(user => 
        user.id === editingUser.id 
          ? { 
              ...user, 
              name, 
              email, 
              role,
              ...(role === 'escola' ? { schoolId, schoolName } : { schoolId: undefined, schoolName: undefined })
            }
          : user
      );
      setUsuarios(updatedUsuarios);
      toast.success('Usuário atualizado com sucesso!');
    } else {
      const newUser: ExtendedUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        password,
        ...(role === 'escola' ? { schoolId, schoolName } : {})
      };
      setUsuarios([...usuarios, newUser]);
      toast.success('Usuário cadastrado com sucesso!');
    }
    
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    if (id === '1') {
      toast.error('Não é possível excluir o usuário administrador principal');
      return;
    }

    toast("Confirmar exclusão", {
      description: "Tem certeza que deseja excluir este usuário?",
      action: {
        label: "Excluir",
        onClick: () => {
          setUsuarios(usuarios.filter(user => user.id !== id));
          toast.success('Usuário excluído com sucesso!');
        }
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {}
      }
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Usuários</h1>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenForm()}>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}</DialogTitle>
                <DialogDescription>
                  Preencha os dados do usuário. Usuários do tipo 'Escola' precisam estar vinculados a uma escola.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nome
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                  {!editingUser && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password" className="text-right">
                        Senha
                      </Label>
                      <Input
                        id="password"
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="col-span-3"
                        required
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Tipo
                    </Label>
                    <Select 
                      value={role} 
                      onValueChange={(value: UserRole) => setRole(value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="secretaria">Secretaria</SelectItem>
                        <SelectItem value="escola">Escola</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {role === 'escola' && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="school" className="text-right">
                        Escola
                      </Label>
                      <Select 
                        value={schoolId} 
                        onValueChange={setSchoolId}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecione a escola" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESCOLAS_MOCK.map((escola) => (
                            <SelectItem key={escola.id} value={escola.id}>
                              {escola.nome} (INEP: {escola.inep})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.name}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        usuario.role === 'secretaria' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {usuario.role === 'secretaria' ? 'Secretaria' : 'Escola'}
                      </span>
                    </TableCell>
                    <TableCell>{usuario.schoolName || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenForm(usuario)}
                        >
                          <PenSquare className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={() => handleDelete(usuario.id)}
                          disabled={usuario.id === '1'}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Usuarios;
