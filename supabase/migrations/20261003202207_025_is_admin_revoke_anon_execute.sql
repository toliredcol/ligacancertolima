/*
# Limit who can call the admin check helper

1. Change
   `public.is_admin()` is only evaluated by policies scoped to the
   `authenticated` role, so EXECUTE is revoked from the anonymous role. This
   removes an unnecessary anonymous RPC entry point without affecting any policy.

2. Notes
   1. Idempotent and non-destructive.
*/

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
