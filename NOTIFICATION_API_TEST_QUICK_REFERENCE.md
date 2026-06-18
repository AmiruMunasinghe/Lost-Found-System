# Notification API Test Data - Quick Reference

## Files Created

| File | Purpose |
|------|---------|
| `tests/db/test-data.sql` | SQL script to populate database with test data |
| `tests/db/README.md` | Comprehensive documentation for test data |
| `tests/db/setup-test-data.sh` | Interactive setup script for quick initialization |
| `tests/postman/notification-api-test.json` | Postman collection with API requests |
| `tests/postman/environment.json` | Postman environment with variables |
| `tests/NOTIFICATION_TEST_SCENARIOS.md` | Detailed test scenarios and validation checklist |

## Quick Start

### 1. Load Test Data
```bash
cd /Users/nethsandukumarasinghe/Lost-Found-System

# Option A: Interactive script
./tests/db/setup-test-data.sh

# Option B: Direct SQL
psql -U postgres -d lostfound_db -f tests/db/test-data.sql
```

### 2. Verify Data Loaded
```bash
# Check user count
psql -U postgres -d lostfound_db -c "SELECT COUNT(*) as users FROM users;"

# Check notification count
psql -U postgres -d lostfound_db -c "SELECT COUNT(*) as notifications FROM notifications;"
```

### 3. Start Backend
```bash
cd backend
mvn spring-boot:run
```

### 4. Test API
```bash
# Option A: Using cURL
curl http://localhost:8080/api/notifications/users/1

# Option B: Using Postman
# Import tests/postman/notification-api-test.json and environment.json
```

## Test Data Summary

### Database Records
| Entity | Count | IDs |
|--------|-------|-----|
| Users | 8 | 1-8 |
| Items | 14 | 101-107 (lost), 201-207 (found) |
| Matches | 5 | 1-5 |
| Notifications | 19 | 1-19 |
| Reward Ledger | 10 | 1-10 |

### Notification Distribution
| Type | Count | Details |
|------|-------|---------|
| ITEM_MATCH | 5 | High confidence matches |
| ITEM_CLAIMED | 2 | Claimed items |
| ITEM_RETURNED | 2 | Returned items |
| REWARD_EARNED | 4 | Points earned by finders |
| REWARD_REDEEMED | 2 | Points redeemed |
| GENERAL | 4 | System announcements |

### Channel Distribution
| Channel | Count |
|---------|-------|
| IN_APP | 8 |
| EMAIL | 5 |
| BOTH | 6 |

### Read Status
| Status | Count |
|--------|-------|
| Unread | 7 |
| Read | 12 |

## Key Test Users

### Lost Item Owners (Will Receive Notifications)
- **User 1**: john_doe (3 notifications)
- **User 2**: jane_smith (2 notifications)
- **User 3**: robert_wilson (1 notification)
- **User 4**: sarah_johnson (1 notification)
- **User 5**: michael_brown (0 notifications)

### Item Finders (Will Earn Rewards)
- **User 6**: emily_davis (3 notifications)
- **User 7**: david_miller (1 notification)
- **User 8**: lisa_anderson (2 notifications)

## API Endpoints

### GET - Retrieve Notifications
```
GET /api/notifications/users/{userId}
GET /api/notifications/users/{userId}/unread
GET /api/notifications/users/{userId}/unread-count
```

### POST - Send Notification
```
POST /api/notifications
Content-Type: application/json

{
  "userId": 1,
  "type": "ITEM_MATCH|ITEM_CLAIMED|ITEM_RETURNED|REWARD_EARNED|REWARD_REDEEMED|GENERAL",
  "title": "Notification Title",
  "message": "Notification Message",
  "channel": "IN_APP|EMAIL|BOTH",
  "referenceItemId": 101,
  "recipientEmail": "user@university.edu"
}
```

### PATCH - Update Read Status
```
PATCH /api/notifications/{notificationId}/read?userId={userId}
PATCH /api/notifications/users/{userId}/read-all
```

## Common cURL Commands

### Get All Notifications
```bash
curl http://localhost:8080/api/notifications/users/1
```

### Get Unread Notifications
```bash
curl http://localhost:8080/api/notifications/users/1/unread
```

### Get Unread Count
```bash
curl http://localhost:8080/api/notifications/users/1/unread-count
```

### Mark as Read
```bash
curl -X PATCH "http://localhost:8080/api/notifications/1/read?userId=1"
```

### Mark All as Read
```bash
curl -X PATCH http://localhost:8080/api/notifications/users/1/read-all
```

### Send New Notification
```bash
curl -X POST http://localhost:8080/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "type": "ITEM_MATCH",
    "title": "Match Found!",
    "message": "Your lost item has been matched.",
    "channel": "BOTH",
    "referenceItemId": 101,
    "recipientEmail": "john.doe@university.edu"
  }'
```

## Common SQL Queries

### Check Data Population
```sql
-- Count each table
SELECT COUNT(*) as users FROM users;
SELECT COUNT(*) as items FROM items;
SELECT COUNT(*) as notifications FROM notifications;
SELECT COUNT(*) as matches FROM item_matches;

-- View all data
SELECT * FROM users LIMIT 10;
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
```

### Verify Notifications
```sql
-- Get unread count per user
SELECT user_id, COUNT(*) as unread FROM notifications 
WHERE is_read = false 
GROUP BY user_id;

-- Get notifications by type
SELECT type, COUNT(*) FROM notifications GROUP BY type;

-- Check notification channels
SELECT channel, COUNT(*) FROM notifications GROUP BY channel;
```

### Test-Specific Queries
```sql
-- User 1's notifications
SELECT id, type, is_read FROM notifications WHERE user_id = 1;

-- Unread notifications for user 6
SELECT * FROM notifications WHERE user_id = 6 AND is_read = false;

-- Item matches with confidence scores
SELECT * FROM item_matches ORDER BY confidence_score DESC;
```

## Cleanup

### Remove Test Data
```bash
# Using interactive script
./tests/db/setup-test-data.sh clean

# Using SQL
psql -U postgres -d lostfound_db << EOF
DELETE FROM reward_ledger;
DELETE FROM notifications;
DELETE FROM item_matches;
DELETE FROM item_images;
DELETE FROM items;
DELETE FROM users;
EOF
```

## Troubleshooting

### Issue: Database Connection Failed
```
Solution: Check PostgreSQL is running
sudo systemctl start postgresql
psql -U postgres -d lostfound_db
```

### Issue: Foreign Key Constraint Error
```
Solution: Load data in correct order (users → items → matches → notifications)
All provided in test-data.sql in correct order
```

### Issue: Postman Request Returns 404
```
Solution: Verify backend is running on port 8080
lsof -i :8080
```

### Issue: Data Not Showing After Load
```
Solution: Verify transaction was committed
SELECT COUNT(*) FROM notifications;
```

## Additional Resources

- **Full Documentation**: See `tests/db/README.md`
- **Test Scenarios**: See `tests/NOTIFICATION_TEST_SCENARIOS.md`
- **Setup Script**: `tests/db/setup-test-data.sh`
- **Postman Collection**: `tests/postman/notification-api-test.json`
- **Environment**: `tests/postman/environment.json`

## Example Test Flow

### Complete End-to-End Test

1. **Load test data**
   ```bash
   ./tests/db/setup-test-data.sh load
   ```

2. **Get unread count**
   ```bash
   curl http://localhost:8080/api/notifications/users/1/unread-count
   # Expect: {"unreadCount": 1}
   ```

3. **Fetch unread notifications**
   ```bash
   curl http://localhost:8080/api/notifications/users/1/unread
   # Expect: Array of 1 unread notification
   ```

4. **Mark as read**
   ```bash
   curl -X PATCH "http://localhost:8080/api/notifications/1/read?userId=1"
   # Expect: 200 OK
   ```

5. **Verify it's read**
   ```bash
   curl http://localhost:8080/api/notifications/users/1/unread-count
   # Expect: {"unreadCount": 0}
   ```

6. **Send new notification**
   ```bash
   curl -X POST http://localhost:8080/api/notifications \
     -H "Content-Type: application/json" \
     -d '{"userId":1,"type":"GENERAL","title":"Test","message":"Test message","channel":"IN_APP"}'
   # Expect: 201 Created
   ```

7. **Verify new notification exists**
   ```bash
   curl http://localhost:8080/api/notifications/users/1
   # Expect: Array includes new notification
   ```

## Performance Notes

- Test data includes 19 notifications across 8 users for testing pagination and filtering
- Timestamps span 10 days to test sorting and date-based queries
- Mixed read/unread status (7 unread, 12 read) for filtering validation
- 10 reward ledger entries for testing reward-related notifications

## Version Info

- **Created**: 2024-01-15
- **Test Data Version**: 1.0
- **Schema Version**: 1.0
- **API Version**: v1 (implied by /api/notifications paths)

