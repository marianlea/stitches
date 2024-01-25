const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcrypt')
const ensureLoggedIn = require('../middlewares/ensure_logged_in')

router.get('/user/new', (req, res) => {

    let prompt = ''
    res.render('user/new', { prompt: prompt})

})

router.post('/signup', (req, res) => {

    let prompt = ''
    const username = req.body.username
    const email = req.body.email
    const plaintextPass = req.body.password
    const defaultProfilePic = 'https://fakeimg.pl/200x200?text=profile_pic'
    
    const sql = `
        SELECT * FROM users
        WHERE username = $1 OR email = $2;
    `

    db.query(sql, [username, email], (err, result) => {

        if (err) {
            console.log(err);
            return
        }
        
        if (result.rowCount > 0) {

            prompt = 'username or email is already taken'
            res.render('user/new', { prompt: prompt })
            return

        } else {

            const saltRound = 10
            
            bcrypt.genSalt(saltRound, (err, salt) => {

                if(err) {
                    console.log(err);
                    return
                }
            
                bcrypt.hash(plaintextPass, salt, (err, hashedPass) => {
            
                    if(err) {
                        console.log(err);
                        return
                    }
            
                    const sql = `
                        INSERT INTO users
                        (username, email, password_digest, profile_pic_url)
                        VALUES
                        ($1, $2, $3, $4);
                    `
            
                    db.query(sql, [username, email, hashedPass, defaultProfilePic], (err, result) => {
            
                        if(err) {

                            console.log(err);
                            return

                        } else {

                            console.log('user created');
                        }

                        let sessionPrompt = 'Sign up successful. Please log in to proceed.'
                        res.render ('login', { sessionPrompt: sessionPrompt })
                    })
            
                })
            
            })

        }

    })
})

router.get('/users/:username', ensureLoggedIn, (req, res) => {

    const usernameToSearch = req.params.username
    const userId = req.session.userId
    let followerCount = 0
    let followingCount = 0
    const sqlSearchUser = `
        SELECT * FROM users
        WHERE username = $1;
    `

    db.query(sqlSearchUser, [ usernameToSearch ], (err, resultSearchUser) => {

        if (err) {
            console.log(err);
        }

        const userFollower = resultSearchUser.rows[0].followers
        const searchUser = resultSearchUser.rows[0]
        
        const sqlSearchUserPosts = `
            SELECT * FROM posts
            WHERE user_id = $1
            AND type = 'post';
        `
        db.query(sqlSearchUserPosts, [ searchUser.id ], (err, resultSearchUserPosts) => {

            if (err) {
                console.log(err);
            }

            const searchUserPosts = resultSearchUserPosts.rows

            const sqlSessionUser = `
                SELECT * FROM users
                WHERE id = $1;
            `

            db.query(sqlSessionUser, [ userId ], (err, resultSessionUser) => {

                if (err) {
                    console.log(err);
                }

                const sessionUser = resultSessionUser.rows[0]
                console.log(sessionUser);
                console.log(userFollower);

                if (!userFollower || !userFollower.includes(sessionUser.id)) {

                    res.render('user/show_user_search', { user: searchUser, followerCount: followerCount, followingCount: followingCount, posts: searchUserPosts, userId: userId, sessionUser: sessionUser, buttonText: 'follow'})

                } else {

                    res.render('user/show_user_search', { user: searchUser, followerCount: followerCount, followingCount: followingCount, posts: searchUserPosts, userId: userId, sessionUser: sessionUser, buttonText: 'unfollow'})

                }

            })

        })

    })

})

router.put('/users/:username', ensureLoggedIn, (req, res) => {

    const userId = req.session.userId
    const userToFollow = req.params.username
    const sqlFindUserToFollow = `
        SELECT * FROM users
        WHERE username = $1;
    `
    db.query(sqlFindUserToFollow, [ userToFollow ], (err, resultUserToFollow) => {

        if(err) {
            console.log(err);
        }
    
        const userFollowers = resultUserToFollow.rows[0].followers
        const userIdToFollow = resultUserToFollow.rows[0].id

        const sqlFindSessionUser = `
            SELECT * FROM users
            WHERE id = $1;
        `
        db.query(sqlFindSessionUser, [ userId ], (err, resultSessionUser) => {

            if (err) {
                console.log(err);
            }

            const sessionUser = resultSessionUser.rows[0]
            const sessionUserFollowing = sessionUser.following

            if (!userFollowers || !userFollowers.includes(userId)) {

                const sqlUpdateFollower = `
                    UPDATE users
                    SET followers = array_append(followers, $1)
                    WHERE id = $2;
                `
                db.query(sqlUpdateFollower, [ userId, userIdToFollow ], (err, resultUpdateFollower) => {
    
                    if (err) {
                        console.log(err);
                        return
                    }
    
                    console.log(`user ${userId} added as follower`);
    
                    const sqlUpdateFollowing = `
                        UPDATE users
                        SET following = array_append
                        (following, $1)
                        WHERE id = $2;
                    `
                    db.query(sqlUpdateFollowing, [ userIdToFollow, userId ], (err, resultUpdateFollowing) => {

                        if (err) {
                            console.log(err);
                        }

                        console.log(`user ${userId} followed ${userIdToFollow}`);

                        res.redirect(`/users/${userToFollow}`)

                    })
                })
    
            } else {
    
                const sqlRemoveFollower = `
                    UPDATE users
                    SET followers = array_remove(followers, $1)
                    WHERE id = $2;
                `

                db.query(sqlRemoveFollower, [ userId, userIdToFollow ], (err, resultUnfollow) => {
    
                    if(err) {
                        console.log(err);
                    }
    
                    console.log(`user ${userId} unfollowed ${userIdToFollow}`);

                    const sqlUnfollow = `
                        UPDATE users
                        SET following = array_remove
                        (following, $1)
                        WHERE id = $2;
                    `
                    db.query(sqlUnfollow, [ userIdToFollow, userId ], (err, resultUnfollow) => {

                        if (err) {
                            console.log(err);
                        }

                        console.log(`user ${userId} unfollowed user ${userIdToFollow}`);

                        res.redirect(`/users/${userToFollow}`)

                    })
    
                })

            }
            
        })

    })

})

module.exports = router