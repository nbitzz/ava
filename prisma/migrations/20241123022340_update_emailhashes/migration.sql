/*
  Warnings:

  - The primary key for the `EmailHashes` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmailHashes" (
    "forUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT 'unknown:${uuid()}',
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
