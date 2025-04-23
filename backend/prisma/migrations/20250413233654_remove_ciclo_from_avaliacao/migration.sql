/*
  Warnings:

  - You are about to drop the column `ciclo` on the `Avaliacao` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Avaliacao" DROP COLUMN "ciclo";

-- DropEnum
DROP TYPE "Ciclo";
