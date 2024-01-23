const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcrypt')

router.get('/user/new', (req, res) => {

    let prompt = ''
    res.render('user/new_user', { prompt: prompt})

})

router.post('/signup', (req, res) => {

    let prompt = ''
    const username = req.body.username
    const email = req.body.email
    const plaintextPass = req.body.password
    
    const sql = `
        SELECT * FROM users
        WHERE username = $1 OR email = $2;
    `

    db.query(sql, [username, email], (err, result) => {

        if (err) {
            console.log(err);
        }
        
        if (result.rowCount > 0) {

            prompt = 'username or email is already taken'
            res.render('user/new_user', { prompt: prompt })

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
                        (username, email, password_digest)
                        VALUES
                        ('${username}', '${email}', '${hashedPass}');
                    `
            
                    db.query(sql, (err, result) => {
            
                        if(err) {
                            console.log(err);
                        } else {
                            console.log('user created');
                        }
                        
                        res.redirect('/')

                    })
            
                })
            
            })

        }

    })
})

module.exports = router