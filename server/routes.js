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
        const searchTerm = req.query.name;

        if (!searchTerm) {
            return res.status(400).json({ error: "Missing search term" });
        }

        // Case-insensitive regex search on first or last name
        const nameFilter = {
            $or: [
                { firstName: { $regex: searchTerm, $options: 'i' } },
                { lastName: { $regex: searchTerm, $options: 'i' } }
            ]
        };

        if (isAdmin) {
            const students = await Student.find(nameFilter);

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
                return res.status(404).json({ error: "Teacher not found" });
            }

            const subject = teacher.subject;

            const students = await Student.find({
                ...nameFilter,
                subjects: { $in: [subject] }
            });

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



module.exports = router;