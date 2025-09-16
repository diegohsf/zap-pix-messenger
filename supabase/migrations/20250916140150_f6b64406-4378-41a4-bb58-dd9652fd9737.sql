-- Add scheduling fields to messages table
ALTER TABLE public.messages 
ADD COLUMN scheduled_for TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_scheduled BOOLEAN DEFAULT FALSE,
ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient querying of scheduled messages
CREATE INDEX idx_messages_scheduled ON public.messages(scheduled_for, is_scheduled, status) 
WHERE is_scheduled = true AND status = 'scheduled';