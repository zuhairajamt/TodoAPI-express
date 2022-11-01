/*
  Warnings:

  - Added the required column `title` to the `todo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `todo` ADD COLUMN `title` VARCHAR(100) NOT NULL;
