/*
  Warnings:

  - Added the required column `ano` to the `Descritor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turno` to the `Gabarito` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Aluno" ALTER COLUMN "dataNascimento" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Descritor" ADD COLUMN     "ano" TEXT NOT NULL DEFAULT '1º ano';

-- AlterTable
ALTER TABLE "Gabarito" ADD COLUMN     "turno" "Turno" NOT NULL;
