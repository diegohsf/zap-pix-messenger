-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to messages (since this is a public service)
CREATE POLICY "Allow public access to messages" 
ON public.messages 
FOR ALL 
USING (true)
WITH CHECK (true);