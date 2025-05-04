// types/express/index.d.ts
import { Usuario } from '../../models/Usuario' // ajuste o caminho conforme sua estrutura

declare global {
  namespace Express {
    interface Request {
      usuario?: Usuario; // ou o tipo correto do seu objeto de usuário
    }
  }
}
