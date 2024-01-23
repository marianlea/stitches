CREATE DATABASE stitches;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT,
    email TEXT,
    password_digest TEXT,
    profile_pic_url TEXT,
    description TEXT,
    followers INTEGER ARRAY,
    following INTEGER ARRAY
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    post TEXT,
    type TEXT,
    user_id INTEGER,
    hearts INTEGER,
    reply_ids INTEGER ARRAY
);

INSERT INTO users (username, email, password_digest)
VALUES ('testing', 'lea@hello.com', 'cookie123');
