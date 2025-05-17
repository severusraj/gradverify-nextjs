-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastResendAt" TIMESTAMP(3),
ADD COLUMN     "resendCount" INTEGER NOT NULL DEFAULT 0;
