import 'express';
import { Request } from 'express';

declare module 'express' {
  export interface Request {
    usuario?: {
      id: string;
      role: string;
      escolaId?: string;
    };
    file?: Express.Multer.File;
    files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
  }
}
