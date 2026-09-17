-- AlterTable
ALTER TABLE `article` ADD COLUMN `pendingContent` LONGTEXT NULL,
    ADD COLUMN `pendingExcerpt` VARCHAR(500) NULL,
    ADD COLUMN `pendingSlug` VARCHAR(191) NULL,
    ADD COLUMN `pendingThumbnail` VARCHAR(500) NULL,
    ADD COLUMN `pendingTitle` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `category` ADD COLUMN `pendingDescription` TEXT NULL,
    ADD COLUMN `pendingName` VARCHAR(100) NULL,
    ADD COLUMN `pendingSlug` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `gallery` ADD COLUMN `pendingCategory` VARCHAR(100) NULL,
    ADD COLUMN `pendingTitle` VARCHAR(191) NULL;
