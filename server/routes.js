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

router.post('/save-student', authenticateJWT, async (req, res) => {
    const session = await Student.startSession();
    session.startTransaction();

    try {
        const isAdmin = req.user.isAdmin;
        if (!isAdmin) {
            return res.status(400).json({ error: "Please ask an admin to add student" });
        }

        const { admissionNum, firstName, lastName, dateOfBirth, gender, religion, guardian, address, form, subjects } = req.body;

        const existingStudent = await Student.findOne({ admissionNum }).session(session);
        if (existingStudent) {
            await session.abortTransaction();
            session.endSession();
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
        const savedStudent = await student.save({ session });

        const allGrades = [];
        const allAttendance = [];
        const allComments = [];

        for (const subject of subjects) {
            const subjectTeacher = await Teacher.findOne({ subject }).session(session);
            if (!subjectTeacher) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ error: subject + " teacher does not exist" });
            }
            for (const assessment of ['Midterm', 'Final']) {
                allGrades.push({
                    student: savedStudent._id,
                    teacher: subjectTeacher._id,
                    assessment,
                    score: 0
                });
            }
            allAttendance.push({
                student: savedStudent._id,
                teacher: subjectTeacher._id
            });
            allComments.push({
                student: savedStudent._id,
                teacher: subjectTeacher._id,
                comment: ""
            });
        }

        await Grade.insertMany(allGrades, { session });
        await Attendance.insertMany(allAttendance, { session });
        await Comment.insertMany(allComments, { session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "Student created successfully" });
    } catch (e) {
        await session.abortTransaction();
        session.endSession();
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