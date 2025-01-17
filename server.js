const express = require('express');
const app = express();

const methodOverride = require("method-override");

//const connectDB = require('/config/database');
const indexRoutes = require('./routes/indexRoutes');
const profileRoutes = require('./routes/profileRoutes');
const loginRoutes = require('./routes/loginRoutes');
const postRoutes = require("./routes/postRoutes");
require('dotenv').config({path: './config/.env'});



app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', indexRoutes);
app.use('/profile', profileRoutes);
app.use('/login', loginRoutes);
app.use(methodOverride("_method"));
app.use("/post", postRoutes)


app.listen(process.env.PORT||8000, ()=>{
    console.log('Server is running, you better catch it!')
});
