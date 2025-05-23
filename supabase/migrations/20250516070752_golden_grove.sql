/*
  # Initial Schema Setup for Daily Planner

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - User's unique identifier
      - `email` (text) - User's email address
      - `created_at` (timestamptz) - When the user was created
      - `updated_at` (timestamptz) - When the user was last updated
      - `name` (text) - User's display name
      - `avatar_url` (text) - URL to user's avatar image
      - `preferences` (jsonb) - User preferences (theme, notifications, etc.)

    - `goals`
      - `id` (uuid, primary key) - Goal's unique identifier
      - `user_id` (uuid) - Reference to users table
      - `title` (text) - Goal title
      - `description` (text) - Goal description
      - `is_automatic` (boolean) - Whether goal repeats daily
      - `created_at` (timestamptz) - When the goal was created
      - `updated_at` (timestamptz) - When the goal was last updated
      - `archived_at` (timestamptz) - When the goal was archived (null if active)

    - `daily_plans`
      - `id` (uuid, primary key) - Plan's unique identifier
      - `user_id` (uuid) - Reference to users table
      - `date` (date) - The date this plan is for
      - `created_at` (timestamptz) - When the plan was created
      - `updated_at` (timestamptz) - When the plan was last updated
      - `notes` (text) - Any notes for the day
      - `mood` (int) - Mood rating for the day (1-5)

    - `daily_goals`
      - `id` (uuid, primary key) - Daily goal's unique identifier
      - `plan_id` (uuid) - Reference to daily_plans table
      - `goal_id` (uuid) - Reference to goals table
      - `completed` (boolean) - Whether the goal was completed
      - `completed_at` (timestamptz) - When the goal was completed
      - `scheduled_start` (timestamptz) - When the goal is scheduled to start
      - `scheduled_end` (timestamptz) - When the goal is scheduled to end
      - `created_at` (timestamptz) - When the daily goal was created
      - `updated_at` (timestamptz) - When the daily goal was last updated

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public access where needed

  3. Functions
    - create_daily_plan() - Creates a new daily plan and adds automatic goals
    - complete_goal() - Marks a goal as complete and updates progress
    - calculate_daily_progress() - Calculates progress for a daily plan
*/

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  name text,
  avatar_url text,
  preferences jsonb DEFAULT '{"theme": "light", "notifications": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create goals table
CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_automatic boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT goals_title_not_empty CHECK (char_length(trim(title)) > 0)
);

-- Create daily_plans table
CREATE TABLE daily_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  notes text,
  mood int CHECK (mood BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, date)
);

-- Create daily_goals table
CREATE TABLE daily_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES daily_plans(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_schedule CHECK (
    (scheduled_start IS NULL AND scheduled_end IS NULL) OR
    (scheduled_start IS NOT NULL AND scheduled_end IS NOT NULL AND scheduled_end > scheduled_start)
  )
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can read own daily plans"
  ON daily_plans FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own daily plans"
  ON daily_plans FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own daily plans"
  ON daily_plans FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can read own daily goals"
  ON daily_goals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_plans
      WHERE daily_plans.id = daily_goals.plan_id
      AND daily_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own daily goals"
  ON daily_goals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_plans
      WHERE daily_plans.id = daily_goals.plan_id
      AND daily_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own daily goals"
  ON daily_goals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_plans
      WHERE daily_plans.id = daily_goals.plan_id
      AND daily_plans.user_id = auth.uid()
    )
  );

-- Create functions
CREATE OR REPLACE FUNCTION create_daily_plan(user_id uuid, plan_date date)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_id uuid;
BEGIN
  -- Create the daily plan
  INSERT INTO daily_plans (user_id, date)
  VALUES (user_id, plan_date)
  RETURNING id INTO plan_id;
  
  -- Add automatic goals
  INSERT INTO daily_goals (plan_id, goal_id)
  SELECT plan_id, goals.id
  FROM goals
  WHERE goals.user_id = user_id
    AND goals.is_automatic = true
    AND goals.archived_at IS NULL;
    
  RETURN plan_id;
END;
$$;

CREATE OR REPLACE FUNCTION complete_goal(goal_id uuid, is_completed boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE daily_goals
  SET 
    completed = is_completed,
    completed_at = CASE WHEN is_completed THEN now() ELSE NULL END,
    updated_at = now()
  WHERE id = goal_id;
END;
$$;

CREATE OR REPLACE FUNCTION calculate_daily_progress(plan_id uuid)
RETURNS float
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_goals int;
  completed_goals int;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE completed = true)
  INTO total_goals, completed_goals
  FROM daily_goals
  WHERE daily_goals.plan_id = calculate_daily_progress.plan_id;
  
  RETURN CASE 
    WHEN total_goals = 0 THEN 0
    ELSE completed_goals::float / total_goals
  END;
END;
$$;

-- Create triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_daily_plans_updated_at
  BEFORE UPDATE ON daily_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_daily_goals_updated_at
  BEFORE UPDATE ON daily_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();