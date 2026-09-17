/*
  Warnings:

  - Added the required column `createdById` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Gallery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `article` ADD COLUMN `approvalStatus` ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
    ADD COLUMN `createdById` VARCHAR(191) NULL,
    ADD COLUMN `rejectionReason` TEXT NULL,
    ADD COLUMN `reviewedAt` DATETIME(3) NULL,
    ADD COLUMN `reviewedById` VARCHAR(191) NULL,
    ADD COLUMN `submittedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `category` ADD COLUMN `createdById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `gallery` ADD COLUMN `approvalStatus` ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
    ADD COLUMN `createdById` VARCHAR(191) NULL,
    ADD COLUMN `rejectionReason` TEXT NULL,
    ADD COLUMN `reviewedAt` DATETIME(3) NULL,
    ADD COLUMN `reviewedById` VARCHAR(191) NULL,
    ADD COLUMN `submittedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `inquiry` ADD COLUMN `handledById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `approvalStatus` ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
    ADD COLUMN `createdById` VARCHAR(191) NULL,
    ADD COLUMN `rejectionReason` TEXT NULL,
    ADD COLUMN `reviewedAt` DATETIME(3) NULL,
    ADD COLUMN `reviewedById` VARCHAR(191) NULL,
    ADD COLUMN `submittedAt` DATETIME(3) NULL;

-- Backfill: baris yang sudah ada dianggap buatan admin pertama (data resmi).
UPDATE `article` SET `createdById` = (SELECT `id` FROM `User` WHERE `role` = 'ADMIN' ORDER BY `createdAt` ASC LIMIT 1) WHERE `createdById` IS NULL;
UPDATE `category` SET `createdById` = (SELECT `id` FROM `User` WHERE `role` = 'ADMIN' ORDER BY `createdAt` ASC LIMIT 1) WHERE `createdById` IS NULL;
UPDATE `gallery` SET `createdById` = (SELECT `id` FROM `User` WHERE `role` = 'ADMIN' ORDER BY `createdAt` ASC LIMIT 1) WHERE `createdById` IS NULL;
UPDATE `product` SET `createdById` = (SELECT `id` FROM `User` WHERE `role` = 'ADMIN' ORDER BY `createdAt` ASC LIMIT 1) WHERE `createdById` IS NULL;

-- Kencangkan menjadi NOT NULL setelah backfill.
ALTER TABLE `article` MODIFY COLUMN `createdById` VARCHAR(191) NOT NULL;
ALTER TABLE `category` MODIFY COLUMN `createdById` VARCHAR(191) NOT NULL;
ALTER TABLE `gallery` MODIFY COLUMN `createdById` VARCHAR(191) NOT NULL;
ALTER TABLE `product` MODIFY COLUMN `createdById` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `role` ENUM('ADMIN', 'WORKER') NOT NULL DEFAULT 'ADMIN';

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `link` VARCHAR(500) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_isRead_idx`(`userId`, `isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(100) NOT NULL,
    `entityType` VARCHAR(50) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `fromStatus` VARCHAR(50) NULL,
    `toStatus` VARCHAR(50) NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ActivityLog_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `ActivityLog_actorId_idx`(`actorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Article_approvalStatus_idx` ON `Article`(`approvalStatus`);

-- CreateIndex
CREATE INDEX `Article_createdById_idx` ON `Article`(`createdById`);

-- CreateIndex
CREATE INDEX `Category_createdById_idx` ON `Category`(`createdById`);

-- CreateIndex
CREATE INDEX `Gallery_approvalStatus_idx` ON `Gallery`(`approvalStatus`);

-- CreateIndex
CREATE INDEX `Gallery_createdById_idx` ON `Gallery`(`createdById`);

-- CreateIndex
CREATE INDEX `Inquiry_handledById_idx` ON `Inquiry`(`handledById`);

-- CreateIndex
CREATE INDEX `Product_approvalStatus_idx` ON `Product`(`approvalStatus`);

-- CreateIndex
CREATE INDEX `Product_createdById_idx` ON `Product`(`createdById`);

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gallery` ADD CONSTRAINT `Gallery_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gallery` ADD CONSTRAINT `Gallery_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inquiry` ADD CONSTRAINT `Inquiry_handledById_fkey` FOREIGN KEY (`handledById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
