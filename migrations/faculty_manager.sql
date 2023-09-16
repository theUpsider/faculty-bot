-- Add migration script here
-- Database init script for faculty manager

CREATE TABLE IF NOT EXISTS verified_users (
    user_id BIGINT PRIMARY KEY NOT NULL,
    user_email TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_xp (
    user_id BIGINT PRIMARY KEY NOT NULL,
    user_xp FLOAT8 NOT NULL DEFAULT 0.0,
    user_level INTEGER NOT NULL DEFAULT 0
);


-- create sweep task that goes through and deletes all channels that have been marked for deletion
CREATE TABLE IF NOT EXISTS voice_channels (
    channel_id BIGINT PRIMARY KEY NOT NULL,
    owner_id BIGINT NOT NULL,
    deletion_marker BOOL NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS mensaplan (
    date TEXT PRIMARY KEY NOT NULL,
    posted BOOL NOT NULL DEFAULT FALSE,
    plan_hash TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS ads (
    message_id BIGINT PRIMARY KEY NOT NULL,
    posted_at TIME DEFAULT CURRENT_TIME
);

CREATE TABLE IF NOT EXISTS rules (
    rule_number INTEGER PRIMARY KEY NOT NULL UNIQUE,
    rule_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS semestermods (
    user_id BIGINT PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS posted_rss (
    message_id BIGINT PRIMARY KEY NOT NULL,
    rss_title TEXT NOT NULL,
    channel_id BIGINT NOT NULL
);
