
ALTER TABLE public.scraped_inventory
  ADD COLUMN IF NOT EXISTS is_claimed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

-- Allow authenticated users to update the claim columns
CREATE POLICY "Authenticated users can claim permits"
  ON public.scraped_inventory
  FOR UPDATE
  TO authenticated
  USING (is_claimed = false)
  WITH CHECK (claimed_by = auth.uid());
