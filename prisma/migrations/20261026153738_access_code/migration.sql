/*
  Warnings:

  - You are about to drop the column `accessCodeHash` on the `Invitation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "accessCodeHash",
ADD COLUMN     "accessCode" TEXT;
