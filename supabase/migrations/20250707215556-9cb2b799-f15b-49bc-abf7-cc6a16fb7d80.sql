-- Add RLS policies for otp_codes table to allow service role access
CREATE POLICY "Service role can manage OTP codes" 
ON public.otp_codes 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Grant necessary permissions to service role
GRANT ALL ON public.otp_codes TO service_role;