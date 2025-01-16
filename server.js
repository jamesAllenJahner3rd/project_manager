const express = require('express')
const app = express()
//const connectDB = require('/config/database')
const indexRoutes = require('./routes/indexRoutes')
const profileRoutes = require('./routes/profileRoutes')
const loginRoutes = require('./routes/loginRoutes')

require('dotenv').config({path: './config/.env'})

//connectDB()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/', indexRoutes)
app.use('/profile', profileRoutes)
app.use('/login', loginRoutes)

 
app.listen(process.env.PORT||8000, ()=>{
    console.log('Server is running, you better catch it!')
})
