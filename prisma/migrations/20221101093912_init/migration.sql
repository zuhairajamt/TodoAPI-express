-- DropForeignKey
ALTER TABLE `todo` DROP FOREIGN KEY `todo_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `todo` ADD CONSTRAINT `todo_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
