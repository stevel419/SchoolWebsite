const express = require('express');
const router = express.Router();
const { Teacher, Student, Grade, Attendance, Comment } = require('./schemas.js');

router.get('/test', (req, res) => {
    res.json({ message: 'test, delete!' });
});

module.exports = router;