-- Add parent_id to prompt_history to support versioning/forking
ALTER TABLE prompt_history
ADD COLUMN parent_id UUID REFERENCES prompt_history(id);

-- Add index for performance when querying versions
CREATE INDEX idx_prompt_history_parent_id ON prompt_history(parent_id);
