/*
  Warnings:

  - You are about to drop the column `ciclo` on the `Descritor` table. All the data in the column will be lost.
  - Added the required column `tipo` to the `Descritor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Descritor" DROP COLUMN "ciclo",
ADD COLUMN     "tipo" "TipoAvaliacao" NOT NULL;
