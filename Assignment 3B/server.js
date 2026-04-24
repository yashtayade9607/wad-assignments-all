const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management_db';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Student Schema
const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true
  },
  className: {
    type: String,
    required: [true, 'Class is required'],
    enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th']
  },
  section: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E'],
    default: 'A'
  },
  semester: {
    type: Number,
    min: 1,
    max: 8,
    default: 1
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  parentName: String,
  parentPhone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  marks: {
    mathematics: { type: Number, min: 0, max: 100, default: 0 },
    science: { type: Number, min: 0, max: 100, default: 0 },
    english: { type: Number, min: 0, max: 100, default: 0 },
    hindi: { type: Number, min: 0, max: 100, default: 0 },
    socialScience: { type: Number, min: 0, max: 100, default: 0 }
  },
  totalMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  grade: { type: String, default: 'N/A' },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total marks, percentage, and grade before saving
studentSchema.pre('save', function(next) {
  const marks = this.marks;
  this.totalMarks = (marks.mathematics || 0) + (marks.science || 0) + (marks.english || 0) + 
                    (marks.hindi || 0) + (marks.socialScience || 0);
  
  this.percentage = (this.totalMarks / 500) * 100;
  
  if (this.percentage >= 90) this.grade = 'A+';
  else if (this.percentage >= 80) this.grade = 'A';
  else if (this.percentage >= 70) this.grade = 'B+';
  else if (this.percentage >= 60) this.grade = 'B';
  else if (this.percentage >= 50) this.grade = 'C';
  else if (this.percentage >= 40) this.grade = 'D';
  else this.grade = 'F';
  
  this.updatedAt = Date.now();
  next();
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
studentSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.userId).select('-password');
    if (!student) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = student;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Check role middleware
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

// ============= API ROUTES =============

// 1. CREATE ADMIN ACCOUNT (Guaranteed to work)
app.post('/api/setup-admin', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await Student.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'Admin already exists!',
        credentials: {
          email: existingAdmin.email,
          password: 'Admin@123'
        }
      });
    }

    // Create new admin
    const adminData = {
      studentId: 'ADMIN001',
      name: 'System Administrator',
      email: 'admin@school.com',
      password: 'Admin@123',
      rollNumber: 'ADMIN001',
      className: '10th',
      section: 'A',
      phone: '9876543210',
      role: 'admin',
      isActive: true
    };

    const admin = new Student(adminData);
    await admin.save();

    res.json({
      success: true,
      message: 'Admin account created successfully!',
      credentials: {
        email: 'admin@school.com',
        password: 'Admin@123'
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating admin account: ' + error.message 
    });
  }
});

// 2. REGISTER STUDENT
app.post('/api/register', [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('rollNumber').notEmpty().withMessage('Roll number is required'),
  body('className').notEmpty().withMessage('Class is required'),
  body('phone').isMobilePhone().withMessage('Please enter a valid 10-digit phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { studentId, email, rollNumber, phone } = req.body;

    // Check for existing student
    const existingStudent = await Student.findOne({ 
      $or: [{ email }, { studentId }, { rollNumber }, { phone }] 
    });
    
    if (existingStudent) {
      let message = 'User already exists with ';
      if (existingStudent.email === email) message += 'this email';
      else if (existingStudent.studentId === studentId) message += 'this student ID';
      else if (existingStudent.rollNumber === rollNumber) message += 'this roll number';
      else message += 'this phone number';
      
      return res.status(400).json({ success: false, message });
    }

    const student = new Student(req.body);
    await student.save();

    const token = jwt.sign(
      { userId: student._id, email: student.email, role: student.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        className: student.className,
        role: student.role,
        isActive: student.isActive
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration: ' + error.message });
  }
});

// 3. LOGIN
app.post('/api/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    
    // Find user by email
    const user = await Student.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Please contact admin.' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        className: user.className,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login: ' + error.message });
  }
});

// 4. GET ALL STUDENTS
app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } },
          { rollNumber: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const students = await Student.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Error fetching students' });
  }
});

// 5. GET SINGLE STUDENT
app.get('/api/students/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ success: false, message: 'Error fetching student' });
  }
});

// 6. UPDATE STUDENT
app.put('/api/students/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check permission
    if (req.user.role === 'student' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only update your own profile.' });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'email', 'className', 'section', 'phone', 'marks', 'isActive'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'marks') {
          Object.keys(req.body.marks).forEach(subject => {
            if (student.marks[subject] !== undefined) {
              student.marks[subject] = req.body.marks[subject];
            }
          });
        } else {
          student[field] = req.body[field];
        }
      }
    });
    
    await student.save();
    const updatedStudent = await Student.findById(req.params.id).select('-password');

    res.json({
      success: true,
      message: 'Student details updated successfully!',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: 'Error updating student details' });
  }
});

// 7. DELETE STUDENT
app.delete('/api/students/:id', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({
      success: true,
      message: `Student ${student.name} (${student.studentId}) has been deleted successfully`
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, message: 'Error deleting student' });
  }
});

// 8. GET STATISTICS
app.get('/api/statistics', authenticateToken, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ role: 'student' });
    const activeStudents = await Student.countDocuments({ role: 'student', isActive: true });
    const totalTeachers = await Student.countDocuments({ role: 'teacher' });
    const totalAdmins = await Student.countDocuments({ role: 'admin' });
    
    const averagePercentage = await Student.aggregate([
      { $match: { role: 'student', isActive: true } },
      { $group: { _id: null, avg: { $avg: '$percentage' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        totalTeachers,
        totalAdmins,
        averagePercentage: averagePercentage[0]?.avg || 0
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ success: false, message: 'Error fetching statistics' });
  }
});

// 9. CHECK ADMIN STATUS
app.get('/api/check-admin', async (req, res) => {
  try {
    const admin = await Student.findOne({ role: 'admin' });
    res.json({
      success: true,
      adminExists: !!admin,
      adminEmail: admin ? admin.email : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking admin status' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// Start server and create admin automatically
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API available at http://localhost:${PORT}/api`);
  
  // Auto-create admin on server start
  try {
    const adminExists = await Student.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = new Student({
        studentId: 'ADMIN001',
        name: 'System Administrator',
        email: 'admin@school.com',
        password: 'Admin@123',
        rollNumber: 'ADMIN001',
        className: '10th',
        section: 'A',
        phone: '9876543210',
        role: 'admin',
        isActive: true
      });
      await admin.save();
      console.log('✅ Admin account created automatically!');
      console.log('📧 Email: admin@school.com');
      console.log('🔑 Password: Admin@123');
    } else {
      console.log('✅ Admin account already exists');
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  }
});