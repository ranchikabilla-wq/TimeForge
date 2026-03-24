-- =====================================================
-- TimeForge Supabase Database Schema
-- =====================================================
-- This schema stores saved timetables for authenticated users
-- Each user can only access their own timetables via RLS policies

-- Enable Row Level Security
-- =====================================================

-- Create the saved_timetables table
CREATE TABLE IF NOT EXISTS saved_timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- General Configuration
  config JSONB NOT NULL,
  
  -- Branches, Subjects, Labs, etc.
  branches JSONB NOT NULL DEFAULT '[]'::jsonb,
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  combined_classes JSONB NOT NULL DEFAULT '[]'::jsonb,
  confirmed_classes JSONB NOT NULL DEFAULT '[]'::jsonb,
  lab_rooms JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Generated Timetables (Record<string, (TimetableCell | null)[][]>)
  timetables JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Warnings and Colors
  warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  subject_colors JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Indexes for better query performance
  CONSTRAINT saved_timetables_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_timetables_user_id ON saved_timetables(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_timetables_created_at ON saved_timetables(created_at DESC);

-- Enable Row Level Security
ALTER TABLE saved_timetables ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own timetables
-- =====================================================

-- Policy: Users can view only their own timetables
CREATE POLICY "Users can view their own timetables"
  ON saved_timetables
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own timetables
CREATE POLICY "Users can insert their own timetables"
  ON saved_timetables
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own timetables
CREATE POLICY "Users can update their own timetables"
  ON saved_timetables
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own timetables
CREATE POLICY "Users can delete their own timetables"
  ON saved_timetables
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER update_saved_timetables_updated_at
  BEFORE UPDATE ON saved_timetables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire SQL script
-- 4. Click "Run" to execute
-- 5. Verify the table was created in the Table Editor
-- =====================================================
