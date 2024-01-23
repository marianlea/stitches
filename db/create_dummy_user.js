require('dotenv').config()

const bcrypt = require('bcrypt')
const db = require('./index.js')

let username = 'testing'
let email = 'lea@hello.com'
let plaintextPass = 'cookie123'
const saltRound = 10

bcrypt.genSalt(saltRound, (err, salt) => {

    if(err) {
        console.log(err);
    }

    bcrypt.hash(plaintextPass, salt, (err, hashedPass) => {

        if(err) {
            console.log(err);
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

        })

    })

})