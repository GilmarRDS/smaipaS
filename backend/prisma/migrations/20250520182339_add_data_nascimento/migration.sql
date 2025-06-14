/*
  Warnings:

  - Added the required column `dataNascimento` to the `Aluno` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN "dataNascimento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
