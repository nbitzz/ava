-- CreateTable
CREATE TABLE "EmailHashes" (
    "forUserId" TEXT NOT NULL PRIMARY KEY,
    "sha256" BLOB NOT NULL,
    CONSTRAINT "EmailHashes_forUserId_fkey" FOREIGN KEY ("forUserId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
