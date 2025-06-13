/*
  Warnings:

  - You are about to drop the column `sheepImportId` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `arrivalDate` on the `SheepImport` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `SheepImport` table. All the data in the column will be lost.
  - You are about to drop the column `wilayaId` on the `SheepImport` table. All the data in the column will be lost.
  - Added the required column `familyNotebookNumber` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wilayaAllocationId` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `importDate` to the `SheepImport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originCountry` to the `SheepImport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remainingQuantity` to the `SheepImport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalQuantity` to the `SheepImport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Wilaya` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "WilayaAllocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sheepImportId" TEXT NOT NULL,
    "wilayaId" TEXT NOT NULL,
    "allocatedQuantity" INTEGER NOT NULL,
    "remainingQuantity" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WilayaAllocation_sheepImportId_fkey" FOREIGN KEY ("sheepImportId") REFERENCES "SheepImport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WilayaAllocation_wilayaId_fkey" FOREIGN KEY ("wilayaId") REFERENCES "Wilaya" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "wilayaAllocationId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "familyNotebookNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_wilayaAllocationId_fkey" FOREIGN KEY ("wilayaAllocationId") REFERENCES "WilayaAllocation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("createdAt", "id", "quantity", "status", "updatedAt", "userId") SELECT "createdAt", "id", "quantity", "status", "updatedAt", "userId" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE TABLE "new_SheepImport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchName" TEXT,
    "batchNumber" TEXT,
    "importDate" DATETIME NOT NULL,
    "totalQuantity" INTEGER NOT NULL,
    "remainingQuantity" INTEGER NOT NULL,
    "originCountry" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SheepImport" ("batchNumber", "createdAt", "id", "status", "updatedAt") SELECT "batchNumber", "createdAt", "id", "status", "updatedAt" FROM "SheepImport";
DROP TABLE "SheepImport";
ALTER TABLE "new_SheepImport" RENAME TO "SheepImport";
CREATE UNIQUE INDEX "SheepImport_batchNumber_key" ON "SheepImport"("batchNumber");
CREATE TABLE "new_Wilaya" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Wilaya" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "Wilaya";
DROP TABLE "Wilaya";
ALTER TABLE "new_Wilaya" RENAME TO "Wilaya";
CREATE UNIQUE INDEX "Wilaya_name_key" ON "Wilaya"("name");
CREATE UNIQUE INDEX "Wilaya_code_key" ON "Wilaya"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
