-- Create agreements table
CREATE TABLE agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agreement_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('investor', 'filmmaker')),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'cancelled')),
  pdf_url TEXT,
  hash_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create agreement_signatures table for audit trail
CREATE TABLE agreement_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agreement_id UUID REFERENCES agreements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  device_info TEXT,
  browser_info TEXT,
  os_info TEXT,
  otp_verified_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_signatures ENABLE ROW LEVEL SECURITY;

-- Agreements Policies
CREATE POLICY "Users can view their own agreements"
  ON agreements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agreements"
  ON agreements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agreements"
  ON agreements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all agreements"
  ON agreements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all agreements"
  ON agreements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Agreement Signatures Policies
CREATE POLICY "Users can view their own signatures"
  ON agreement_signatures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own signatures"
  ON agreement_signatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all signatures"
  ON agreement_signatures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create storage bucket for agreements
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agreements', 'agreements', false);

-- Storage Policies for 'agreements' bucket
CREATE POLICY "Users can view their own agreement PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'agreements' AND auth.uid() = owner);

CREATE POLICY "Users can upload their own agreement PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'agreements' AND auth.uid() = owner);

CREATE POLICY "Admins can view all agreement PDFs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'agreements' AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
