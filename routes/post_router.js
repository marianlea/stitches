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

        const post = result.rows[0]

        res.render('post/show', { post: post, userId: userId })
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