require('dotenv').config()

const express = require('express')
const app = express()
const expressLayout = require('express-ejs-layouts')
const port = 8080
const db = require('./db')
const bcrypt = require('bcrypt')
const session = require('express-session')
const pageRoute = require('./routes/page_router')
const userRoute = require('./routes/user_router')
const sessionRoute = require('./routes/session_router')

app.set('view engine', 'ejs')

app.use(expressLayout)
app.use(express.urlencoded({ extended: true }))
app.use(session ({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))


app.use(pageRoute)
app.use(userRoute)
app.use(sessionRoute)


app.listen(port, () => {
    console.log(`server listening on port ${port}`);
})