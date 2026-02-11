-- Documents table for transparency section
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL, -- URL to PDF or other document file
  file_name VARCHAR(255) NOT NULL, -- Original filename
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('constitution', 'bylaws', 'financial', 'meeting-minutes', 'policies', 'general')),
  published BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  hidden_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_published ON documents(published) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_order ON documents(order_index) WHERE deleted_at IS NULL;














