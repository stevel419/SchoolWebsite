require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { Teacher, Student, Grade, Attendance, Comment } = require('./schemas.js');
const authenticateJWT = require('./middleware/authMiddleware.js');
const s3 = require('./config/s3Client.js');
const puppeteer = require('puppeteer');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');



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
        to: 'i.mathew160@gmail.com', // Change to actual recipient
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


const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ------------------------
// Multer setup to save into public/
// ------------------------
const destinationPath = path.join(__dirname, '../public')
console.log('Saving uploaded files to:', destinationPath)

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../client/public'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  });
const upload = multer({ storage });

const slidesFile = path.join(__dirname, 'data', 'slides.json');
const staffFile = path.join(__dirname, 'data', 'staff.json');

// ------------------------
// Helper functions
// ------------------------
function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ------------------------
// Get all slides
// ------------------------
router.get('/get-slides', (req, res) => {

  try {
    res.status(200).json(readJson(slidesFile));
  } catch (e) {
    res.status(500).json({ error: 'Error reading slides file' });
  }
});

// ------------------------
// Get all staff
// ------------------------
router.get('/get-staff', (req, res) => {
  try {
    res.status(200).json(readJson(staffFile));
  } catch (e) {
    res.status(500).json({ error: 'Error reading staff file' });
  }
});

// ------------------------
// Add new slide
// ------------------------
router.post('/add-slide', upload.single('image'), (req, res) => {
    console.log('req.file:', req.file); // debug output

  if (!req.file || !req.body.text) {
    return res.status(400).json({ error: 'Missing image or text' });
  }

  try {
    const filePath = `/${req.file.filename}`; // public/filename
    const slides = readJson(slidesFile);
    slides.push({ image: filePath, text: req.body.text });
    writeJson(slidesFile, slides);
    res.status(200).json({ message: 'Slide added successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not add slide' });
  }
});

// ------------------------
// Delete slide by index
// ------------------------
router.delete('/delete-slide/:index', (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const slides = readJson(slidesFile);

    if (isNaN(index) || index < 0 || index >= slides.length) {
      return res.status(400).json({ error: 'Invalid index' });
    }

    const [deletedSlide] = slides.splice(index, 1);
    writeJson(slidesFile, slides);

    // Delete image file
    const filePath = path.join(__dirname, '../public', path.basename(deletedSlide.image));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.status(200).json({ message: 'Slide deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error deleting slide' });
  }
});

// ------------------------
// Add new staff
// ------------------------
router.post('/add-staff', upload.single('image'), (req, res) => {
  if (!req.file || !req.body.name || !req.body.position) {
    return res.status(400).json({ error: 'Missing image, name, or position' });
  }

  try {
    const filePath = `/${req.file.filename}`; // public/filename
    const staff = readJson(staffFile);
    staff.push({ image: filePath, name: req.body.name, position: req.body.position });
    writeJson(staffFile, staff);
    res.status(200).json({ message: 'Staff added successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not add staff' });
  }
});

// ------------------------
// Delete staff by index
// ------------------------
router.delete('/delete-staff/:index', (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const staff = readJson(staffFile);

    if (isNaN(index) || index < 0 || index >= staff.length) {
      return res.status(400).json({ error: 'Invalid index' });
    }

    const [deletedStaff] = staff.splice(index, 1);
    writeJson(staffFile, staff);

    // Delete image file
    const filePath = path.join(__dirname, '../public', path.basename(deletedStaff.image));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error deleting staff' });
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
      for (const subject of Object.keys(missedSubjectMap)) {
        student.classesMissed[subject] = (student.classesMissed[subject] || 0) + 1;
      }

      const todaysAttendance = await Attendance.find({
        student: student._id,
        date: { $gte: todayStart, $lte: todayEnd },
        finalized: true
      });

      const missedAll = todaysAttendance.length > 0 && todaysAttendance.every(a => !a.attended);
      if (missedAll) {
        student.daysMissed = (student.daysMissed || 0) + 1;
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
    const browser = await puppeteer.launch({ headless: 'new' });

    const uploadPromises = Object.entries(reportDict).map(async ([reportKey, html]) => {
      const fileKey = `reports/${reportKey}.pdf`;

      let isExisting = false;
      try {
        await s3.send(new HeadObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
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
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
        ACL: 'public-read'
      }));

      const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${fileKey}`;

      return {
        reportKey,
        fileUrl,
        message: isExisting ? 'Report updated in S3' : 'Report created in S3'
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


router.get('/get-report-url/:reportKey', async (req, res) => {
  const reportKey = req.params.reportKey;
  const fileKey = `reports/${reportKey}.pdf`;

  try {
    await s3.send(new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey
    }));

    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${fileKey}`;
    res.json({ fileUrl });
  } catch (err) {
    if (err.name === 'NotFound') {
      res.status(404).json({ error: 'Report not found' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Error checking report' });
    }
  }
});






module.exports = router;