const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const Student = require('../models/student');

router.get('/register', (req, res) => {
    if (req.user && req.user.username !== "admin") {
        res.redirect('/');
    }
    res.render('auth/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { username, email, ime, prezime, dob, status, password } = req.body;
        const student = new Student({ username, email, ime, prezime, dob, status });
        const noviStudent = await Student.register(student, password);
        req.login(noviStudent, err => {
            if (err) return next(err);
            req.flash('success', 'Dobrodošli u eStudent!');
            res.redirect(`/student`);
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/auth/register');
    }
}));

router.get('/login', (req, res) => {
    if (req.user) {
        res.redirect('/');
    }
    res.render('auth/login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/auth/login' }), (req, res) => {
    req.flash('success', 'Dobrodošli!');
    if (req.user.username !== "admin") {
        res.redirect('/student');
    } else {
        res.redirect('/admin')
    }
    /* const redirectUrl = req.session.returnTo || '/student';
    delete req.session.returnTo;
    res.redirect(redirectUrl); */
})

router.get('/logout', (req, res) => {
    req.logout((e) => 'callback');
    req.flash('success', "Doviđenja!");
    res.redirect('/auth/login');
})

module.exports = router;