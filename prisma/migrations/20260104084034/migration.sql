-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'UNCLASSIFIED',
    "difficulty" TEXT NOT NULL DEFAULT 'UNCLASSIFIED',
    "updateTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewState" TEXT NOT NULL DEFAULT 'INCOMPLETE',
    "available" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Image" ("available", "difficulty", "externalId", "id", "reviewState", "type", "updateTime") SELECT "available", "difficulty", "externalId", "id", "reviewState", "type", "updateTime" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
