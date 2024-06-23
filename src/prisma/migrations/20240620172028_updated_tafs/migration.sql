/*
  Warnings:

  - The primary key for the `DoubtTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `DoubtTag` table. All the data in the column will be lost.
  - The primary key for the `ProjectTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ProjectTag` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "DoubtTag_doubtId_tagId_key";

-- DropIndex
DROP INDEX "ProjectTag_projectId_tagId_key";

-- AlterTable
ALTER TABLE "DoubtTag" DROP CONSTRAINT "DoubtTag_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "DoubtTag_pkey" PRIMARY KEY ("doubtId", "tagId");

-- AlterTable
ALTER TABLE "ProjectTag" DROP CONSTRAINT "ProjectTag_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "ProjectTag_pkey" PRIMARY KEY ("projectId", "tagId");
