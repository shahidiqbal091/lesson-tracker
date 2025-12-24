/*
  # Quran LMS Database Schema
  
  ## Overview
  Complete Online Quran Classes Management System with multi-role support
  
  ## New Tables
  
  ### Core User Management
  - `profiles` - Extended user information for all user types
    - `id` (uuid, FK to auth.users)
    - `full_name` (text)
    - `email` (text)
    - `phone` (text)
    - `role` (text: admin, teacher, student, parent)
    - `avatar_url` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  ### Teacher Management
  - `teachers` - Teacher-specific information
    - `id` (uuid, PK)
    - `user_id` (uuid, FK to profiles)
    - `specialization` (text[])
    - `qualification` (text)
    - `experience_years` (integer)
    - `bio` (text)
    - `hourly_rate` (numeric)
    - `is_active` (boolean)
    
  ### Student Management
  - `students` - Student information
    - `id` (uuid, PK)
    - `user_id` (uuid, FK to profiles)
    - `date_of_birth` (date)
    - `gender` (text)
    - `level` (text: Qaida, Nazra, Hifz, Tajweed)
    - `enrollment_date` (date)
    - `is_active` (boolean)
  
  - `parent_student_relation` - Links parents to their children
    - `id` (uuid, PK)
    - `parent_id` (uuid, FK to profiles)
    - `student_id` (uuid, FK to students)
    - `relationship` (text)
  
  ### Course & Class Management
  - `courses` - Course templates
    - `id` (uuid, PK)
    - `name` (text)
    - `level` (text: Qaida, Nazra, Hifz, Tajweed)
    - `description` (text)
    - `duration_weeks` (integer)
    - `fee_amount` (numeric)
  
  - `classes` - Scheduled classes
    - `id` (uuid, PK)
    - `course_id` (uuid, FK to courses)
    - `teacher_id` (uuid, FK to teachers)
    - `class_name` (text)
    - `schedule_day` (text)
    - `schedule_time` (time)
    - `duration_minutes` (integer)
    - `meeting_link` (text)
    - `max_students` (integer)
    - `is_active` (boolean)
  
  - `enrollments` - Student class enrollments
    - `id` (uuid, PK)
    - `student_id` (uuid, FK to students)
    - `class_id` (uuid, FK to classes)
    - `enrollment_date` (date)
    - `status` (text: active, completed, dropped)
  
  ### Attendance Management
  - `attendance` - Attendance records
    - `id` (uuid, PK)
    - `class_id` (uuid, FK to classes)
    - `student_id` (uuid, FK to students)
    - `date` (date)
    - `status` (text: present, absent, late, excused)
    - `notes` (text)
  
  ### Fee Management
  - `fee_records` - Fee structure per student
    - `id` (uuid, PK)
    - `student_id` (uuid, FK to students)
    - `amount` (numeric)
    - `frequency` (text: monthly, weekly, per_class)
    - `due_date` (date)
    - `status` (text: pending, paid, overdue)
  
  - `payments` - Payment transactions
    - `id` (uuid, PK)
    - `fee_record_id` (uuid, FK to fee_records)
    - `student_id` (uuid, FK to students)
    - `amount` (numeric)
    - `payment_date` (date)
    - `payment_method` (text)
    - `transaction_id` (text)
    - `notes` (text)
  
  ### Homework Management
  - `homework` - Homework assignments
    - `id` (uuid, PK)
    - `class_id` (uuid, FK to classes)
    - `teacher_id` (uuid, FK to teachers)
    - `title` (text)
    - `description` (text)
    - `due_date` (date)
    - `assigned_date` (date)
    - `max_score` (integer)
  
  - `homework_submissions` - Student homework submissions
    - `id` (uuid, PK)
    - `homework_id` (uuid, FK to homework)
    - `student_id` (uuid, FK to students)
    - `submission_text` (text)
    - `submission_date` (timestamptz)
    - `score` (integer)
    - `feedback` (text)
    - `status` (text: pending, graded)
  
  ### Progress Tracking
  - `progress_reports` - Student progress records
    - `id` (uuid, PK)
    - `student_id` (uuid, FK to students)
    - `teacher_id` (uuid, FK to teachers)
    - `report_date` (date)
    - `quran_memorization` (integer)
    - `tajweed_score` (integer)
    - `attendance_percentage` (numeric)
    - `overall_performance` (text)
    - `teacher_comments` (text)
  
  ### Recorded Lessons
  - `recorded_lessons` - Video recordings of classes
    - `id` (uuid, PK)
    - `class_id` (uuid, FK to classes)
    - `title` (text)
    - `video_url` (text)
    - `duration_minutes` (integer)
    - `recorded_date` (date)
    - `description` (text)
  
  ### Notifications
  - `notifications` - System notifications
    - `id` (uuid, PK)
    - `user_id` (uuid, FK to profiles)
    - `type` (text: fee_reminder, class_reminder, homework, report)
    - `title` (text)
    - `message` (text)
    - `is_read` (boolean)
    - `sent_via_whatsapp` (boolean)
    - `created_at` (timestamptz)
  
  ## Security
  - Enable RLS on all tables
  - Add policies for role-based access control
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  specialization text[] DEFAULT '{}',
  qualification text,
  experience_years integer DEFAULT 0,
  bio text,
  hourly_rate numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female')),
  level text CHECK (level IN ('Qaida', 'Nazra', 'Hifz', 'Tajweed')),
  enrollment_date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create parent_student_relation table
CREATE TABLE IF NOT EXISTS parent_student_relation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  relationship text DEFAULT 'parent',
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level text NOT NULL CHECK (level IN ('Qaida', 'Nazra', 'Hifz', 'Tajweed')),
  description text,
  duration_weeks integer DEFAULT 12,
  fee_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL NOT NULL,
  class_name text NOT NULL,
  schedule_day text,
  schedule_time time,
  duration_minutes integer DEFAULT 60,
  meeting_link text,
  max_students integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  enrollment_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, class_id)
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id, date)
);

-- Create fee_records table
CREATE TABLE IF NOT EXISTS fee_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  frequency text DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'weekly', 'per_class')),
  due_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_record_id uuid REFERENCES fee_records(id) ON DELETE SET NULL,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  payment_date date DEFAULT CURRENT_DATE,
  payment_method text,
  transaction_id text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create homework table
CREATE TABLE IF NOT EXISTS homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  assigned_date date DEFAULT CURRENT_DATE,
  max_score integer DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

-- Create homework_submissions table
CREATE TABLE IF NOT EXISTS homework_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id uuid REFERENCES homework(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  submission_text text,
  submission_date timestamptz DEFAULT now(),
  score integer,
  feedback text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'graded')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(homework_id, student_id)
);

-- Create progress_reports table
CREATE TABLE IF NOT EXISTS progress_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
  report_date date DEFAULT CURRENT_DATE,
  quran_memorization integer DEFAULT 0,
  tajweed_score integer DEFAULT 0,
  attendance_percentage numeric DEFAULT 0,
  overall_performance text,
  teacher_comments text,
  created_at timestamptz DEFAULT now()
);

-- Create recorded_lessons table
CREATE TABLE IF NOT EXISTS recorded_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  video_url text NOT NULL,
  duration_minutes integer DEFAULT 0,
  recorded_date date DEFAULT CURRENT_DATE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('fee_reminder', 'class_reminder', 'homework', 'report', 'general')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  sent_via_whatsapp boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_relation ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE recorded_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for teachers
CREATE POLICY "Teachers can view own profile"
  ON teachers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage teachers"
  ON teachers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can view active teachers"
  ON teachers FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for students
CREATE POLICY "Students can view own profile"
  ON students FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Parents can view their children"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_relation
      WHERE parent_student_relation.student_id = students.id
      AND parent_student_relation.parent_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view their students"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      JOIN teachers t ON c.teacher_id = t.id
      WHERE e.student_id = students.id
      AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage students"
  ON students FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for parent_student_relation
CREATE POLICY "Parents can view their relationships"
  ON parent_student_relation FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

CREATE POLICY "Admins can manage parent relationships"
  ON parent_student_relation FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for courses
CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for classes
CREATE POLICY "Anyone can view active classes"
  ON classes FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Teachers can manage their classes"
  ON classes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = classes.teacher_id
      AND teachers.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all classes"
  ON classes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for enrollments
CREATE POLICY "Students can view own enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = enrollments.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view their class enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN teachers t ON c.teacher_id = t.id
      WHERE c.id = enrollments.class_id
      AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage enrollments"
  ON enrollments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for attendance
CREATE POLICY "Students can view own attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = attendance.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage attendance for their classes"
  ON attendance FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN teachers t ON c.teacher_id = t.id
      WHERE c.id = attendance.class_id
      AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_relation
      WHERE parent_student_relation.student_id = attendance.student_id
      AND parent_student_relation.parent_id = auth.uid()
    )
  );

-- RLS Policies for fee_records
CREATE POLICY "Students can view own fees"
  ON fee_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = fee_records.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's fees"
  ON fee_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_relation
      WHERE parent_student_relation.student_id = fee_records.student_id
      AND parent_student_relation.parent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage fees"
  ON fee_records FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for payments
CREATE POLICY "Students can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = payments.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_relation
      WHERE parent_student_relation.student_id = payments.student_id
      AND parent_student_relation.parent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for homework
CREATE POLICY "Students can view homework for their classes"
  ON homework FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN students s ON e.student_id = s.id
      WHERE e.class_id = homework.class_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage homework for their classes"
  ON homework FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = homework.teacher_id
      AND teachers.user_id = auth.uid()
    )
  );

-- RLS Policies for homework_submissions
CREATE POLICY "Students can manage own submissions"
  ON homework_submissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = homework_submissions.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view and grade submissions"
  ON homework_submissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM homework h
      JOIN teachers t ON h.teacher_id = t.id
      WHERE h.id = homework_submissions.homework_id
      AND t.user_id = auth.uid()
    )
  );

-- RLS Policies for progress_reports
CREATE POLICY "Students can view own progress"
  ON progress_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = progress_reports.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's progress"
  ON progress_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_relation
      WHERE parent_student_relation.student_id = progress_reports.student_id
      AND parent_student_relation.parent_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage progress reports"
  ON progress_reports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = progress_reports.teacher_id
      AND teachers.user_id = auth.uid()
    )
  );

-- RLS Policies for recorded_lessons
CREATE POLICY "Students can view recorded lessons for their classes"
  ON recorded_lessons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN students s ON e.student_id = s.id
      WHERE e.class_id = recorded_lessons.class_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage recorded lessons"
  ON recorded_lessons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN teachers t ON c.teacher_id = t.id
      WHERE c.id = recorded_lessons.class_id
      AND t.user_id = auth.uid()
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_level ON students(level);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class_id ON enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_fee_records_student_id ON fee_records(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_records_status ON fee_records(status);
CREATE INDEX IF NOT EXISTS idx_homework_class_id ON homework(class_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);