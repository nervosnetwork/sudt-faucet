-- 创建数据库
-- create database `sudt_faucet` default character set utf8 collate utf8_general_ci;

use sudt_faucet;

-- 建表

CREATE TABLE `mail_issue` (
                              `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
                              `mail_address` varchar(255) NOT NULL,
                              `sudt_id` varchar(255) NOT NULL,
                              `amount` decimal(36,0) unsigned NOT NULL,
                              `secret` varchar(32) NOT NULL,
                              `mail_message` varchar(2048) DEFAULT NULL,
                              `expire_time` bigint(20) DEFAULT NULL,
                              `claim_time` bigint(20) DEFAULT NULL,
                              `claim_address` varchar(255) DEFAULT NULL,
                              `tx_hash` varchar(66) DEFAULT NULL,
                              `confirm_number` int(11) DEFAULT NULL,
                              `confirm_time` bigint(20) DEFAULT NULL,
                              `status` varchar(255) NOT NULL,
                              `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                              PRIMARY KEY (`id`),
                              UNIQUE KEY `mail_issue_secret_unique` (`secret`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- use mysql;
-- select host, user from user;
-- GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '123456' WITH GRANT OPTION;
-- flush privileges;
