/*
  Warnings:

  - You are about to drop the column `usedById` on the `Avatar` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Avatar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "altText" TEXT,
    "source" TEXT,
    CONSTRAINT "Avatar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Avatar" ("altText", "id", "source", "userId") SELECT "altText", "id", "source", "userId" FROM "Avatar";
DROP TABLE "Avatar";
ALTER TABLE "new_Avatar" RENAME TO "Avatar";
CREATE UNIQUE INDEX "Avatar_id_key" ON "Avatar"("id");
CREATE TABLE "new_User" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "name" TEXT,
    "currentAvatarId" TEXT,
    CONSTRAINT "User_currentAvatarId_fkey" FOREIGN KEY ("currentAvatarId") REFERENCES "Avatar" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("identifier", "name", "userId") SELECT "identifier", "name", "userId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");
CREATE UNIQUE INDEX "User_currentAvatarId_key" ON "User"("currentAvatarId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
