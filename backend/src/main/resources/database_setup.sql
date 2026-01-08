-- Alumni Platform Database Setup Script
-- Run this script in MySQL Workbench or MySQL command line

-- Create database
CREATE DATABASE IF NOT EXISTS alumini_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE alumini_db;

-- Create user (optional - if you want a dedicated user)
-- CREATE USER 'alumni_user'@'localhost' IDENTIFIED BY 'password123';
-- GRANT ALL PRIVILEGES ON alumini_db.* TO 'alumni_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Show confirmation
SELECT 'Database alumini_db created successfully!' as Status;
SHOW DATABASES LIKE 'alumini_db';