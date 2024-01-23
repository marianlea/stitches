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

module.exports = router
