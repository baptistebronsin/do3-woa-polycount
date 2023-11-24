/*
  Warnings:

  - You are about to drop the column `token` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "token" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "token";
