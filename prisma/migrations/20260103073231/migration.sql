/*
  Warnings:

  - Added the required column `reviewState` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateTime` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "updateTime" DATETIME NOT NULL,
    "reviewState" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Image" ("difficulty", "externalId", "id", "type") SELECT "difficulty", "externalId", "id", "type" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
