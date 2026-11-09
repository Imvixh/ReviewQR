-- Remove anonymous execution of an owner-scoped analytics function.
-- The original migration revokes PUBLIC but the configured project still
-- allowed the anon role to execute this RPC.
REVOKE EXECUTE ON FUNCTION public.get_owner_qr_analytics() FROM anon;
