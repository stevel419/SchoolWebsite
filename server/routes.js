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
            return res.status(400).json({ error: "Username not found" });
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

router.get('/get-students', authenticateJWT, async (req, res) => {
    try {
        const isAdmin = req.user.isAdmin;
        const teacherId = req.user.teacherId;

        let students;

        if (isAdmin) {
            students = await Student.find();
        } 
        
        else {
            const teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({ error: "Teacher not found" });
            }
            const subject = teacher.subject;

            students = await Student.find({
                subjects: { $in: [subject] }
            });
        }

        const fullStudents = await Promise.all(
            students.map(async (student) => {
                const filters = { student: student._id };
                if (!isAdmin) filters.teacher = teacherId;

                const [grades, attendance, comments] = await Promise.all([
                    Grade.find(filters),
                    Attendance.find(filters),
                    Comment.find(filters)
                ]);

                return {
                    ...student.toObject(),
                    grades,
                    attendance,
                    comments
                };
            })
        );

        res.status(200).json(fullStudents);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch students" });
    }
});

router.get('/search-students', authenticateJWT, async (req, res) => {
    try {
        const isAdmin = req.user.isAdmin;
        const teacherId = req.user.teacherId;
        const searchTerm = req.query.name?.trim();

        if (!searchTerm) {
            return res.status(400).json({ error: "Missing search term" });
        }

        // Case-insensitive regex search on first or last name, and first and last name
        let nameFilter;
        const nameParts = searchTerm.split(' ').filter(Boolean);
        if (nameParts.length === 1) {
            const part = nameParts[0];
            nameFilter = {
                $or: [
                    { firstName: { $regex: part, $options: 'i' } },
                    { lastName: { $regex: part, $options: 'i' } }
                ]
            };
        } else if (nameParts.length >= 2) {
            const first = nameParts[0];
            const last = nameParts.slice(1).join(' ');
            nameFilter = {
                $or: [
                    { 
                        $and: [
                            { firstName: { $regex: first, $options: 'i' } },
                            { lastName: { $regex: last, $options: 'i' } }
                        ]
                    },
                    { 
                        $and: [
                            { firstName: { $regex: last, $options: 'i' } },
                            { lastName: { $regex: first, $options: 'i' } }
                        ]
                    }
                ]
            };
        }

        if (isAdmin) {
            const students = await Student.find(nameFilter);

            if (students.length === 0) {
                return res.status(400).json({ error: "No matching students found" });
            }

            const enriched = await Promise.all(students.map(async (student) => {
                const [grades, attendance, comments] = await Promise.all([
                    Grade.find({ student: student._id }),
                    Attendance.find({ student: student._id }),
                    Comment.find({ student: student._id })
                ]);

                return { ...student.toObject(), grades, attendance, comments };
            }));

            return res.status(200).json(enriched);
        } else {
            const teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(400).json({ error: "Teacher not found" });
            }

            const subject = teacher.subject;

            const students = await Student.find({
                ...nameFilter,
                subjects: { $in: [subject] }
            });

            if (students.length === 0) {
                return res.status(400).json({ error: "No matching students found" });
            }

            const enriched = await Promise.all(students.map(async (student) => {
                const [grades, attendance, comments] = await Promise.all([
                    Grade.find({ student: student._id, teacher: teacherId }),
                    Attendance.find({ student: student._id, teacher: teacherId }),
                    Comment.find({ student: student._id, teacher: teacherId })
                ]);

                return { ...student.toObject(), grades, attendance, comments };
            }));

            return res.status(200).json(enriched);
        }

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to search students" });
    }
});

// Utility to initialize grades, comments, attendance
async function initializeAcademicRecords(studentId, subjects, session) {
    const allGrades = [];
    const allAttendance = [];
    const allComments = [];

    for (const subject of subjects) {
        const teacher = await Teacher.findOne({ subject }).session(session);
        if (!teacher) throw new Error(`No teacher found for subject: ${subject}`);

        allGrades.push({
            student: studentId,
            teacher: teacher._id,
            assessments: [
                { name: "Midterm 1", score: null },
                { name: "Endterm", score: null },
                { name: "Midterm 2", score: null },
                { name: "Final", score: null }
            ],
            subject
        });
        allAttendance.push({ student: studentId, teacher: teacher._id, subject });
        allComments.push({ student: studentId, teacher: teacher._id, subject, comment: "" });
    }

    await Grade.insertMany(allGrades, { session });
    await Attendance.insertMany(allAttendance, { session });
    await Comment.insertMany(allComments, { session });
}

router.post('/save-student', authenticateJWT, async (req, res) => {
    const session = await Student.startSession();
    session.startTransaction();

    try {
        const isAdmin = req.user.isAdmin;
        if (!isAdmin) {
            return res.status(403).json({ error: "Only admin can save or update student" });
        }

        const { admissionNum, firstName, lastName, dateOfBirth, gender, religion, guardian, address, form, subjects, isActive } = req.body;

        const student = await Student.findOne({ admissionNum }).session(session);
        const studentExists = !!student;

        // Create new student if they don't exist
        if (!studentExists) {
            const newStudent = new Student({
                admissionNum: admissionNum.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                dateOfBirth,
                gender,
                religion,
                guardian,
                address,
                form,
                subjects,
                isActive
            });
            const savedStudent = await newStudent.save({ session });

            // Initialize grades/comments/attendance for new student
            await initializeAcademicRecords(savedStudent._id, subjects, session);

            await session.commitTransaction();
            return res.status(200).json({ message: "Student added successfully!" });
        }

        // Update existing student (preserve admissionNum)
        const studentId = student._id;
        const oldSubjects = student.subjects || [];
        const formChanged = student.form !== form;
        const subjectsChanged = JSON.stringify([...oldSubjects].sort()) !== JSON.stringify([...subjects].sort());

        student.firstName = firstName.trim();
        student.lastName = lastName.trim();
        student.dateOfBirth = dateOfBirth;
        student.gender = gender;
        student.religion = religion;
        student.guardian = guardian;
        student.address = address;
        student.form = form;
        student.subjects = subjects;
        student.isActive = isActive;

        // Reset all academic records if form changed
        if (formChanged) {
            await Promise.all([
                Grade.deleteMany({ student: studentId }).session(session),
                Attendance.deleteMany({ student: studentId }).session(session),
                Comment.deleteMany({ student: studentId }).session(session),
            ]);
            await initializeAcademicRecords(studentId, subjects, session);
        }

        // Remove + add changed subjects (if form is same)
        if (subjectsChanged && !formChanged) {
            const removedSubjects = oldSubjects.filter(sub => !subjects.includes(sub));
            const addedSubjects = subjects.filter(sub => !oldSubjects.includes(sub));

            if (removedSubjects.length > 0) {
                await Promise.all([
                    Grade.deleteMany({ student: studentId, subject: { $in: removedSubjects } }).session(session),
                    Attendance.deleteMany({ student: studentId, subject: { $in: removedSubjects } }).session(session),
                    Comment.deleteMany({ student: studentId, subject: { $in: removedSubjects } }).session(session),
                ]);
            }

            if (addedSubjects.length > 0) {
                await initializeAcademicRecords(studentId, addedSubjects, session);
            }
        }

        await student.save({ session });
        await session.commitTransaction();

        return res.status(200).json({ message: "Student updated successfully!" });
    } catch (e) {
        await session.abortTransaction();
        console.error(e);
        return res.status(500).json({ error: e.message || "Failed to save or update student" });
    } finally {
        session.endSession();
    }
});

router.post('/update-grade', authenticateJWT, async (req, res) => {
    try {
        const isAdmin = req.user.isAdmin;
        const teacherId = req.user.teacherId;
        const { admissionNum, name, score, subject } = req.body;

        const student = await Student.findOne({ admissionNum: admissionNum });
        if (!student) {
            return res.status(400).json({ error: "Student is not in database" });
        }

        let grade;
        if (isAdmin) {
            grade = await Grade.findOne({ student: student._id, subject: subject });
        } else {
            grade = await Grade.findOne({ student: student._id, teacher: teacherId });
        }

        if (!grade) {
            return res.status(400).json({ error: "Grade not found for this student and teacher" });
        }

        const assessmentToUpdate = grade.assessments.find(a => a.name === name);
        if (!assessmentToUpdate) {
            return res.status(400).json({ error: name + " not found" });
        }

        assessmentToUpdate.score = score;

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
        const { admissionNum, attended, subject } = req.body;

        const student = await Student.findOne({ admissionNum });
        if (!student) {
            return res.status(400).json({ error: "Student is not in database" });
        }

        let attendance;
        if (isAdmin) {
            attendance = await Attendance.findOne({ student: student._id, subject });
        } else {
            attendance = await Attendance.findOne({ student: student._id, teacher: teacherId });
        }

        // 🔴 Fix: If no attendance record, create it
        if (!attendance) {
            const teacher = isAdmin
            ? await Teacher.findOne({ subject }) // for admin, find by subject
            : await Teacher.findById(teacherId); // for teacher, use their ID

            if (!teacher) return res.status(400).json({ error: "Teacher not found" });

            attendance = new Attendance({
                student: student._id,
                teacher: teacher._id,
                subject,
                attended
            });

            await attendance.save();
            return res.status(200).json({ message: "Attendance created successfully", attendance });
        }

        // Update if it already exists
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
        const { admissionNum, newComment, subject } = req.body;
        const student = await Student.findOne({ admissionNum: admissionNum });
        if (!student) {
            return res.status(400).json({ error: "Student is not in database" });
        }
        
        let comment;
        if (isAdmin) {
            comment = await Comment.findOne({ student: student._id, subject: subject });
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