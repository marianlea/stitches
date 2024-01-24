const express = require('express')
const router = express.Router()
const db = require('../db')
const ensureLoggedIn = require('../middlewares/ensure_logged_in')

router.get('/', (req, res) => {

    let userId = req.session.userId

    if (!userId) {

        res.render('home', { userId : userId })
        return
    
    } else {
        
        const sql = `
            SELECT * FROM posts
            WHERE user_id = $1
            ORDER BY id DESC;
        `
        db.query(sql, [ userId ], (err, result) => {

            if (err) {
                console.log(err);
            }

            const sqlUser = `
                SELECT * FROM users
                WHERE id = $1;
            `
            db.query(sqlUser, [ userId ], (err, resultUser) => {

                if (err) {
                    console.log(err);
                }

                const username = resultUser.rows[0].username
                const posts = result.rows
    
                res.render('home', { posts : posts, userId : userId, username : username })

            })


        })
    }

})


router.get('/search', ensureLoggedIn, (req, res) => {

    let keywords = req.query.keywords

    console.log(keywords);
    if (!keywords) {
        
        console.log('no keywords');
        res.render('search', { keywords : keywords })

    } else {

        console.log('keywords exist');
        let searchKeywords = `%${keywords}%`
        const sql = `
            SELECT * FROM users
            WHERE username LIKE
            $1;
        `
        db.query(sql, [ searchKeywords ], (err, result) => {

            if (err) {
                console.log(err);
            }

            let users = result.rows

            res.render('search', { users : users, keywords : keywords })

        })
    
    }

})


router.get('/users/:username', (req, res) => {

    const usernameSearchUser = req.params.username
    let followerCount = 0
    let followingCount = 0
    const sqlSearchUser = `
        SELECT * FROM users
        WHERE username = $1;
    `

    db.query(sqlSearchUser, [ usernameSearchUser ], (err, resultSearchUser) => {

        if (err) {
            console.log(err);
        }

        const searchUser = resultSearchUser.rows[0]
        
        const sqlSearchUserPosts = `
            SELECT * FROM posts
            WHERE user_id = $1;
        `
        db.query(sqlSearchUserPosts, [ searchUser.id ], (err, resultSearchUserPosts) => {

            if (err) {
                console.log(err);
            }

            const searchUserPosts = resultSearchUserPosts.rows

            res.render('user/user', { user: searchUser, followerCount: followerCount, followingCount: followingCount, posts: searchUserPosts } )

        })

    })

})

module.exports = router