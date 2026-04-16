-- Run this in Supabase SQL Editor to add the invites table

CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'faculty_admin',
  faculty_id UUID REFERENCES faculties(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES profiles(id),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invites_token ON invites(token);
CREATE INDEX idx_invites_email ON invites(email);

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invites"
  ON invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('faculty_admin', 'uni_admin')
    )
  );

CREATE POLICY "Anyone can view invite by token"
  ON invites FOR SELECT
  USING (true);
