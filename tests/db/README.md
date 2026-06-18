# Notification API Test Data

## Overview
This directory contains comprehensive test data for testing the Lost and Found System's Notification API. The test data includes realistic scenarios for all notification types and channels.

## Files

### 1. `test-data.sql`
SQL script that populates your PostgreSQL database with realistic test data.

**Contents:**
- **8 Test Users** (IDs: 1-8)
  - john_doe, jane_smith, robert_wilson, sarah_johnson, michael_brown, emily_davis, david_miller, lisa_anderson
  
- **14 Test Items**
  - 7 Lost Items (IDs: 101-107): Samsung Galaxy S21, Red Backpack, Airpods Pro, MacBook Pro, Car Keys, Student ID, Gold Watch
  - 7 Found Items (IDs: 201-207): Matching items plus additional found items
  
- **5 Item Matches** (IDs: 1-5)
  - Links between lost and found items with confidence scores (87%-98%)
  
- **19 Test Notifications** covering all types:
  - **ITEM_MATCH** (5 notifications): Users receive notifications when their lost items are matched
  - **ITEM_CLAIMED** (2 notifications): Users are notified when their items are claimed
  - **ITEM_RETURNED** (2 notifications): Confirmation when items are returned
  - **REWARD_EARNED** (4 notifications): Finders receive points for submissions
  - **REWARD_REDEEMED** (2 notifications): Points redemption confirmations
  - **GENERAL** (4 notifications): System announcements
  
- **10 Reward Ledger Entries**
  - Credit transactions for item submissions
  - Debit transactions for point redemptions

**Notification Channels Covered:**
- IN_APP: Notifications shown in the application
- EMAIL: Email notifications
- BOTH: Both in-app and email notifications

**Read/Unread Mix:**
- Some notifications marked as read (testing read_at timestamps)
- Some marked as unread (testing filtering)

### 2. `notification-api-test.json`
Postman collection with ready-to-use API requests for testing the Notification API endpoints.

**Requests Included:**

#### POST Requests (Create Notifications)
1. **Send Notification - Item Match**
   - Endpoint: `POST /api/notifications`
   - Scenario: Notify user about a matched lost item
   - Channel: BOTH
   
2. **Send Notification - Item Claimed**
   - Endpoint: `POST /api/notifications`
   - Scenario: Notify user their lost item is claimed
   - Channel: BOTH
   
3. **Send Notification - Reward Earned**
   - Endpoint: `POST /api/notifications`
   - Scenario: Notify finder of earned points
   - Channel: IN_APP
   
4. **Send Notification - Reward Redeemed**
   - Endpoint: `POST /api/notifications`
   - Scenario: Confirm reward point redemption
   - Channel: BOTH
   
5. **Send Notification - Item Returned**
   - Endpoint: `POST /api/notifications`
   - Scenario: Confirm item return to owner
   - Channel: BOTH
   
6. **Send Notification - General Announcement**
   - Endpoint: `POST /api/notifications`
   - Scenario: System-wide announcement
   - Channel: EMAIL

#### GET Requests (Retrieve Notifications)
7. **Get All Notifications for User**
   - Endpoint: `GET /api/notifications/users/{userId}`
   - Example: `/api/notifications/users/1`
   - Returns: All notifications for the user (newest first)
   
8. **Get Unread Notifications for User**
   - Endpoint: `GET /api/notifications/users/{userId}/unread`
   - Example: `/api/notifications/users/1/unread`
   - Returns: Only unread notifications
   
9. **Get Unread Count for User**
   - Endpoint: `GET /api/notifications/users/{userId}/unread-count`
   - Example: `/api/notifications/users/1/unread-count`
   - Returns: Count of unread notifications

#### PATCH Requests (Update Notifications)
10. **Mark Notification as Read**
    - Endpoint: `PATCH /api/notifications/{notificationId}/read?userId={userId}`
    - Example: `PATCH /api/notifications/1/read?userId=1`
    - Updates: Marks specific notification as read
    
11. **Mark All Notifications as Read**
    - Endpoint: `PATCH /api/notifications/users/{userId}/read-all`
    - Example: `PATCH /api/notifications/users/1/read-all`
    - Updates: Marks all user notifications as read

## How to Use

### Using the SQL Test Data

#### Prerequisites
- PostgreSQL database running
- Database schema already created (using `schema.sql`)
- Connection credentials configured

#### Option 1: Direct SQL Execution
```bash
# Connect to your database
psql -U your_user -d your_database -h localhost

# Execute the SQL script
\i tests/db/test-data.sql

# Verify data was inserted
SELECT COUNT(*) FROM notifications;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM item_matches;
```

#### Option 2: Using Spring Boot Application
The data can be loaded via Spring Boot's initialization:
1. Place `test-data.sql` in `backend/src/main/resources/db/`
2. Rename to `data.sql`
3. Configure in `application.properties`:
   ```properties
   spring.sql.init.mode=always
   spring.jpa.hibernate.ddl-auto=validate
   ```

### Using the Postman Collection

#### Prerequisites
- Postman installed (or Newman for CLI testing)
- Backend server running (localhost:8080)
- Database populated with test data

#### Import the Collection
1. Open Postman
2. Click "Import" → Select `notification-api-test.json`
3. Collection will be imported with all requests

#### Run Test Requests
1. **Send Notifications**: Use POST requests to create new notifications
2. **Query Notifications**: Use GET requests to retrieve by user/status
3. **Update Status**: Use PATCH requests to mark notifications as read

#### Test Scenarios

**Scenario 1: Item Match Notification**
```
1. POST "Send Notification - Item Match" (userId: 1)
2. GET "Get All Notifications for User" (userId: 1)
3. Verify notification appears in list
```

**Scenario 2: Reward Earning Flow**
```
1. POST "Send Notification - Reward Earned" (userId: 6)
2. GET "Get Unread Notifications for User" (userId: 6)
3. GET "Get Unread Count for User" (userId: 6)
4. PATCH "Mark Notification as Read"
5. GET "Get Unread Count" again - should be reduced
```

**Scenario 3: Mark All as Read**
```
1. GET "Get Unread Count for User" (userId: 1) - note count
2. PATCH "Mark All Notifications as Read" (userId: 1)
3. GET "Get Unread Count" - should be 0
```

## Test Data Summary

### User IDs and Test Roles
| User ID | Username | Email | Role |
|---------|----------|-------|------|
| 1 | john_doe | john.doe@university.edu | Lost Item Owner |
| 2 | jane_smith | jane.smith@university.edu | Lost Item Owner |
| 3 | robert_wilson | robert.wilson@university.edu | Lost Item Owner |
| 4 | sarah_johnson | sarah.johnson@university.edu | Lost Item Owner |
| 5 | michael_brown | michael.brown@university.edu | Lost Item Owner |
| 6 | emily_davis | emily.davis@university.edu | Item Finder |
| 7 | david_miller | david.miller@university.edu | Item Finder |
| 8 | lisa_anderson | lisa.anderson@university.edu | Item Finder |

### Notification Types Coverage
- ✅ ITEM_MATCH: 5 test cases
- ✅ ITEM_CLAIMED: 2 test cases
- ✅ ITEM_RETURNED: 2 test cases
- ✅ REWARD_EARNED: 4 test cases
- ✅ REWARD_REDEEMED: 2 test cases
- ✅ GENERAL: 4 test cases

### Notification Channels Coverage
- ✅ IN_APP: 8 test notifications
- ✅ EMAIL: 5 test notifications
- ✅ BOTH: 6 test notifications

### Read Status Coverage
- ✅ Unread: 7 notifications (testing unread queries)
- ✅ Read: 12 notifications (testing read filtering)

## Testing Tips

### 1. Verify Database Content
```sql
-- Check all notifications
SELECT id, user_id, type, is_read, created_at FROM notifications ORDER BY created_at DESC;

-- Check unread count per user
SELECT user_id, COUNT(*) as unread_count FROM notifications WHERE is_read = false GROUP BY user_id;

-- Check specific user's notifications
SELECT * FROM notifications WHERE user_id = 1 ORDER BY created_at DESC;
```

### 2. Test with Different User IDs
- Change the `userId` parameter in requests to test different users
- User 1-5 have mostly received notifications (as lost item owners)
- User 6-8 have mostly earned reward notifications (as finders)

### 3. Performance Testing
The database has enough data to test:
- Pagination of large notification lists
- Filtering by read status
- Sorting by creation date
- Unread count aggregation

### 4. Notification Lifecycle Testing
Use the test data to verify the complete notification lifecycle:
```
1. Create notification (POST request)
2. Retrieve unread (GET /users/{id}/unread)
3. Mark as read (PATCH /read)
4. Verify it no longer appears in unread list
```

## Cleanup

To reset the database and remove test data:

```bash
# Delete test data (keep schema)
DELETE FROM reward_ledger;
DELETE FROM notifications;
DELETE FROM item_matches;
DELETE FROM item_images;
DELETE FROM items;
DELETE FROM users;

# Reset sequences (PostgreSQL)
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE items_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
```

## Extending the Test Data

To add more test data:

1. **Add more users**: Insert into `users` table with sequential IDs
2. **Add more items**: Create lost/found item pairs
3. **Create matches**: Add entries to `item_matches`
4. **Add notifications**: Use POST requests or INSERT directly into database

### Example: Adding a New Test Case
```sql
-- Add new user
INSERT INTO users (id, username, email, created_at) VALUES
(9, 'new_user', 'new@university.edu', NOW());

-- Add lost item
INSERT INTO items (user_id, title, description, category, location, report_type, status, created_at, updated_at) VALUES
(9, 'Test Item', 'A test item', 'Electronics', 'Test Location', 'LOST', 'OPEN', NOW(), NOW());

-- Add notification for that user
INSERT INTO notifications (user_id, type, title, message, is_read, channel, created_at) VALUES
(9, 'ITEM_MATCH', 'Test Match', 'This is a test notification', false, 'IN_APP', NOW());
```

## Troubleshooting

### Issue: Foreign Key Constraint Violation
- **Cause**: Referenced user IDs don't exist
- **Solution**: Ensure users are inserted first (they are in the script)

### Issue: Notifications Not Showing
- **Cause**: User ID doesn't exist or data wasn't committed
- **Solution**: Run `SELECT * FROM users;` to verify users exist, check transaction status

### Issue: Duplicate Key Error
- **Cause**: Running the script twice without cleanup
- **Solution**: Run cleanup queries above, then re-run script

### Issue: Postman Request Failing
- **Cause**: Backend server not running or using different port
- **Solution**: Update the base URL in Postman requests to match your server address

## Contact & Support

For issues with the test data or API testing, please refer to the main project README and backend API documentation.
