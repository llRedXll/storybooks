const path = require('path')
const express = require('express')
//!Change: Mongoose is no longer required
// const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const passport = require('passport')
const session = require('express-session')
//!Change: MongoStore does not requre (session)
const MongoStore = require('connect-mongo')//(session)
const connectDB = require('./config/db')

// Load config
dotenv.config({ path: './config/config.env' })

// Passport config
require('./config/passport')(passport)

// Connect to MongoDB 
connectDB()

const app = express()

// Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Handlebars Helpers
const { formatDate } = require('./helpers/hbs')

// Handlebars
//! Add the word .engine after exphbs so you wont get an error
app.engine('.hbs', exphbs.engine({
  helpers: {
    formatDate,
  }, defaultLayout: 'main', extname: '.hbs'
}))
app.set('view engine', '.hbs')

// Sessions
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  //!Change: MongoStore syntax has changed
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Static folder 
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 3000

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)

//TODO
// Left off on Public Stories - 1:36:54