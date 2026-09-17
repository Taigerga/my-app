-- AlterTable
ALTER TABLE `category` ADD COLUMN `approvalStatus` ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
    ADD COLUMN `rejectionReason` TEXT NULL,
    ADD COLUMN `reviewedAt` DATETIME(3) NULL,
    ADD COLUMN `reviewedById` VARCHAR(191) NULL,
    ADD COLUMN `submittedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Category_approvalStatus_idx` ON `Category`(`approvalStatus`);

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
