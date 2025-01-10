const express = require('express')
const app = express()
//const connectDB = require('/config/database')
const indexRoutes = require('./routes/indexRoutes')


require('dotenv').config({path: './config/.env'})

//connectDB()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/', indexRoutes)

 
app.listen(process.env.PORT||8000, ()=>{
    console.log('Server is running, you better catch it!')
})
