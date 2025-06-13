const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: true
    }
}, {
    timestamps: true
});

const studentSchema = new mongoose.Schema({
    admissionNum: {
        type: Number,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
    religion: {
        type: String,
        trim: true
    },
    guardian: {
        name: String,
        phone: String,
        occupation: String
    },
    address: {
        type: String,
        required: true
    },
    form: {
        type: Number,
        required: true,
        min: 1,
        max: 6
    },
    subjects: [{
        type: String,
        required: true
    }]
}, {
    timestamps: true
});

const gradeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    assessment: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    subject: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const attendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    attended: {
        type: Boolean,
        default: false,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    subject: {
        type: String,
        required: true
    }
});

const commentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    comment: {
        type: String,
        required: false
    },
    subject: {
        type: String,
        required: true
    }
});

const Teacher = mongoose.model('Teacher', teacherSchema);
const Student = mongoose.model('Student', studentSchema);
const Grade = mongoose.model('Grade', gradeSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Comment = mongoose.model('Comment', commentSchema);

module.exports = {
    Teacher,
    Student,
    Grade,
    Attendance,
    Comment
};