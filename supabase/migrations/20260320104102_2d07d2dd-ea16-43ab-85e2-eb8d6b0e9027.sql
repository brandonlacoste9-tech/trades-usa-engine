
CREATE POLICY "Public can book appointments"
  ON public.appointments
  FOR INSERT
  TO anon
  WITH CHECK (true);
