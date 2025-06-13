/*
  Warnings:

  - A unique constraint covering the columns `[familyNotebookNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "familyNotebookNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_familyNotebookNumber_key" ON "User"("familyNotebookNumber");
