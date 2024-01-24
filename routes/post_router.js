require('dotenv').config()

const express = require('express')
const router = express.Router()
const db = require('../db')
const ensureLoggedIn = require('../middlewares/ensure_logged_in')



router.get('/posts/new', ensureLoggedIn, (req, res) => {

    res.render('post/new')

})

router.post('/posts', ensureLoggedIn, (req, res) => {

    const post = req.body.post
    const type = 'post'
    const userId = req.session.userId

    console.log(post);

    const sql = `
        INSERT INTO posts
        (post, type, user_id)
        VALUES
        ($1, $2, $3);
    `

    db.query(sql, [post, type, userId], (err, result) => {

        if (err) {
            console.log(err);
        }

        const sqlUser = `
            SELECT * FROM users
            WHERE id = $1;
        `

        db.query(sqlUser, [userId], (err, resultUser) => {

            if (err) {

                console.log(err);
            }

            const username = resultUser.rows[0].username

            res.redirect(`/${username}`)

        })


    })

})

router.post('/posts/:id', ensureLoggedIn, (req, res) => {

    const userId = req.session.userId
    const postId = req.params.id
    const reply = req.body.reply
    const type = 'reply'

    const sqlInsertReply = `
        INSERT INTO posts
        (post, type, user_id)
        VALUES 
        ( $1, $2, $3)
        RETURNING id;
    `
    db.query(sqlInsertReply, [ reply, type, userId ], (err, resultAddReply) => {

        if (err) {
            console.log(err);
        }

        const addedReplyId = resultAddReply.rows[0].id
        const sqlUpdateReplyId = `
            UPDATE posts
            SET reply_ids = array_append
            (reply_ids, $1)
            WHERE id = $2;
        `

        db.query(sqlUpdateReplyId, [ addedReplyId, postId], (err, resultUpdateReplyId) => {

            if (err) {
                console.log(err);
            }

            console.log('reply id added');
            res.redirect(`/posts/${postId}`)

        })

    })

})

router.get('/posts/:id', ensureLoggedIn, (req, res) => {

    const userId = req.session.userId
    const postId = req.params.id

    const sql = `
        SELECT * FROM posts
        WHERE id = $1;
    `

    db.query(sql, [ postId ], (err, result)=> {

        if (err) {
            console.log(err);
        }

        const sqlFindUser = `
            SELECT * FROM users
            WHERE id = $1;
        `
        db.query(sqlFindUser, [ userId ], (err, resultUser) => {

            if (err) {
                console.log(err);
            }

            const user = resultUser.rows[0]
            const post = result.rows[0]
            const sqlFindPostAuthor = `
                SELECT * FROM users
                WHERE id = $1;
            `

            db.query(sqlFindPostAuthor, [ post.user_id ], (err, resultPostAuthor) => {

                if (err) {
                    console.log(err);
                }

                const postAuthor = resultPostAuthor.rows[0]
                const replyIds = post.reply_ids
                let  sqlGetReplyIds = ''
                let repliesArray = null


                if (!replyIds) {

                    res.render('post/show', { post: post, userId: userId, user: user, postAuthor: postAuthor, repliesArray: repliesArray })

                } else {
   
                    for (let replyId of replyIds) {
                        sqlGetReplyIds += `SELECT * FROM posts WHERE id = ${replyId};`
                    }

                    db.query(sqlGetReplyIds, (err, resultReplies) => {

                        repliesArray = []

                        if (err) {
                            console.log(err);
                        }


                        console.log('hoy',{resultReplies});

                        if (resultReplies && typeof resultReplies === 'object'){
                            resultReplies.rows
                            if( resultReplies.rows && resultReplies.rows.length){
                                for (let item of resultReplies.rows){
                                    repliesArray.push(item)
                                }
                            }
                        }

                        if (resultReplies && resultReplies.length){
                            for (let resultReply of resultReplies) {
                                
                                if (resultReply.rows && resultReply.rows.length){
                                    for (let item of resultReply.rows){
                                        repliesArray.push(item)

                                    }
                                }

                            }
                        }

                        console.log({repliesArray});


                        res.render('post/show', { post: post, userId: userId, user: user, postAuthor: postAuthor, repliesArray: repliesArray })

                    })

                }

            })

        })

    })

})

router.get('/posts/:id/edit', ensureLoggedIn, (req, res) => {

    const postId = req.params.id

    const sql = `
        SELECT * FROM posts
        WHERE id = $1;
    `

    db.query(sql, [ postId ], (err, result) => {

        if (err) {
            console.log(err);
        }

        const post = result.rows[0]
        console.log(post);
        
        res.render('post/post_edit', { post: post } )
    })

})

router.put('/posts/:id', ensureLoggedIn, (req, res) => {

    const postId = req.params.id
    const post = req.body.post
    const sql = `
        UPDATE posts
        SET
            post = $1
        WHERE
            id = $2;
    `

    db.query(sql, [ post, postId ], (err, result) => {

        if (err) {
            console.log(err);
        }

        res.redirect(`/posts/${postId}`)

    })

})

module.exports = router