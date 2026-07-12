---
description: 
---

# Release Workflow

Use this workflow before deploying a version.

---

# Step 1: Code Quality

Run:

- Type checking.
- Linting.
- Tests.
- Build.

Verify:

✓ No TypeScript errors  
✓ No lint errors  
✓ Production build succeeds  

---

# Step 2: Database Review

Before release:

Check:

- Pending migrations.
- Migration safety.
- Data migrations.
- Index creation impact.

Never deploy breaking schema changes without migration planning.

---

# Step 3: Environment Review

Verify:

- Environment variables.
- Secrets.
- API keys.
- Third-party services.

Never commit secrets.

---

# Step 4: Security Review

Check:

- Authentication.
- Authorization.
- RLS policies.
- API permissions.
- Webhook verification.

---

# Step 5: Deployment

Deployment order:

1. Backup database.
2. Run migrations.
3. Deploy application.
4. Verify health.
5. Monitor errors.

---

# Step 6: Post Release

Verify:

- Authentication works.
- Critical flows work.
- Payments work.
- Background jobs work.
- Webhooks work.

Monitor:

- Errors.
- Performance.
- Logs.