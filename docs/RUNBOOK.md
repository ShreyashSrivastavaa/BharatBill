# BharatBill Operations Runbook

Operational procedures for maintaining, backing up, restoring, and troubleshooting BharatBill in production.

---

## 1. Database Backups

### Automated Nightly Backup Script
Run the following script via cron (`0 2 * * *`):

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/bharatbill"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="bharatbill_backup_${TIMESTAMP}.sql.gz"

mkdir -p $BACKUP_DIR
docker exec -t bharatbill-db pg_dump -U bharatbill bharatbill | gzip > "${BACKUP_DIR}/${FILENAME}"

# Retain backups for 30 days
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
```

### Database Restoration
To restore from a backup:
```bash
gunzip < /var/backups/bharatbill/bharatbill_backup_TIMESTAMP.sql.gz | docker exec -i bharatbill-db psql -U bharatbill -d bharatbill
```

---

## 2. Rotating Secrets

### Rotating JWT Secrets
1. Generate new 64-char secrets via `openssl rand -hex 32`.
2. Update `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in `.env.production`.
3. Restart backend service:
   ```bash
   docker compose -f docker-compose.prod.yml restart server
   ```
4. Note: Existing user sessions will be logged out and will need to log back in.

### Rotating Razorpay Webhook Secret
1. Generate new webhook secret in Razorpay Dashboard.
2. Update `RAZORPAY_WEBHOOK_SECRET` in `.env.production`.
3. Restart server container:
   ```bash
   docker compose -f docker-compose.prod.yml restart server
   ```

---

## 3. Disaster Recovery & Rollback

### Rolling Back a Deployment
If a newly deployed image has issues:
```bash
git checkout <PREVIOUS_COMMIT_TAG>
docker compose -f docker-compose.prod.yml up -d --build
```
