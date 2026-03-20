
-- The leads INSERT policy with WITH CHECK (true) is intentional for public lead capture.
-- Add admin-only insert for scraped_inventory
CREATE POLICY "Admins can insert permits" ON public.scraped_inventory FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
