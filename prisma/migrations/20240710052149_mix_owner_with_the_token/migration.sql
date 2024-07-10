-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Token" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "refreshToken" TEXT
);
INSERT INTO "new_Token" ("id", "owner", "refreshToken", "token") SELECT "id", "owner", "refreshToken", "token" FROM "Token";
DROP TABLE "Token";
ALTER TABLE "new_Token" RENAME TO "Token";
CREATE UNIQUE INDEX "Token_id_key" ON "Token"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
