-- Add heat_score to scraped_inventory so permit scoring persists
-- Previously computed only client-side on every render
ALTER TABLE public.scraped_inventory
  ADD COLUMN IF NOT EXISTS heat_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS heat_tier TEXT DEFAULT 'standard'
    CHECK (heat_tier IN ('elite', 'high', 'medium', 'standard'));

-- Index for fast filtering by tier (Elite Opportunities card)
CREATE INDEX IF NOT EXISTS idx_permits_heat_score
  ON public.scraped_inventory (heat_score DESC, heat_tier);

-- Back-fill existing rows using the same scoring logic as the edge function
-- Value scoring + elite ZIP codes
UPDATE public.scraped_inventory SET
  heat_score = LEAST(
    40
    + CASE
        WHEN estimated_value >= 250000 THEN 40
        WHEN estimated_value >= 100000 THEN 30
        WHEN estimated_value >= 50000  THEN 20
        WHEN estimated_value > 0       THEN 10
        ELSE 0
      END
    + CASE WHEN zip_code IN ('90210','33139','78701','33109','78703','77005','85253','92037') THEN 15 ELSE 0 END
    + CASE WHEN LOWER(project_type) IN ('solar','hvac','roofing','remodel') THEN 5 ELSE 0 END,
  100),
  heat_tier = CASE
    WHEN LEAST(
      40
      + CASE
          WHEN estimated_value >= 250000 THEN 40
          WHEN estimated_value >= 100000 THEN 30
          WHEN estimated_value >= 50000  THEN 20
          WHEN estimated_value > 0       THEN 10
          ELSE 0
        END
      + CASE WHEN zip_code IN ('90210','33139','78701','33109','78703','77005','85253','92037') THEN 15 ELSE 0 END
      + CASE WHEN LOWER(project_type) IN ('solar','hvac','roofing','remodel') THEN 5 ELSE 0 END,
    100) >= 80 THEN 'elite'
    WHEN LEAST(
      40
      + CASE
          WHEN estimated_value >= 250000 THEN 40
          WHEN estimated_value >= 100000 THEN 30
          WHEN estimated_value >= 50000  THEN 20
          WHEN estimated_value > 0       THEN 10
          ELSE 0
        END
      + CASE WHEN zip_code IN ('90210','33139','78701','33109','78703','77005','85253','92037') THEN 15 ELSE 0 END
      + CASE WHEN LOWER(project_type) IN ('solar','hvac','roofing','remodel') THEN 5 ELSE 0 END,
    100) >= 60 THEN 'high'
    WHEN LEAST(
      40
      + CASE
          WHEN estimated_value >= 250000 THEN 40
          WHEN estimated_value >= 100000 THEN 30
          WHEN estimated_value >= 50000  THEN 20
          WHEN estimated_value > 0       THEN 10
          ELSE 0
        END
      + CASE WHEN zip_code IN ('90210','33139','78701','33109','78703','77005','85253','92037') THEN 15 ELSE 0 END
      + CASE WHEN LOWER(project_type) IN ('solar','hvac','roofing','remodel') THEN 5 ELSE 0 END,
    100) >= 45 THEN 'medium'
    ELSE 'standard'
  END;
