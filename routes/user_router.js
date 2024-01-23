const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcrypt')

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

module.exports = router