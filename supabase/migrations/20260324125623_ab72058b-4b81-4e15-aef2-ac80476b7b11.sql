
CREATE TABLE public.receptionnistes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.receptionnistes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view receptionnistes"
  ON public.receptionnistes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can insert receptionnistes"
  ON public.receptionnistes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete receptionnistes"
  ON public.receptionnistes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
