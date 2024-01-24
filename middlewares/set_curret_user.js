require('dotenv').config()
const db = require('../db')

const setCurrentUSer = (req, res, next) => {

    res.locals.currentUser = {}
    res.locals.isLoggedIn = false

    const userId = req.session.userId

    if (!req.session.userId) {
        return next()
    }

    const sql = `
        SELECT * FROM users
        WHERE id = $1;
    `
    db.query(sql, [ userId ], (err, result) => {

        if (err) {

            console.log(err);

        }

        let user = result.rows[0]

        res.locals.currentUser= user
        res.locals.isLoggedIn = true
        next()

    })

}

module.exports = setCurrentUSer