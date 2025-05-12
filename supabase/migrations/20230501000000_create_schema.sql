-- Create extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum type for story categories
CREATE TYPE story_category AS ENUM ('Positive', 'Negative', 'Mixed');

-- Create enum type for interaction types
CREATE TYPE interaction_type AS ENUM ('like', 'dislike');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  anonymous_id TEXT NOT NULL UNIQUE
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  content TEXT NOT NULL,
  category story_category NOT NULL DEFAULT 'Mixed',
  likes INTEGER NOT NULL DEFAULT 0,
  dislikes INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id),
  designation TEXT
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Anonymous',
  likes INTEGER NOT NULL DEFAULT 0,
  dislikes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id)
);

-- Create user_interactions table to track likes and dislikes
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  interaction_type interaction_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT story_or_comment_check CHECK (
    (story_id IS NOT NULL AND comment_id IS NULL) OR
    (story_id IS NULL AND comment_id IS NOT NULL)
  ),
  CONSTRAINT unique_story_interaction UNIQUE (user_id, story_id, interaction_type),
  CONSTRAINT unique_comment_interaction UNIQUE (user_id, comment_id, interaction_type)
);

-- Create saved_stories table to track bookmarks
CREATE TABLE IF NOT EXISTS saved_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_saved_story UNIQUE (user_id, story_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS stories_user_id_idx ON stories(user_id);
CREATE INDEX IF NOT EXISTS stories_category_idx ON stories(category);
CREATE INDEX IF NOT EXISTS stories_created_at_idx ON stories(created_at);
CREATE INDEX IF NOT EXISTS comments_story_id_idx ON comments(story_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS user_interactions_user_id_idx ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS user_interactions_story_id_idx ON user_interactions(story_id);
CREATE INDEX IF NOT EXISTS user_interactions_comment_id_idx ON user_interactions(comment_id);
CREATE INDEX IF NOT EXISTS saved_stories_user_id_idx ON saved_stories(user_id);
CREATE INDEX IF NOT EXISTS saved_stories_story_id_idx ON saved_stories(story_id);

-- Create functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update timestamps
CREATE TRIGGER update_stories_updated_at
BEFORE UPDATE ON stories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create functions to update story counts
CREATE OR REPLACE FUNCTION update_story_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories SET comments_count = comments_count + 1 WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories SET comments_count = comments_count - 1 WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update story counts
CREATE TRIGGER update_story_comments_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_story_comments_count();

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_stories ENABLE ROW LEVEL SECURITY;

-- Users can read all stories
CREATE POLICY "Anyone can read stories"
  ON stories FOR SELECT
  USING (true);

-- Users can read all comments
CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  USING (true);

-- Users can only insert stories if authenticated
CREATE POLICY "Authenticated users can insert stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can only update their own stories
CREATE POLICY "Users can update their own stories"
  ON stories FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own stories
CREATE POLICY "Users can delete their own stories"
  ON stories FOR DELETE
  USING (auth.uid() = user_id);

-- Users can insert comments
CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can only update their own comments
CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Users can only see their own interactions
CREATE POLICY "Users can only see their own interactions"
  ON user_interactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own interactions
CREATE POLICY "Users can only insert their own interactions"
  ON user_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own interactions
CREATE POLICY "Users can only update their own interactions"
  ON user_interactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own interactions
CREATE POLICY "Users can only delete their own interactions"
  ON user_interactions FOR DELETE
  USING (auth.uid() = user_id);

-- Users can only see their own saved stories
CREATE POLICY "Users can only see their own saved stories"
  ON saved_stories FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own saved stories
CREATE POLICY "Users can only insert their own saved stories"
  ON saved_stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own saved stories
CREATE POLICY "Users can only delete their own saved stories"
  ON saved_stories FOR DELETE
  USING (auth.uid() = user_id);
