-- Add policy to allow profile creation during signup
CREATE POLICY "Allow profile creation during signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Add policy to allow wallet creation during signup  
CREATE POLICY "Allow wallet creation during signup"
ON public.wallets
FOR INSERT 
WITH CHECK (true);