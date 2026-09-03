-- Fix infinite recursion in profiles RLS policies.
-- The original "profiles_read_admin" / "profiles_admin_all" policies queried the
-- profiles table from inside a policy defined ON profiles, causing:
--   ERROR: infinite recursion detected in policy for relation "profiles"
--
-- Solution: move the admin check into a SECURITY DEFINER function that bypasses
-- RLS, so evaluating the policy no longer re-triggers the policy.

-- 1. Helper function (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "profiles_read_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- 3. Recreate them using the non-recursive helper
CREATE POLICY "profiles_read_admin" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Note: "profiles_read_own" (auth.uid() = id) from the original migration remains
-- and is non-recursive, so users can always read their own profile.
