require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { Teacher, Student, Grade, Attendance, Comment } = require('./schemas.js');
const authenticateJWT = require('./middleware/authMiddleware.js');
const s3 = require('./config/s3Client.js');
const puppeteer = require('puppeteer');
const { GetObjectCommand, DeleteObjectCommand, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

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

router.post('/change-password', async (req, res) => {
  try {
    const { teacherId, newPassword } = req.body;

    if (!teacherId || !newPassword) {
      return res.status(400).json({ error: "Teacher ID and new password are required" });
    }

    // Find the teacher
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    await Teacher.findByIdAndUpdate(teacherId, { password: hashedPassword });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to change password" });
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
        if (!teacher.isActive) {
          return res.status(403).json({ error: "Your account has been deactivated. Please contact an administrator." });
        }

        const token = jwt.sign({
            isAdmin: teacher.isAdmin,
            teacherId: teacher._id,
            subject: teacher.subject
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

              const studentObj = student.toObject();

              if (!studentObj.classesMissed) {
                  studentObj.classesMissed = {};
              }

              return {
                  ...studentObj,
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

        const { admissionNum, firstName, lastName, dateOfBirth, gender, religion, guardian, address, form, subjects, status, tuitionOwed, isEditMode } = req.body;

        const student = await Student.findOne({ admissionNum }).session(session);

        if (!isEditMode && student) {
            await session.abortTransaction();
            return res.status(400).json({ error: "Duplicate admission number, student already exists" });
        }

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
                status,
                tuitionOwed
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
        student.status = status;
        student.tuitionOwed = tuitionOwed;

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
      return res.status(400).json({ error: "Student not found in database" });
    }

    const attendanceQuery = {
      student: student._id,
      subject
    };
    if (!isAdmin) {
      attendanceQuery.teacher = teacherId;
    }

    let attendance = await Attendance.findOne(attendanceQuery);
    let resolvedTeacherId = teacherId;

    if (!attendance) {
      if (isAdmin) {
        const existingToday = await Attendance.findOne({
          student: student._id,
          subject,
          date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        });
        resolvedTeacherId = existingToday?.teacher || (await Teacher.findOne({ subject }))?._id;

        if (!resolvedTeacherId) {
          return res.status(400).json({ error: "No teacher found for subject" });
        }
      }

      attendance = new Attendance({
        student: student._id,
        teacher: resolvedTeacherId,
        subject,
        attended,
        date: new Date(),
        finalized: false
      });
    } else {
      attendance.attended = attended;
      attendance.finalized = false;
    }

    await attendance.save();
    res.status(200).json({ message: "Attendance draft saved", attendance });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update attendance" });
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

router.delete('/delete-student/:admissionNum', authenticateJWT, async (req, res) => {
    const session = await Student.startSession();
    session.startTransaction();

    try {
        const isAdmin = req.user.isAdmin;
        if (!isAdmin) {
            return res.status(403).json({ error: "Only admin can delete a student" });
        }

        const { admissionNum } = req.params;
        const student = await Student.findOne({ admissionNum }).session(session);

        if (!student) {
            await session.abortTransaction();
            return res.status(404).json({ error: "Student is not in database" });
        }

        const studentId = student._id;

        // Delete all associated records
        await Promise.all([
            Grade.deleteMany({ student: studentId }).session(session),
            Comment.deleteMany({ student: studentId }).session(session),
            Attendance.deleteMany({ student: studentId }).session(session),
            Student.deleteOne({ _id: studentId }).session(session),
        ]);

        await session.commitTransaction();
        return res.status(200).json({ message: "Student and associated records deleted successfully" });
    } catch (e) {
        await session.abortTransaction();
        console.error(e);
        return res.status(500).json({ error: e.message || "Failed to delete student" });
    } finally {
        session.endSession();
    }
});

const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const { Readable } = require('stream');

function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

router.post('/submit-application', async (req, res) => {
  const {
    firstName, lastName, DOB, sex, religion,
    gFirstName, gLastName, gNumber, gOccupation, address
  } = req.body;

  const doc = new PDFDocument();
  let pdfBuffer = Buffer.alloc(0);

  doc.on('data', (chunk) => {
    pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
  });

  doc.on('end', async () => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    try {
      await transporter.sendMail({
        from: `"Kiguruyembe School" <${process.env.EMAIL_USER}>`,
        to: 'kigurunyembess@gmail.com', // Change to actual recipient
        subject: 'New Application Submission',
        text: `New application from ${firstName} ${lastName}`,
        attachments: [{
          filename: `${firstName}_${lastName}_Application.pdf`,
          content: pdfBuffer
        }]
      });

      res.status(200).json({ message: 'Application submitted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Email failed to send' });
    }
  });

  doc.fontSize(18).text("Student Application", { align: 'center' }).moveDown();
  doc.fontSize(12).text(`Name: ${firstName} ${lastName}`);
  doc.text(`DOB: ${DOB}`);
  doc.text(`Sex: ${sex}`);
  doc.text(`Religion: ${religion}`);
  doc.moveDown();
  doc.text(`Guardian: ${gFirstName} ${gLastName}`);
  doc.text(`Phone: ${gNumber}`);
  doc.text(`Occupation: ${gOccupation}`);
  doc.text(`Address: ${address}`);
  doc.end();
});

const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const bucketName = process.env.S3_BUCKET;
// S3 keys for JSON files
const SLIDES_JSON_KEY = 'data/slides.json';
const STAFF_JSON_KEY = 'data/staff.json';
const EXAM_RESULTS_JSON_KEY = 'data/examResults.json';

// Configure multer with S3 storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    key: function (req, file, cb) {
      let folder = '';
      if (req.route.path.includes('slide')) {
        folder = 'slides/';
      } else if (req.route.path.includes('staff')) {
        folder = 'staff/';
      }
      
      const fileName = `${folder}${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 20 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper function to read JSON from S3
async function readJsonFromS3(key) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    
    const result = await s3.send(command);
    const bodyContents = await streamToString(result.Body);
    return JSON.parse(bodyContents);
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      console.log(`File ${key} not found in S3, returning empty array`);
      return [];
    }
    throw error;
  }
}

// Helper function to convert stream to string
async function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

// Helper function to write JSON to S3
async function writeJsonToS3(key, data) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json'
    });
    
    await s3.send(command);
    console.log(`Successfully saved ${key} to S3`);
  } catch (error) {
    console.error(`Error saving ${key} to S3:`, error);
    throw error;
  }
}

// Helper function to delete file from S3
async function deleteFromS3(fileUrl) {
  try {
    const key = fileUrl.split('.com/')[1];
    
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    
    await s3.send(command);
    console.log(`Successfully deleted ${key} from S3`);
  } catch (error) {
    console.error('Error deleting from S3:', error);
  }
}

// Get all slides
router.get('/get-slides', async (req, res) => {
  try {
    const slides = await readJsonFromS3(SLIDES_JSON_KEY);
    res.status(200).json(slides);
  } catch (e) {
    console.error('Error reading slides from S3:', e);
    res.status(500).json({ error: 'Error reading slides file' });
  }
});

// Get all staff
router.get('/get-staff', async (req, res) => {
  try {
    const staff = await readJsonFromS3(STAFF_JSON_KEY);
    res.status(200).json(staff);
  } catch (e) {
    console.error('Error reading staff from S3:', e);
    res.status(500).json({ error: 'Error reading staff file' });
  }
});

// Add new slide
router.post('/add-slide', upload.single('image'), async (req, res) => {
  console.log('req.file:', req.file);

  if (!req.file || !req.body.text) {
    return res.status(400).json({ error: 'Missing image or text' });
  }

  try {
    const filePath = req.file.location; // S3 URL
    const slides = await readJsonFromS3(SLIDES_JSON_KEY);
    slides.push({ image: filePath, text: req.body.text });
    await writeJsonToS3(SLIDES_JSON_KEY, slides);
    res.status(200).json({ message: 'Slide added successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not add slide' });
  }
});

// Delete slide by index
router.delete('/delete-slide/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const slides = await readJsonFromS3(SLIDES_JSON_KEY);

    if (isNaN(index) || index < 0 || index >= slides.length) {
      return res.status(400).json({ error: 'Invalid index' });
    }

    const [deletedSlide] = slides.splice(index, 1);
    await writeJsonToS3(SLIDES_JSON_KEY, slides);

    // Delete image from S3
    if (deletedSlide.image && deletedSlide.image.includes('amazonaws.com')) {
      await deleteFromS3(deletedSlide.image);
    }

    res.status(200).json({ message: 'Slide deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error deleting slide' });
  }
});

// Add new staff
router.post('/add-staff', upload.single('image'), async (req, res) => {
  if (!req.file || !req.body.name || !req.body.position) {
    return res.status(400).json({ error: 'Missing image, name, or position' });
  }

  try {
    const filePath = req.file.location; // S3 URL
    const staff = await readJsonFromS3(STAFF_JSON_KEY);
    staff.push({ image: filePath, name: req.body.name, position: req.body.position });
    await writeJsonToS3(STAFF_JSON_KEY, staff);
    res.status(200).json({ message: 'Staff added successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not add staff' });
  }
});

// Delete staff by index
router.delete('/delete-staff/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const staff = await readJsonFromS3(STAFF_JSON_KEY);

    if (isNaN(index) || index < 0 || index >= staff.length) {
      return res.status(400).json({ error: 'Invalid index' });
    }

    const [deletedStaff] = staff.splice(index, 1);
    await writeJsonToS3(STAFF_JSON_KEY, staff);

    // Delete image from S3
    if (deletedStaff.image && deletedStaff.image.includes('amazonaws.com')) {
      await deleteFromS3(deletedStaff.image);
    }

    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error deleting staff' });
  }
});

// Get all exam results
router.get('/get-exam-results', async (req, res) => {
  try {
    const results = await readJsonFromS3(EXAM_RESULTS_JSON_KEY);
    // Ensure we return an array
    if (!Array.isArray(results)) {
      return res.json([]);
    }
    res.json(results);
  } catch (error) {
    console.error('[GET /get-exam-results] Error:', error);
    res.status(500).json({ error: 'Failed to read exam results' });
  }
});

// Update exam results
router.post('/update-exam-results', async (req, res) => {
  try {
    const { results } = req.body;
    
    // Validate that results is an array
    if (!Array.isArray(results)) {
      return res.status(400).json({ error: 'Results must be an array' });
    }
    
    await writeJsonToS3(EXAM_RESULTS_JSON_KEY, results);
    res.sendStatus(200);
  } catch (error) {
    console.error('[POST /update-exam-results] Error:', error);
    res.status(500).json({ error: 'Failed to update exam results' });
  }
});

router.post('/check-password', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
      return res.status(200).send('ok');
    }
    return res.status(401).send('Unauthorized');
});
  
router.post('/finalize-attendance', authenticateJWT, async (req, res) => {
  try {
    const teacherId = req.user.teacherId;
    const isAdmin = req.user.isAdmin;
    const { records } = req.body;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (!isAdmin) {
      const alreadyFinalized = await Attendance.findOne({
        teacher: teacherId,
        date: { $gte: todayStart, $lte: todayEnd },
        finalized: true
      });

      if (alreadyFinalized) {
        return res.status(400).json({ error: "Attendance already finalized for today" });
      }
    }

    const missedSubjectMap = new Map();

    for (const record of records) {
      const { admissionNum, subject, attended } = record;

      const student = await Student.findOne({ admissionNum });
      if (!student) continue;

      // Determine the teacher
      const teacher = isAdmin
        ? await Teacher.findOne({ subject })
        : { _id: teacherId };

      if (!teacher) continue;

      const attendanceQuery = {
        student: student._id,
        subject,
        teacher: teacher._id,
        date: { $gte: todayStart, $lte: todayEnd }
      };

      let attendance = await Attendance.findOne(attendanceQuery);

      if (!attendance) {
        attendance = new Attendance({
          student: student._id,
          teacher: teacher._id,
          subject,
          date: new Date(),
          attended
        });
      } else {
        attendance.attended = attended;
      }

      attendance.finalized = true;
      await attendance.save();

      if (!attended) {
        const subjMap = missedSubjectMap.get(student._id.toString()) || {};
        subjMap[subject] = true;
        missedSubjectMap.set(student._id.toString(), subjMap);
      }
    }

    for (const [studentId, subjectsMissed] of missedSubjectMap.entries()) {
      const student = await Student.findById(studentId);
      if (!student) continue;
    
      if (!student.classesMissed || typeof student.classesMissed !== 'object') {
        student.classesMissed = {};
      }
    
      // Update per-subject missed counts
      for (const subject of Object.keys(subjectsMissed)) {
        student.classesMissed[subject] = (student.classesMissed[subject] || 0) + 1;
      }
    
      // Only increment daysMissed ONCE if student missed ALL finalized classes for the day
      const todaysAttendance = await Attendance.find({
        student: student._id,
        date: { $gte: todayStart, $lte: todayEnd },
        finalized: true
      });
    
      const missedAll = todaysAttendance.length > 0 && todaysAttendance.every(a => !a.attended);
    
      if (missedAll && !student.lastMissedDate?.startsWith(todayStart.toISOString().slice(0, 10))) {
        student.daysMissed = (student.daysMissed || 0) + 1;
        student.lastMissedDate = new Date(); // optional: track last date missed to prevent double-counting
      }
    
      await student.save();
    }
  

    res.status(200).json({ message: "Attendance finalized and saved." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to finalize attendance" });
  }
});

router.get('/attendance-finalized-status', authenticateJWT, async (req, res) => {
  try {
    const teacherId = req.user.teacherId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyFinalized = await Attendance.exists({
      teacher: teacherId,
      date: today
    });

    res.status(200).json({ finalized: !!alreadyFinalized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check attendance status" });
  }
});

router.post('/save-reports', async (req, res) => {
  const reportDict = req.body.reports;

  if (typeof reportDict !== 'object' || !reportDict || Object.keys(reportDict).length === 0) {
    return res.status(400).json({ error: 'Invalid or empty report dictionary' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const uploadPromises = Object.entries(reportDict).map(async ([reportKey, html]) => {
      const fileKey = `reports/${reportKey}.pdf`;
      const admissionNum = reportKey.split('-')[0];
      const form = reportKey.split('-')[2];

      let isExisting = false;
      try {
        await s3.send(new HeadObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: fileKey
        }));
        isExisting = true;
      } catch (err) {
        if (err.name !== 'NotFound') throw err;
      }

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4' });
      await page.close();

      await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: fileKey,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      }));

      const fileUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

      const student = await Student.findOne({ admissionNum });
      if (student) {
        student.reports = student.reports || [];
        
        const existingIndex = student.reports.findIndex(r => r.form === form);
        if (existingIndex >= 0) {
          student.reports[existingIndex] = {
            url: fileUrl,
            form: form
          };
        } else {
          student.reports.push({
            url: fileUrl,
            form: form
          });
        }

        await student.save();
      } else {
        return res.status(400).json({ error: "Student not found in database" });
      }

      return {
        reportKey,
        fileUrl,
        message: isExisting ? 'Report updated in S3 and MongoDB' : 'Report created in S3 and saved in MongoDB'
      };
    });

    const results = await Promise.all(uploadPromises);
    await browser.close();

    res.status(200).json({ reports: results });
  } catch (err) {
    console.error('Failed to save reports:', err);
    res.status(500).json({ error: 'One or more reports failed to save' });
  }
});

router.post('/deactivate-teacher', async (req, res) => {
  try {
      const { teacherId, confirm } = req.body;

      if (!teacherId || confirm !== true) {
          return res.status(400).json({ error: "Missing teacher ID or confirmation" });
      }

      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
          return res.status(404).json({ error: "Teacher not found" });
      }

      teacher.isActive = false;
      await teacher.save();

      res.status(200).json({ message: "Teacher deactivated successfully" });
  } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to deactivate teacher" });
  }
});

router.get('/get-teachers', async (req, res) => {
  try {
    const teachers = await Teacher.find().select('-password'); // exclude password
    res.status(200).json(teachers);
  } catch (err) {
    console.error("Failed to fetch teachers:", err);
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
});

router.get('/exam-results', authenticateJWT, async (req, res) => {
  try {
      const { form, subject } = req.query;

      // Fetch all students (optionally filter by form)
      const students = await Student.find(form ? { form: Number(form), status: 'Active' } : { status: 'Active' });

      const studentMap = {};
      students.forEach(student => {
          studentMap[student._id.toString()] = student;
      });

      // Fetch all grades (optionally filter by subject)
      const gradeQuery = subject ? { subject } : {};
      const grades = await Grade.find(gradeQuery).populate('student');

      const filteredGrades = grades.filter(g => studentMap[g.student._id]);

      const results = [];

      for (const g of filteredGrades) {
          const { student, assessments, subject } = g;

          const weights = {
              "Midterm 1": 0.2,
              "Midterm 2": 0.2,
              "Endterm": 0.3,
              "Final": 0.3
          };

          let total = 0, weightSum = 0;
          for (const a of assessments) {
              const w = weights[a.name];
              if (w && a.score != null) {
                  total += a.score * w;
                  weightSum += w;
              }
          }

          const avg = weightSum > 0 ? total / weightSum : null;
          if (avg !== null) {
              results.push({
                  student: {
                      firstName: student.firstName,
                      lastName: student.lastName,
                      form: student.form,
                      id: student._id
                  },
                  subject,
                  average: avg
              });
          }
      }

      // Group by subject + form
      const grouped = {};
      for (const entry of results) {
        const key = `${entry.student.form}-${entry.subject}`;
        if (!grouped[key]) grouped[key] = [];
          grouped[key].push(entry);
      }

      // Final analytics
      const output = Object.entries(grouped).map(([groupKey, entries]) => {
          const [form, subject] = groupKey.split('-');

          const scores = entries.map(e => e.average).sort((a, b) => a - b);

          const percentile = (p) => {
              const idx = Math.floor(p / 100 * scores.length);
              return scores[idx] || 0;
          };

          const gradeCount = { A: 0, B: 0, C: 0, D: 0, E: 0, S: 0, F: 0 };
          const letter = (form, avg) => {
              form = Number(form);
              if (form >= 5) {
                  if (avg >= 80) return 'A';
                  if (avg >= 70) return 'B';
                  if (avg >= 60) return 'C';
                  if (avg >= 50) return 'D';
                  if (avg >= 40) return 'E';
                  if (avg >= 35) return 'S';
                  return 'F';
              } else {
                  if (avg >= 75) return 'A';
                  if (avg >= 65) return 'B';
                  if (avg >= 45) return 'C';
                  if (avg >= 30) return 'D';
                  return 'F';
              }
          };

          for (const e of entries) {
              gradeCount[letter(form, e.average)]++;
          }

          const topStudents = entries
              .sort((a, b) => b.average - a.average)
              .slice(0, 5)
              .map(e => ({ name: `${e.student.firstName} ${e.student.lastName}`, average: e.average }));

          return {
              form: Number(form),
              subject,
              average: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
              percentiles: {
                  p25: percentile(25),
                  p50: percentile(50),
                  p75: percentile(75)
              },
              gradeCount,
              top5: topStudents
          };
      });

      res.json(output);

  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to compute exam results' });
  }
});

module.exports = router;