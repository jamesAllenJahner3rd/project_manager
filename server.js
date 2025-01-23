const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const indexRoutes = require('./routes/indexRoutes');
const profileRoutes = require('./routes/profileRoutes');
const loginRoutes = require('./routes/loginRoutes');
const postRoutes = require('./routes/postRoutes');
const projectRoutes = require('./routes/projectRoutes');

dotenv.config({ path: './config/.env' });

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
mongoose.connect(process.env.DB_STRING)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use('/public', express.static('public'));

// View engine
app.set('view engine', 'ejs');

// Routes
app.use('/', indexRoutes);
app.use('/profile', profileRoutes);
app.use('/login', loginRoutes);
app.use(methodOverride("_method"));
app.use("/post", postRoutes)

// Sessions
app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
  )
  
// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.listen(process.env.PORT||8000, ()=>{
    console.log('Server is running, you better catch it!')
});