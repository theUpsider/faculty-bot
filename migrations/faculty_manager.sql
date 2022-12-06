-- Add migration script here
-- Database init script for faculty manager

CREATE TABLE IF NOT EXISTS `verified_users` (
    'user_id' INTEGER PRIMARY KEY NOT NULL,
    'user_email' TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `user_xp` (
    'user_id' INTEGER PRIMARY KEY NOT NULL,
    'user_xp' INTEGER NOT NULL
);


-- create sweep task that goes through and deletes all channels that have been marked for deletion
CREATE TABLE IF NOT EXISTS `voice_channels` (
    'channel_id' INTEGER PRIMARY KEY NOT NULL,
    'owner_id' INTEGER NOT NULL,
    'deleted' INT(1) NOT NULL
);

CREATE TABLE IF NOT EXISTS `mensaplan_hashes` (
    'hash' TEXT NOT NULL,
    'date' TIME DEFAULT CURRENT_TIMESTAMP,
    `is_posted_already` INT(1) NOT NULL
);

CREATE TABLE IF NOT EXISTS `ads` (
    `message_id` INTEGER PRIMARY KEY NOT NULL,
    `posted_at` TIME DEFAULT CURRENT_TIMESTAMP
);