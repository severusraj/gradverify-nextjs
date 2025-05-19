/*
  Warnings:

  - Added the required column `email` to the `VerificationToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "VerificationToken_userId_idx";

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "email" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;
