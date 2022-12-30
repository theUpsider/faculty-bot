-- Add migration script here
-- Database init script for faculty manager

CREATE TABLE IF NOT EXISTS `verified_users` (
    'user_id' INTEGER PRIMARY KEY NOT NULL,
    'user_email' TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `user_xp` (
    'user_id' INTEGER PRIMARY KEY NOT NULL,
    'user_xp' REAL NOT NULL DEFAULT 0.0,
    'user_level' INTEGER NOT NULL DEFAULT 0
);


-- create sweep task that goes through and deletes all channels that have been marked for deletion
CREATE TABLE IF NOT EXISTS `voice_channels` (
    'channel_id' INTEGER PRIMARY KEY NOT NULL,
    'owner_id' INTEGER NOT NULL,
    'deleted' INT(1) NOT NULL
);

CREATE TABLE IF NOT EXISTS `mensaplan` (
    'date' TEXT PRIMARY KEY NOT NULL,
    'posted' BOOLEAN NOT NULL DEFAULT FALSE,
    'plan_hash' TEXT
);

CREATE TABLE IF NOT EXISTS `ads` (
    `message_id` INTEGER PRIMARY KEY NOT NULL,
    `posted_at` TIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `rules` (
    `rule_number` INTEGER PRIMARY KEY NOT NULL UNIQUE,
    `rule_text` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `semestermods` (
    `user_id` INTEGER PRIMARY KEY NOT NULL
)