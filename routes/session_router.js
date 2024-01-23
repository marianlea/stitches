const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcrypt')

router.get('/login', (req, res) => {

    let prompt = ''
    res.render('login', { prompt: prompt })

})

router.post('/login', (req, res) => {

    let prompt = ''
    const username = req.body.username
    

    const sql = `
        SELECT * FROM users
        WHERE username = $1;
    `
    
    db.query(sql, [username], (err, result) => {

        if(err) {
            console.log(err);
            return
        }

        console.log(username);
        if (result.rowCount === 0) {
            prompt = 'user not found'
            res.render('login', { prompt: prompt })
            return
        }

        const plaintextPass = req.body.password
        const hashedPass = result.rows[0].password_digest

        bcrypt.compare(plaintextPass, hashedPass, (err, isCorrect) => {

            if (err) {
                console.log(err);
                return
            }

            if (!isCorrect) {
                prompt = 'password does not match'
                res.render('login', { prompt: prompt })
                return
            }

            console.log('redirect to profile page');
            req.session.userId = result.rows[0].id
            res.redirect(`/${username}`) 

        })

    })

})

router.get('/:username', (req, res) => {

    const username = req.params.username
    const sql = `
        SELECT * from users
        WHERE username = $1;
    `

    db.query(sql, [username], (err, result)=> {

        if (err) {
            console.log(err);
        }

        const user = result.rows[0]
        if (!user.followers === null) {
            user.followers = 0
        }

        if (!user.following === null) {
            user.following = 0
        }
        res.render('user/user', { user: user, userFollowers: user.followers, userFollowing: user.following} )

    })

})

module.exports = router