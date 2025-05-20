/*
  Warnings:

  - You are about to drop the `Feedback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Submission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_studentId_fkey";

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "Feedback";

-- DropTable
DROP TABLE "Submission";
