const express = require("express");
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError.js');
const { studentSchema, kolegijSchema } = require("../schemas.js");
const { isLoggedIn } = require('../middleware');

const Ispit = require('../models/ispit');
const Student = require('../models/student');
const Kolegij = require('../models/kolegij');

//putanje se odnose na profil jednog studenta
//dohvat podataka jednog studenta, po ideji prijavljenog u sustav
router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    if (req.user.username === "admin") {
        res.redirect('/admin');
    } else {
        const id = req.user._id;
        const student = await Student.findById(id).populate('kolegiji');
        res.render('student/index', { student });
    }
}))

//putanja za dohvat podataka o kolegiju određenog studenta
router.get('/:kolegijId/:studentId', isLoggedIn, catchAsync(async (req, res) => {
    if (req.user.username === "admin") {
        res.redirect('/admin');
    } else {
        const { kolegijId, studentId } = req.params;
        const student = await Student.findById(studentId)
        const kolegij = await Kolegij.findById(kolegijId).populate({
            path: 'ispiti',
            populate: {
                path: 'rezultati'
            }
        })
        const ispiti = await Ispit.find({ 'kolegij': kolegij });
        //dohvat svih ispita koje je prijavio studentId
        const prijavljeni = await Ispit.find({ 'rezultati.student': studentId }).populate('kolegij').populate('rezultati');
        const neprijavljeni = [{}]
        let pomocna = false;
        ispiti.forEach(ispit => {
            pomocna = false
            ispit.rezultati.forEach(r => {
                if (r.student.equals(studentId)) {
                    pomocna = true;
                }
            })
            if (!pomocna) neprijavljeni.push(ispit)
        })
        
        res.render('student/showKolegij', { kolegij, student, prijavljeni, neprijavljeni });
    }

}))


//putanja za prijavu ispita
router.post('/ispiti/prijava', isLoggedIn, catchAsync(async (req, res) => {
    if (req.user.username === "admin") {
        res.redirect('/admin');
    } else {
        const { studentId, ispitId, kolegijId } = req.body;
        const ispit = await Ispit.findById(ispitId);
        const student = await Student.findById(studentId);
        ispit.rezultati.push({ student: studentId, ocjena: 5 });
        await ispit.save();
        res.redirect(`/student/${kolegijId}/${studentId}`)
    }

}));


module.exports = router;