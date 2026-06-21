
-- Storage policies for invitations bucket
CREATE POLICY "Users can upload invitation files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invitations' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view invitation files"
ON storage.objects FOR SELECT
USING (bucket_id = 'invitations');

CREATE POLICY "Users can delete own invitation files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'invitations' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for music bucket
CREATE POLICY "Users can upload music files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view music files"
ON storage.objects FOR SELECT
USING (bucket_id = 'music');

CREATE POLICY "Users can delete own music files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);
