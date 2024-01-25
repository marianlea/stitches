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
            AND type = 'post'
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
                const userPicUrl = resultUser.rows[0].profile_pic_url
                const posts = result.rows
                const followingIds = resultUser.rows[0].following
                let sqlGetPostsOfFollowing = ''
                let postsArray = []

                if (followingIds){
                    for (let followingId of followingIds) {

                        sqlGetPostsOfFollowing += `SELECT * FROM posts WHERE user_id = ${followingId} AND
                        type = 'post';`

                    }
                }

                sqlGetPostsOfFollowing += `SELECT * FROM posts WHERE user_id = '${userId}' AND type = 'post';`

                db.query(sqlGetPostsOfFollowing, (err, resultAllPosts) => {
                    let allUsersArray = [];
                    let allUsersArrayObjs = [];

                    if (err) {
                        console.log(err);
                    }
                    
                    if (resultAllPosts && typeof resultAllPosts === 'object') {

                        if (resultAllPosts.rows && resultAllPosts.rows.length) {
                            
                            for(let item of resultAllPosts.rows) {

                                const sqlGetPostUser = `SELECT * FROM users WHERE id = '${item.user_id}';`

                                db.query(sqlGetPostUser, (err, resultPostUser) => {

                                    if (err) {
                                        console.log(err);
                                    }
                                    const userObj = resultPostUser.rows[0]
                                    item.username = userObj.username
                                    item.userPic = userObj.profile_pic_url
                                })
                                postsArray.push(item);
                            }
                        }
                    }


                    if (resultAllPosts && resultAllPosts.length){
                        for (let post of resultAllPosts) {
                            if (post.rows && post.rows.length){
                                for (let item of post.rows){
                                postsArray.push(item);
                                    allUsersArray.push(item.user_id);
                                }
                            }
                        }
                    }

                    
                    let sqlGetUsersOfPosts = ''
                    if (allUsersArray.length){
                        for (let userId of allUsersArray) {
                            sqlGetUsersOfPosts += `SELECT * FROM users WHERE id = ${userId};`
    
                        }
                    }
                    db.query(sqlGetUsersOfPosts, (err, resultAllPostsUsers) => {

                        if (err) {
                            console.log(err);
                        }

                        if (resultAllPostsUsers && resultAllPostsUsers.length){
                            for (let resultPostUser of resultAllPostsUsers){
                                allUsersArrayObjs.push(resultPostUser.rows[0])
                            }
                        }

                        if (postsArray.length && allUsersArrayObjs.length){
                            for (let postItem of postsArray){
                                for (let userItem of allUsersArrayObjs){
                                    if (postItem.user_id === userItem.id){
                                        postItem.userPic = userItem.profile_pic_url;
                                        postItem.username = userItem.username;
                                    }
                                }
                            }
                        }

                        res.render('home', { posts: posts, userId: userId, postsArray: postsArray,username: username})

                    })
                })

            })


        })
    }

})


router.get('/search', ensureLoggedIn, (req, res) => {

    let keywords = req.query.keywords

    if (!keywords) {
        
        res.render('search', { keywords : keywords })

    } else {

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


module.exports = router
