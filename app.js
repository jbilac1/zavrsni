const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');//da mozemo overridat post metodu sa put metodom unutar edit forme
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');

const flash = require('connect-flash');
const session = require('express-session');

const studentRoutes = require('./routes/student.js');
const adminRoutes = require('./routes/admin.js');
const authRoutes = require('./routes/auth.js');

const passport = require("passport")
const LocalStrategy = require("passport-local")
const Student = require('./models/student.js')

mongoose.connect('mongodb+srv://jbilac:fDQKg55JOf9sEzEQ@cluster0.uwsyqnu.mongodb.net/zavrsni?retryWrites=true&w=majority&appName=Cluster0');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Pogreška u komunikaciji sa serverom"));
db.once("open", () => {
    console.log("Uspješno ste se povezali na bazu podataka");
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');//postavljanje view engine da bude ejs
app.set('views', path.join(__dirname, 'views'))//postavljanje putanje da mozemo renderati file-ove iz /viewsa

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Student.authenticate()));

passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());

app.use((req, res, next)=>{
    if (!['/auth/login', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next(); 
})
app.use('/auth', authRoutes);
app.use('/student', studentRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
    res.render('home');
})




//hvata sve putanje koje nisu deklarirane i vraca prozor sa ispisom pogreske (404)
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//middleware funkcije, pokreću se prilikom javljanja grešaka u radu na aplikaciji te sprječavaju rušenje aplikacije tijekom rada
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})