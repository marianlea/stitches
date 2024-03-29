const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcrypt')
const ensureLoggedIn = require('../middlewares/ensure_logged_in')

router.get('/login', (req, res) => {

    let sessionPrompt = ''
    res.render('login', { sessionPrompt: sessionPrompt })

})

router.post('/login', (req, res) => {

    let sessionPrompt = ''
    const username = req.body.username    

    const sql = `
        SELECT * FROM users
        WHERE username = $1;
    `
    
    db.query(sql, [ username ], (err, result) => {

        if(err) {
            console.log(err);
            return
        }

        if (result.rowCount === 0) {
            sessionPrompt = 'user not found'
            res.render('login', { sessionPrompt: sessionPrompt })
            return
        }

        const plaintextPass = req
        .body.password
        const hashedPass = result.rows[0].password_digest

        bcrypt.compare(plaintextPass, hashedPass, (err, isCorrect) => {

            if (err) {
                console.log(err);
                return
            }

            if (!isCorrect) {
                sessionPrompt = 'password does not match'
                res.render('login', { sessionPrompt: sessionPrompt })
                return
            }

            req.session.userId = result.rows[0].id
            res.redirect('/') 

        })

    })

})

router.get('/:username', ensureLoggedIn, (req, res) => {

    const userId = req.session.userId
    const username = req.params.username

    let followerCount = 0
    let followingCount = 0
    const sql = `
        SELECT * from users
        WHERE id = $1;
    `

    db.query(sql, [ userId ] , (err, result)=> {

        const user = result.rows[0]
        const followers = result.rows[0].followers
        if (followers && followers.length){
            followerCount = followers.length
        }
        const following = result.rows[0].following
        if (following && following.length){
            followingCount = following.length
        }
        const sqlPosts = `
            SELECT * FROM posts
            WHERE user_id = $1
            AND type = 'post'
            ORDER BY id DESC;
        `

        db.query(sqlPosts, [ userId ], (err, resultPosts) => {

            if (err) {

                console.log(err);
                
            }

            const posts = resultPosts.rows
            
            res.render('user/user', { user: user, followerCount: followerCount, followingCount: followingCount, posts: posts, userId: userId })

        })

    })

})

router.get('/:username/edit', ensureLoggedIn, (req, res) => {

    const username = req.params.username

    const sql = `
        SELECT * FROM users
        WHERE username = $1;
    `

    db.query(sql, [username], (err, result) => {

        if (err) {
            console.log(err);
        }

        const user = result.rows[0]

        res.render('user/user_edit', { user: user })

    })

})

router.put('/:username', ensureLoggedIn, (req, res) => {

    const username = req.params.username
    const profilePicUrl = req.body.profile_pic_url
    const description = req.body.description

    const sql = `
        UPDATE users
        SET
            profile_pic_url = $1,
            description = $2
        WHERE
            username = $3;
    `

    db.query(sql, [profilePicUrl, description, username], (err, result) => {

        if (err) {
            console.log(err);
        }

        res.redirect(`/${username}`)

    })
})

router.delete('/logout', ensureLoggedIn, (req, res) => {

    req.session.userId = null
    res.redirect('/')
    
})


module.exports = router