/*
  Warnings:

  - You are about to drop the column `awardsS3Key` on the `StudentProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Award" ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "StudentProfile" DROP COLUMN "awardsS3Key";
