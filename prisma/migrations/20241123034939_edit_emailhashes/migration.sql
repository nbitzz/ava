/*
  Warnings:

  - The primary key for the `EmailHashes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `email` was added to the `EmailHashes` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `EmailHashes` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmailHashes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "forUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sha256" BLOB NOT NULL,
    "md5" BLOB NOT NULL,
    "isPrimaryForUserId" TEXT,
    CONSTRAINT "EmailHashes_forUserId_fkey" FOREIGN KEY ("forUserId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EmailHashes_isPrimaryForUserId_fkey" FOREIGN KEY ("isPrimaryForUserId") REFERENCES "User" ("userId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EmailHashes" ("forUserId", "md5", "sha256") SELECT "forUserId", "md5", "sha256" FROM "EmailHashes";
DROP TABLE "EmailHashes";
ALTER TABLE "new_EmailHashes" RENAME TO "EmailHashes";
CREATE UNIQUE INDEX "EmailHashes_email_key" ON "EmailHashes"("email");
CREATE UNIQUE INDEX "EmailHashes_isPrimaryForUserId_key" ON "EmailHashes"("isPrimaryForUserId");
CREATE UNIQUE INDEX "EmailHashes_sha256_md5_key" ON "EmailHashes"("sha256", "md5");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
