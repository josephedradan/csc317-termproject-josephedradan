-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema csc_317_termproject
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema csc_317_termproject
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `csc_317_termproject` DEFAULT CHARACTER SET utf8 ;
USE `csc_317_termproject` ;

-- -----------------------------------------------------
-- Table `csc_317_termproject`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `csc_317_termproject`.`users` (
  `users_id` INT NOT NULL AUTO_INCREMENT,
  `users_username` VARCHAR(64) NOT NULL,
  `users_email` VARCHAR(128) NOT NULL,
  `users_password` VARCHAR(128) NOT NULL,
  `users_usertype` INT NOT NULL DEFAULT 0,
  `users_active` INT NOT NULL DEFAULT 0,
  `users_date_created` DATETIME NOT NULL DEFAULT now(),
  PRIMARY KEY (`users_id`),
  UNIQUE INDEX `users_id_UNIQUE` (`users_id` ASC) VISIBLE,
  UNIQUE INDEX `users_username_UNIQUE` (`users_username` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`users_email` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `csc_317_termproject`.`posts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `csc_317_termproject`.`posts` (
  `posts_id` INT NOT NULL AUTO_INCREMENT,
  `posts_title` VARCHAR(128) NOT NULL,
  `posts_description` LONGTEXT NOT NULL,
  `posts_path_file` VARCHAR(4096) NOT NULL,
  `posts_path_thumbnail` VARCHAR(4096) NOT NULL,
  `posts_active` INT NOT NULL DEFAULT 0,
  `posts_date_created` DATETIME NOT NULL DEFAULT now(),
  `posts_fk_users_id` INT NOT NULL,
  PRIMARY KEY (`posts_id`),
  UNIQUE INDEX `posts_id_UNIQUE` (`posts_id` ASC) VISIBLE,
  INDEX `posts_fk_users_id_FK_users_id` (`posts_fk_users_id` ASC) VISIBLE,
  CONSTRAINT `CONSTRAINT_posts_fk_users_id_FK_users_id`
    FOREIGN KEY (`posts_fk_users_id`)
    REFERENCES `csc_317_termproject`.`users` (`users_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `csc_317_termproject`.`comments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `csc_317_termproject`.`comments` (
  `comments_id` INT NOT NULL AUTO_INCREMENT,
  `comments_comment` LONGTEXT NOT NULL,
  `comments_date_created` DATETIME NOT NULL DEFAULT now(),
  `comments_fk_users_id` INT NOT NULL,
  `comments_fk_posts_id` INT NOT NULL,
  PRIMARY KEY (`comments_id`),
  UNIQUE INDEX `comments_id_UNIQUE` (`comments_id` ASC) VISIBLE,
  INDEX `comments_fk_users_id_FK_users_id` (`comments_fk_users_id` ASC) VISIBLE,
  CONSTRAINT `CONSTRAINT_comments_fk_users_id_FK_users_id`
    FOREIGN KEY (`comments_fk_users_id`)
    REFERENCES `csc_317_termproject`.`users` (`users_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  INDEX `comments_fk_posts_id_FK_users_id` (`comments_fk_posts_id` ASC) VISIBLE,
  CONSTRAINT `CONSTRAINT_comments_fk_posts_id_FK_posts_id`
    FOREIGN KEY (`comments_fk_posts_id`)
    REFERENCES `csc_317_termproject`.`posts` (`posts_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
