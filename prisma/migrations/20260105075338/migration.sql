/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Image_externalId_key" ON "Image"("externalId");
