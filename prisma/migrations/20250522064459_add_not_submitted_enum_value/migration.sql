/*
  Warnings:

  - You are about to drop the column `status` on the `StudentProfile` table. All the data in the column will be lost.
  - Added the required column `awardStatus` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `psaStatus` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "SubmissionStatus" ADD VALUE 'NOT_SUBMITTED';

-- AlterTable
ALTER TABLE "StudentProfile" DROP COLUMN "status",
ADD COLUMN     "awardStatus" "SubmissionStatus" NOT NULL,
ADD COLUMN     "overallStatus" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "psaStatus" "SubmissionStatus" NOT NULL;
