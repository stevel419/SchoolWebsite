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

        const existingTeacher = await Teacher.findOne({ username: username });
        if (existingTeacher) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
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

        const teacher = await Teacher.findOne({ username: username });

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

router.post('/save-student', authenticateJWT, async (req, res) => {
    try {
        const isAdmin = req.user.isAdmin;
        const teacherId = req.user.teacherId;
        if (isAdmin) {
            const { admissionNum, firstName, lastName, dateOfBirth, gender, religion, guardian, address, form, subjects } = req.body;

            const existingStudent = await Student.findOne({ admissionNum: admissionNum });
            if (existingStudent) {
                return res.status(400).json({ error: "Student already exists" });
            }

            const student = new Student({
                admissionNum,
                firstName,
                lastName,
                dateOfBirth,
                gender,
                religion,
                guardian,
                address,
                form,
                subjects
            });

            const savedStudent = await student.save();
            
            const allGrades = [];
            const allAttendance = [];
            const allComments = [];
            for (const subject of subjects) {
                const subjectTeacher = await Teacher.findOne({ subject: subject });
                if (!subjectTeacher) {
                    return res.status(400).json({ error: subject + " does not exist" });
                }
                for (const assessment of ['Midterm', 'Final']) {
                    allGrades.push(new Grade({
                        student: savedStudent._id,
                        teacher: subjectTeacher._id,
                        assessment,
                        score: 0
                    }));
                }

                allAttendance.push(new Attendance({
                    student: savedStudent._id,
                    teacher: subjectTeacher._id
                }));

                allComments.push(new Comment({
                    student: savedStudent._id,
                    teacher: subjectTeacher._id,
                    comment: ""
                }));
            }

            await Grade.insertMany(allGrades);
            await Attendance.insertMany(allAttendance);
            await Comment.insertMany(allComments);

            res.status(200).json({ message: "Student created successfully" });
        } else {
            return res.status(400).json({ error: "Please ask an admin to add student" });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to save student info" });
    }
});

router.post('/update-grade', authenticateJWT, async (req, res) => {
    try {
        const isAdmin = req.user.isAdmin;
        const teacherId = req.user.teacherId;
        const { admissionNum, assessment, score, teacher_id } = req.body;
        const student = await Student.findOne({ admissionNum: admissionNum });
        if (!student) {
            return res.status(400).json({ error: "Student is not in database" });
        }
        
        let grade;
        if (isAdmin) {
            grade = await Grade.findOne({ student: student._id, teacher: teacher_id, assessment: assessment });
        } else {
            grade = await Grade.findOne({ student: student._id, teacher: teacherId, assessment: assessment });
        }

        if (!grade) {
            return res.status(400).json({ error: "Grade not found for this student and teacher" });
        }

        grade.score = score;
        await grade.save();

        res.status(200).json({ message: "Grade updated successfully", grade });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update student grade" });
    }
});

router.post('/update-attendance', authenticateJWT, async (req, res) => {
    try {
        const isAdmin = req.user.isAdmin;
        const teacherId = req.user.teacherId;
        const { admissionNum, attended, teacher_id } = req.body;
        const student = await Student.findOne({ admissionNum: admissionNum });
        if (!student) {
            return res.status(400).json({ error: "Student is not in database" });
        }
        
        let attendance;
        if (isAdmin) {
            attendance = await Attendance.findOne({ student: student._id, teacher: teacher_id });
        } else {
            attendance = await Attendance.findOne({ student: student._id, teacher: teacherId });
        }

        if (!attendance) {
            return res.status(400).json({ error: "Attendance not found for this student and teacher" });
        }

        attendance.attended = attended;
        await attendance.save();

        res.status(200).json({ message: "Attendance updated successfully", attendance });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update student attendance" });
    }
});

router.post('/update-comment', authenticateJWT, async (req, res) => {
    try {
        const isAdmin = req.user.isAdmin;
        const teacherId = req.user.teacherId;
        const { admissionNum, newComment, teacher_id } = req.body;
        const student = await Student.findOne({ admissionNum: admissionNum });
        if (!student) {
            return res.status(400).json({ error: "Student is not in database" });
        }
        
        let comment;
        if (isAdmin) {
            comment = await Comment.findOne({ student: student._id, teacher: teacher_id });
        } else {
            comment = await Comment.findOne({ student: student._id, teacher: teacherId });
        }

        if (!comment) {
            return res.status(400).json({ error: "Comment not found for this student and teacher" });
        }

        comment.comment = newComment;
        await comment.save();

        res.status(200).json({ message: "Comment updated successfully", comment });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update student comment" });
    }
});

module.exports = router;