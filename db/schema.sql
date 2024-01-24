CREATE DATABASE stitches;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT,
    email TEXT,
    password_digest TEXT,
    profile_pic_url TEXT,
    description TEXT,
    followers INTEGER ARRAY,
    following INTEGER ARRAY,
    date_created TEXT
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    post TEXT,
    type TEXT,
    user_id INTEGER,
    hearts INTEGER,
    reply_ids INTEGER ARRAY,
    date_created TEXT
);

INSERT INTO users (username, email, password_digest)
VALUES ('testing', 'lea@hello.com', 'cookie123');

INSERT INTO posts (post, type, user_id)
VALUES ('hi everyone!', 'post', 1);
