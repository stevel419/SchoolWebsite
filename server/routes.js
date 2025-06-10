require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { Teacher, Student, Grade, Attendance, Comment } = require('./schemas.js');
const authenticateJWT = require('./middleware/authMiddleware.js');

router.post('/create-user', async (req, res) => {
    try {
        const { firstName, lastName, subject, username, password, isAdmin } = req.body;

        const existingTeacher = await Teacher.findOne({ username });
        if (existingTeacher) {
            return res.status(400).json({ 
                error: "Username already exists" 
            });
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const teacher = new Teacher({
            firstName,
            lastName,
            subject,
            username,
            password: hashedPassword,
            isAdmin: isAdmin || false
        });

        const savedTeacher = await teacher.save();
        if (savedTeacher) {
            res.status(200).json({ message: "User created successfully" });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to create user" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const teacher = await Teacher.findOne({ username });

        if (!teacher) {
            return res.status(400).json({ error: "Invalid username" });
        }
        const pwValid = await bcrypt.compare(password, teacher.password);
        if (!pwValid) {
            return res.status(400).json({ error: "Invalid password" });
        }

        const token = jwt.sign({
            isAdmin: teacher.isAdmin,
            teacherId: teacher._id
        }, process.env.JWT_SECRET, {expiresIn: '2h'});

        res.status(200).json({ success: true, token, expiresIn: 7200 });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to login" });
    }
});

module.exports = router;