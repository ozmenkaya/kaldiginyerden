-- UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users tablosu (admin, participant, company)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'participant', 'company')),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Katilimci profilleri
CREATE TABLE IF NOT EXISTS participant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  city VARCHAR(100),
  birth_year INTEGER,
  education_level VARCHAR(50),
  last_work_year INTEGER,
  career_break_reason TEXT,
  bio TEXT,
  skills TEXT[],
  desired_sectors TEXT[],
  desired_position VARCHAR(200),
  cv_file_path VARCHAR(500),
  profile_photo VARCHAR(500),
  availability VARCHAR(50),
  is_searchable BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sirket profilleri
CREATE TABLE IF NOT EXISTS company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(200) NOT NULL,
  sector VARCHAR(100),
  company_size VARCHAR(50),
  city VARCHAR(100),
  website VARCHAR(300),
  description TEXT,
  logo_path VARCHAR(500),
  contact_person VARCHAR(100),
  contact_phone VARCHAR(20),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Is ilanlari
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  requirements TEXT,
  location VARCHAR(100),
  employment_type VARCHAR(50),
  salary_range VARCHAR(100),
  flexible_hours BOOLEAN DEFAULT false,
  remote_option BOOLEAN DEFAULT false,
  returner_friendly BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  deadline DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Basvurular
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participant_profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(participant_id, job_id)
);

-- Egitimler
CREATE TABLE IF NOT EXISTS trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  duration_hours INTEGER,
  level VARCHAR(50),
  format VARCHAR(50),
  url VARCHAR(500),
  thumbnail VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Egitim kayitlari
CREATE TABLE IF NOT EXISTS training_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participant_profiles(id) ON DELETE CASCADE,
  training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'enrolled',
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(participant_id, training_id)
);

-- Eslesme kayitlari
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participant_profiles(id),
  job_id UUID REFERENCES job_postings(id),
  score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Form sablonlari
CREATE TABLE IF NOT EXISTS form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  form_type VARCHAR(50) NOT NULL CHECK (form_type IN ('participant', 'company')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Form alanlari
CREATE TABLE IF NOT EXISTS form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  field_label VARCHAR(200) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  options JSONB,
  is_required BOOLEAN DEFAULT false,
  is_matchable BOOLEAN DEFAULT false,
  match_weight DECIMAL(3,2) DEFAULT 1.00,
  sort_order INTEGER DEFAULT 0,
  placeholder VARCHAR(200),
  validation_rules JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Form yanitlari
CREATE TABLE IF NOT EXISTS form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Eslestirme sonuclari
CREATE TABLE IF NOT EXISTS match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_user_id UUID REFERENCES users(id),
  company_user_id UUID REFERENCES users(id),
  total_score DECIMAL(5,2),
  field_scores JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
