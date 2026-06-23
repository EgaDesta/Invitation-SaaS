# 🔍 QC Audit Report - Invitation-SaaS

**Date:** June 23, 2026  
**Auditor:** Senior QC Engineer (AI)  
**Scope:** Security, Scalability, Code Quality  
**Branch:** dev

---

## 📊 Executive Summary

| Category | Score | Status |
|----------|-------|--------|
| **Security** | 6.5/10 | ⚠️ NEEDS ATTENTION |
| **Scalability** | 5/10 | ❌ CRITICAL ISSUES |
| **Code Quality** | 7/10 | ⚠️ MODERATE ISSUES |

**Overall:** 6.2/10 - **NOT PRODUCTION READY** without fixes

---

## 🚨 CRITICAL ISSUES (Must Fix Before Production)

### 1. [SECURITY] No Quota Enforcement - CRITICAL
**File:** `src/pages/CreateInvitation.tsx`  
**Issue:** Subscription quota is NOT enforced before creating invitations

```typescript
// CURRENT (WRONG): Invitation created FIRST, quota logged AFTER
const { error } = await supabase.from("invitations").insert({...}); // ← Created!
// ... then later:
await supabase.from("usage_logs").update({ invitation_count: existing.invitation_count + 1 });
```

**Risk:** Users can create unlimited invitations regardless of subscription plan  
**Impact:** Revenue loss, database bloat, unfair resource usage  
**Fix:** Check quota BEFORE insert, reject if exceeded

```typescript
// RECOMMENDED:
const { data: subscription } = await supabase
  .from("subscriptions")
  .select("*, subscription_plans(weekly_quota)")
  .eq("user_id", user.id)
  .eq("status", "active")
  .maybeSingle();

const { data: usage } = await supabase
  .from("usage_logs")
  .select("invitation_count")
  .eq("user_id", user.id)
  .eq("week_start", weekStart)
  .maybeSingle();

const currentUsage = usage?.invitation_count || 0;
const quota = subscription?.subscription_plans?.weekly_quota || 0;

if (currentUsage >= quota) {
  toast.error("Quota exceeded! Upgrade your plan.");
  return;
}
```

---

### 2. [SECURITY] RSVP Guest Update Without Authentication - HIGH
**File:** `src/pages/InvitationView.tsx` line 187-204  
**Issue:** Any user can update ANY guest's RSVP by name matching

```typescript
// CURRENT: No token validation, name-based matching
const { data: existingGuest } = await supabase.from("guests")
  .select("*").eq("invitation_id", invitation.id).eq("name", rsvpName.trim()).maybeSingle();

if (existingGuest) {
  await supabase.from("guests").update({...}).eq("id", existingGuest.id);
}
```

**Risk:** 
- Malicious users can change other guests' RSVP status
- Spam attacks on guest lists
- Data integrity compromised

**Fix:** Require `unique_token` for RSVP updates (token already exists in schema!)

```typescript
// RECOMMENDED: Use unique_token from URL params
const { token } = useParams(); // ?token=abc123

const { data: guest } = await supabase.from("guests")
  .select("*")
  .eq("invitation_id", invitation.id)
  .eq("unique_token", token)  // ← Token validation
  .maybeSingle();

if (!guest) {
  toast.error("Invalid guest token");
  return;
}
```

---

### 3. [SECURITY] Storage Bucket Overly Permissive - MEDIUM
**File:** `supabase/migrations/20260227014140_41c1e2f2-3248-4711-a063-9bcc379af9dd.sql`  
**Issue:** Anyone can view ALL files in storage buckets

```sql
CREATE POLICY "Anyone can view invitation files"
ON storage.objects FOR SELECT
USING (bucket_id = 'invitations');  -- ← No ownership check
```

**Risk:** 
- Private invitations accessible via direct URL
- User data exposure
- No audit trail for file access

**Fix:** Restrict to owner or published invitations only

```sql
-- Only owner or published can view
CREATE POLICY "Users can view own or published files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'invitations' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text  -- Owner
    OR EXISTS (
      SELECT 1 FROM public.invitations i 
      WHERE i.cover_image_url = storage.objects.name 
      AND i.is_published = true
    )
  )
);
```

---

### 4. [SCALABILITY] No Rate Limiting - HIGH
**Issue:** No rate limiting on any endpoint  
**Risk:** 
- DDoS vulnerability
- API abuse (spam RSVP, mass invitation creation)
- Supabase quota exhaustion

**Fix:** Implement rate limiting at edge function level or use Supabase rate limiting

---

### 5. [SCALABILITY] N+1 Query Pattern - MEDIUM
**File:** Multiple pages  
**Issue:** Sequential queries instead of batch operations

```typescript
// CURRENT: Multiple round trips
const { data: subscription } = await supabase.from("subscriptions").select(...);
const { data: usage } = await supabase.from("usage_logs").select(...);
const { data: plans } = await supabase.from("subscription_plans").select(...);
```

**Fix:** Use parallel queries or RPC functions

```typescript
// RECOMMENDED: Parallel with Promise.all
const [subscription, usage, plans] = await Promise.all([
  supabase.from("subscriptions").select(...),
  supabase.from("usage_logs").select(...),
  supabase.from("subscription_plans").select(...)
]);
```

---

## ⚠️ MODERATE ISSUES (Should Fix)

### 6. [SECURITY] Admin Role Check Race Condition
**File:** `src/lib/auth.tsx` line 43  
**Issue:** `setTimeout(..., 0)` creates race condition for admin check

```typescript
if (session?.user) {
  setTimeout(() => checkAdminRole(session.user.id), 0);  // ← Async gap
}
```

**Risk:** UI may render before admin status is confirmed  
**Fix:** Use async/await properly, show loading state

---

### 7. [SECURITY] No Input Sanitization on Guest Names
**File:** `src/pages/GuestManager.tsx`, `InvitationView.tsx`  
**Issue:** User input stored without sanitization  
**Risk:** XSS if rendered with `dangerouslySetInnerHTML` (currently not, but future risk)  
**Fix:** Add validation middleware, sanitize on input

---

### 8. [SCALABILITY] No Database Indexes on Common Queries
**File:** Database schema  
**Issue:** Missing composite indexes for frequently queried columns

```sql
-- ADD THESE:
CREATE INDEX idx_guests_invitation_token ON guests(invitation_id, unique_token);
CREATE INDEX idx_invitations_user_published ON invitations(user_id, is_published);
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);
```

---

### 9. [CODE QUALITY] Large Component Files
| File | Lines | Recommendation |
|------|-------|----------------|
| `InvitationView.tsx` | 693 | Split into sub-components (Cover, Countdown, RSVP, Gallery, Wishes) |
| `Landing.tsx` | 554 | Extract sections to components |
| `TemplateBuilder.tsx` | 533 | Already using tabs, but could extract each tab |
| `CreateInvitation.tsx` | 421 | Split form steps into wizard components |

---

### 10. [CODE QUALITY] Missing Error Boundaries
**File:** `src/components/ErrorBoundary.tsx` exists but not used consistently  
**Issue:** Unhandled errors crash entire app  
**Fix:** Wrap all route components with ErrorBoundary

---

### 11. [SCALABILITY] No Caching Strategy
**Issue:** Every page load fetches from database  
**Recommendation:**
- Implement React Query or SWR for client-side caching
- Add Supabase query caching
- Consider edge caching for public invitations

---

### 12. [SECURITY] No Payment Gateway Integration
**Issue:** Transactions table exists but no actual payment processing  
**Risk:** Users can manually insert "success" transactions  
**Fix:** 
- Integrate Midtrans/Xendit webhook verification
- Add signature validation
- Never trust client-side payment status

---

## ✅ GOOD PRACTICES (Keep These)

1. ✅ **RLS Policies** - Row Level Security enabled on all tables
2. ✅ **TypeScript** - Type safety throughout codebase
3. ✅ **No dangerouslySetInnerHTML** - No direct DOM manipulation
4. ✅ **Supabase Auth** - Using official auth provider
5. ✅ **Environment Variables** - Config via .env.example
6. ✅ **Slug-based URLs** - Clean URLs for invitations
7. ✅ **unique_token for Guests** - Already in schema (just not used!)

---

## 📋 RECOMMENDED FIX PRIORITY

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| **P0** | Quota enforcement | Low | High |
| **P0** | RSVP token validation | Low | High |
| **P1** | Storage bucket policies | Medium | High |
| **P1** | Rate limiting | Medium | High |
| **P1** | Payment gateway integration | High | Critical |
| **P2** | Database indexes | Low | Medium |
| **P2** | Component splitting | Medium | Medium |
| **P2** | Caching strategy | Medium | Medium |
| **P3** | Error boundary coverage | Low | Low |
| **P3** | Input sanitization | Low | Low |

---

## 🎯 ACTION ITEMS

### Immediate (Before Merge to Main)
- [ ] Add quota check before invitation creation
- [ ] Implement RSVP token validation
- [ ] Fix storage bucket policies
- [ ] Add composite database indexes

### Short Term (Within 2 Weeks)
- [ ] Integrate payment gateway (Midtrans/Xendit)
- [ ] Implement rate limiting
- [ ] Split large components
- [ ] Add comprehensive error boundaries

### Long Term (Within 1 Month)
- [ ] Implement caching strategy (React Query/SWR)
- [ ] Add monitoring/analytics
- [ ] Set up CI/CD with security scanning
- [ ] Load testing for 1000+ concurrent users

---

## 📈 SCALABILITY ASSESSMENT

**Current Capacity Estimate:**
- Users: ~100-500 concurrent (before issues hit)
- Invitations: Unlimited (due to missing quota enforcement) ⚠️
- Database: Well-structured, needs indexes
- Storage: Properly configured with user folders

**After Fixes:**
- Users: ~5,000-10,000 concurrent
- Invitations: Controlled by subscription tiers
- Database: Optimized with proper indexes
- Storage: Secure with ownership validation

---

## 🔐 SECURITY CHECKLIST

- [x] RLS enabled on all tables
- [x] No SQL injection vectors (using Supabase client)
- [x] No XSS via dangerouslySetInnerHTML
- [ ] Rate limiting (MISSING)
- [ ] Payment verification (MISSING)
- [ ] Input validation (PARTIAL)
- [ ] Audit logging (PARTIAL - payment_logs exists)
- [ ] CSRF protection (handled by Supabase)
- [ ] Secure file upload validation (PARTIAL)

---

**Report Generated:** June 23, 2026  
**Next Review:** After P0 and P1 items completed
