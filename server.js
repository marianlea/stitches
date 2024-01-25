require('dotenv').config()

const express = require('express')
const app = express()
const expressLayout = require('express-ejs-layouts')
const port = process.env.PORT || 8080
const db = require('./db')
const bcrypt = require('bcrypt')
const session = require('express-session')
const methodOverride = require('method-override')
const requestLogger = require('./middlewares/request_logger.js')
const setCurrentUser = require('./middlewares/set_curret_user.js')
const ensureLoggedIn = require('./middlewares/ensure_logged_in.js')
const pageRoute = require('./routes/page_router')
const userRoute = require('./routes/user_router')
const sessionRoute = require('./routes/session_router')
const postRouter = require('./routes/post_router.js')

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(expressLayout)
app.use(methodOverride('_method'))
app.use(requestLogger)
app.use(session ({
    secret: process.env.SESSION_SECRET || 'cookies',
    resave: false,
    saveUninitialized: true
}))
app.use(setCurrentUser)
app.use(express.urlencoded({ extended: true }))



app.use(pageRoute)
app.use(userRoute)
app.use(sessionRoute)
app.use(postRouter)


app.listen(port, () => {
    console.log(`server listening on port ${port}`);
})