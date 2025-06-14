/*
  Warnings:

  - You are about to drop the column `escolaId` on the `Avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `turmaId` on the `Avaliacao` table. All the data in the column will be lost.
  - Added the required column `ano` to the `Avaliacao` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Avaliacao" DROP CONSTRAINT "Avaliacao_escolaId_fkey";

-- DropForeignKey
ALTER TABLE "Avaliacao" DROP CONSTRAINT "Avaliacao_turmaId_fkey";

-- AlterTable
ALTER TABLE "Avaliacao" DROP COLUMN "escolaId",
DROP COLUMN "turmaId",
ADD COLUMN     "ano" TEXT NOT NULL;
