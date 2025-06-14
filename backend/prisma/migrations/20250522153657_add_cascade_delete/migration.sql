-- DropForeignKey
ALTER TABLE "Aluno" DROP CONSTRAINT "Aluno_turmaId_fkey";

-- DropForeignKey
ALTER TABLE "Avaliacao" DROP CONSTRAINT "Avaliacao_escolaId_fkey";

-- DropForeignKey
ALTER TABLE "Avaliacao" DROP CONSTRAINT "Avaliacao_turmaId_fkey";

-- DropForeignKey
ALTER TABLE "Gabarito" DROP CONSTRAINT "Gabarito_avaliacaoId_fkey";

-- DropForeignKey
ALTER TABLE "ItemGabarito" DROP CONSTRAINT "ItemGabarito_gabaritoId_fkey";

-- DropForeignKey
ALTER TABLE "ItemResposta" DROP CONSTRAINT "ItemResposta_respostaId_fkey";

-- DropForeignKey
ALTER TABLE "Resposta" DROP CONSTRAINT "Resposta_alunoId_fkey";

-- DropForeignKey
ALTER TABLE "Resposta" DROP CONSTRAINT "Resposta_avaliacaoId_fkey";

-- DropForeignKey
ALTER TABLE "Turma" DROP CONSTRAINT "Turma_escolaId_fkey";

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gabarito" ADD CONSTRAINT "Gabarito_avaliacaoId_fkey" FOREIGN KEY ("avaliacaoId") REFERENCES "Avaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemGabarito" ADD CONSTRAINT "ItemGabarito_gabaritoId_fkey" FOREIGN KEY ("gabaritoId") REFERENCES "Gabarito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resposta" ADD CONSTRAINT "Resposta_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resposta" ADD CONSTRAINT "Resposta_avaliacaoId_fkey" FOREIGN KEY ("avaliacaoId") REFERENCES "Avaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemResposta" ADD CONSTRAINT "ItemResposta_respostaId_fkey" FOREIGN KEY ("respostaId") REFERENCES "Resposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
