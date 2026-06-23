|-- Storage policies for invitations bucket (FIXED: Ownership check with published visibility)
CREATE POLICY "Users can upload invitation files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invitations' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own or published invitation files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'invitations'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text  -- Owner can view
    OR EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.cover_image_url = (storage.foldername(name))[1]
      AND i.is_published = true  -- Published can be viewed
    )
  )
);

CREATE POLICY "Users can delete own invitation files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'invitations' AND auth.uid()::text = (storage.foldername(name))[1]);

|-- Storage policies for music bucket (FIXED)
CREATE POLICY "Users can upload music files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own music files"
ON storage.objects FOR SELECT
USING (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own music files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);
