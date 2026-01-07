-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'DIGITRAFFIC',
    "type" TEXT NOT NULL DEFAULT 'UNCLASSIFIED',
    "difficulty" TEXT NOT NULL DEFAULT 'UNCLASSIFIED',
    "updateTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewState" TEXT NOT NULL DEFAULT 'INCOMPLETE',
    "available" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Rect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "width" REAL NOT NULL,
    "height" REAL NOT NULL,
    CONSTRAINT "Rect_id_fkey" FOREIGN KEY ("id") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_externalId_key" ON "Image"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
