
CREATE TABLE public.retours_historique (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retour_id uuid NOT NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_email text
);

ALTER TABLE public.retours_historique ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view history"
ON public.retours_historique FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert history"
ON public.retours_historique FOR INSERT TO authenticated
WITH CHECK (true);

CREATE INDEX idx_retours_historique_retour_id ON public.retours_historique(retour_id);
