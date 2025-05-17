/*
  Warnings:

  - Added the required column `designation` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Designation" AS ENUM ('PRINCIPAL', 'DEAN', 'TEACHER', 'PROFESSOR', 'STUDENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "designation" "Designation" NOT NULL;
