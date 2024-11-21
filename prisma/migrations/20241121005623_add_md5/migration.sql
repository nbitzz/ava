/*
  Warnings:

  - Added the required column `md5` to the `EmailHashes` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmailHashes" (
    "forUserId" TEXT NOT NULL PRIMARY KEY,
    "sha256" BLOB NOT NULL,
    "md5" BLOB NOT NULL,
    CONSTRAINT "EmailHashes_forUserId_fkey" FOREIGN KEY ("forUserId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EmailHashes" ("forUserId", "sha256") SELECT "forUserId", "sha256" FROM "EmailHashes";
DROP TABLE "EmailHashes";
ALTER TABLE "new_EmailHashes" RENAME TO "EmailHashes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
