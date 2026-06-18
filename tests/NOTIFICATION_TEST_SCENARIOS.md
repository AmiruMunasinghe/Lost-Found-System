# Notification API Test Scenarios

This document outlines comprehensive test scenarios for validating the Notification API functionality using the provided test data.

## Table of Contents
1. [Setup Instructions](#setup-instructions)
2. [Test Scenario Groups](#test-scenario-groups)
3. [Individual Test Cases](#individual-test-cases)
4. [Validation Checklist](#validation-checklist)

---

## Setup Instructions

### Prerequisites
- PostgreSQL running and accessible
- Spring Boot backend running on `http://localhost:8080`
- Test data loaded using `test-data.sql`
- Postman installed (optional, for manual testing)

### Quick Setup
```bash
# Load test data
./tests/db/setup-test-data.sh load

# Verify data
./tests/db/setup-test-data.sh verify

# Start backend
cd backend
mvn spring-boot:run
```

---

## Test Scenario Groups

### Group 1: Notification Retrieval
Testing fetching notifications from the API.

### Group 2: Notification Creation
Testing sending new notifications through the API.

### Group 3: Read Status Management
Testing marking notifications as read/unread.

### Group 4: Filtering & Pagination
Testing filters, sorting, and pagination of notifications.

### Group 5: Notification Types
Testing all notification type variations.

### Group 6: Email Integration
Testing email channel notifications.

### Group 7: Data Integrity
Testing data consistency and relationships.

---

## Individual Test Cases

## GROUP 1: Notification Retrieval

### 1.1 Get All Notifications for a User
**Objective:** Retrieve all notifications for a specific user

**Test Data:**
- User ID: 1 (john_doe) - has 3 notifications
- User ID: 6 (emily_davis) - has 3 notifications

**Steps:**
1. Send GET request to `/api/notifications/users/1`
2. Verify response status is 200 OK
3. Verify response contains all 3 notifications for user 1

**Expected Result:**
- Status: 200 OK
- Response contains notifications sorted by `createdAt` (newest first)
- Includes mixed read/unread notifications
- Each notification has required fields: id, userId, type, title, message, isRead, channel, createdAt

**SQL Verification:**
```sql
SELECT * FROM notifications WHERE user_id = 1 ORDER BY created_at DESC;
```

---

### 1.2 Get Unread Notifications Only
**Objective:** Filter and retrieve only unread notifications

**Test Data:**
- User ID: 1 has 1 unread notification (id=1)
- User ID: 6 has 1 unread notification (id=8)

**Steps:**
1. Send GET request to `/api/notifications/users/1/unread`
2. Verify status is 200 OK
3. Verify response contains only unread notifications

**Expected Result:**
- Status: 200 OK
- Response contains only notifications where `isRead = false`
- Count matches unread notifications in database

**SQL Verification:**
```sql
SELECT COUNT(*) FROM notifications WHERE user_id = 1 AND is_read = false;
-- Expected: 1
```

---

### 1.3 Get Unread Count
**Objective:** Retrieve count of unread notifications without fetching full objects

**Test Data:**
- User ID: 1 has 1 unread notification
- User ID: 6 has 1 unread notification

**Steps:**
1. Send GET request to `/api/notifications/users/1/unread-count`
2. Verify status is 200 OK
3. Verify response contains count

**Expected Result:**
- Status: 200 OK
- Response format: `{"unreadCount": 1}`
- Count matches database

**SQL Verification:**
```sql
SELECT COUNT(*) FROM notifications WHERE user_id = 1 AND is_read = false;
```

---

### 1.4 Pagination Test
**Objective:** Test pagination with large number of notifications

**Test Data:**
- User 1 has 3 notifications (sufficient for pagination testing)

**Steps:**
1. Get all notifications (should support offset/limit parameters)
2. Verify pagination works correctly

**Expected Result:**
- Supports pagination parameters (if implemented)
- Returns results in correct order

---

## GROUP 2: Notification Creation

### 2.1 Send Item Match Notification
**Objective:** Create a new ITEM_MATCH notification

**Request:**
```json
{
  "userId": 1,
  "type": "ITEM_MATCH",
  "title": "Your Lost Item Has a Match!",
  "message": "Your Samsung Galaxy S21 has been matched with a found item.",
  "channel": "BOTH",
  "referenceItemId": 101,
  "recipientEmail": "john.doe@university.edu"
}
```

**Steps:**
1. Send POST request to `/api/notifications`
2. Verify status is 201 Created
3. Verify notification appears in database

**Expected Result:**
- Status: 201 Created
- Response contains created notification with assigned ID
- Database contains new notification record
- `isRead` defaults to false
- `createdAt` is set to current timestamp

**SQL Verification:**
```sql
SELECT * FROM notifications 
WHERE user_id = 1 AND type = 'ITEM_MATCH' 
ORDER BY created_at DESC LIMIT 1;
```

---

### 2.2 Send Reward Earned Notification
**Objective:** Create a REWARD_EARNED notification

**Request:**
```json
{
  "userId": 6,
  "type": "REWARD_EARNED",
  "title": "Congratulations! You Earned Points",
  "message": "You have earned 50 points for submitting a found item.",
  "channel": "IN_APP",
  "referenceItemId": 201,
  "recipientEmail": "emily.davis@university.edu"
}
```

**Steps:**
1. Send POST request to `/api/notifications`
2. Verify status is 201 Created

**Expected Result:**
- Status: 201 Created
- Notification type is REWARD_EARNED
- Channel is IN_APP

---

### 2.3 Send Email-Only Notification
**Objective:** Create notification sent only via email

**Request:**
```json
{
  "userId": 2,
  "type": "GENERAL",
  "title": "System Maintenance",
  "message": "System will be down for maintenance on Saturday.",
  "channel": "EMAIL",
  "recipientEmail": "jane.smith@university.edu"
}
```

**Steps:**
1. Send POST request to `/api/notifications`
2. Verify notification is created
3. Check if email would be sent (mock email service)

**Expected Result:**
- Status: 201 Created
- Channel is EMAIL
- Email service is triggered (verify in logs)

---

### 2.4 Send BOTH Channel Notification
**Objective:** Create notification sent via both channels

**Request:**
```json
{
  "userId": 3,
  "type": "ITEM_RETURNED",
  "title": "Your Item Has Been Returned",
  "message": "Your lost item is ready for pickup.",
  "channel": "BOTH",
  "referenceItemId": 105,
  "recipientEmail": "robert.wilson@university.edu"
}
```

**Steps:**
1. Send POST request with channel=BOTH
2. Verify both in-app record and email are triggered

**Expected Result:**
- Status: 201 Created
- Channel is BOTH
- Notification persisted in database
- Email service triggered

---

## GROUP 3: Read Status Management

### 3.1 Mark Single Notification as Read
**Objective:** Update a single notification to read status

**Test Data:**
- Notification ID: 1 (currently unread for user 1)

**Steps:**
1. Verify notification is unread: GET `/api/notifications/users/1/unread-count` → returns 1
2. Mark as read: PATCH `/api/notifications/1/read?userId=1`
3. Verify status is 200 OK or 204 No Content
4. Verify unread count decreased: GET `/api/notifications/users/1/unread-count` → returns 0

**Expected Result:**
- Status: 200 or 204
- Notification `isRead` changes to true
- `readAt` timestamp is set
- Notification no longer appears in unread list

**SQL Verification:**
```sql
SELECT id, is_read, read_at FROM notifications WHERE id = 1;
-- is_read should be true, read_at should be set
```

---

### 3.2 Mark All Notifications as Read
**Objective:** Update all notifications for a user to read status

**Test Data:**
- User ID: 1 has 1 unread notification

**Steps:**
1. Get unread count: GET `/api/notifications/users/1/unread-count` → should be > 0
2. Mark all as read: PATCH `/api/notifications/users/1/read-all`
3. Verify status is 204 No Content
4. Get unread count again: should be 0

**Expected Result:**
- Status: 204 No Content
- All user's notifications have `isRead = true`
- `readAt` timestamps are set for all
- Unread count returns 0

**SQL Verification:**
```sql
SELECT COUNT(*) FROM notifications 
WHERE user_id = 1 AND is_read = false;
-- Should return 0
```

---

### 3.3 Mark Non-existent Notification
**Objective:** Test error handling for invalid notification ID

**Steps:**
1. Send PATCH `/api/notifications/99999/read?userId=1`
2. Verify appropriate error response

**Expected Result:**
- Status: 404 Not Found or appropriate error
- Error message indicates notification not found

---

## GROUP 4: Filtering & Advanced Queries

### 4.1 Filter by Notification Type
**Objective:** Retrieve only notifications of specific type

**Test Data:**
- User 1 has notifications of type: ITEM_MATCH, ITEM_CLAIMED, ITEM_RETURNED

**Steps:**
1. Get all notifications for user 1
2. Verify response includes different types
3. Filter results by type (if API supports filtering)

**Expected Result:**
- Response includes multiple notification types
- Can identify and separate by type

**SQL Verification:**
```sql
SELECT type, COUNT(*) FROM notifications 
WHERE user_id = 1 
GROUP BY type;
```

---

### 4.2 Filter by Notification Channel
**Objective:** Test notifications filtered by channel

**Test Data:**
- User 6 has notifications with IN_APP, EMAIL, and BOTH channels

**Steps:**
1. Get all notifications for user 6
2. Verify different channels are present

**Expected Result:**
- Notifications include various channel types
- Can identify channel for each notification

---

### 4.3 Sort by Creation Date
**Objective:** Verify notifications are sorted by creation date

**Steps:**
1. Get all notifications for user 1
2. Verify they are sorted newest first (descending by createdAt)

**Expected Result:**
- Notifications returned in descending order by createdAt
- Most recent notifications appear first

---

## GROUP 5: Notification Types Coverage

### 5.1 ITEM_MATCH Notification
**Objective:** Test item matching scenario

**Preconditions:**
- Lost item exists (ID: 101)
- Found item exists (ID: 201)
- Match exists (ID: 1, confidence 95%)

**Steps:**
1. Send ITEM_MATCH notification for user 1
2. Verify notification is stored with correct type
3. Reference item ID should point to lost item

**Expected Result:**
- Type: ITEM_MATCH
- ReferenceItemId: 101
- Message contains match details

---

### 5.2 ITEM_CLAIMED Notification
**Objective:** Test item claim scenario

**Steps:**
1. Send ITEM_CLAIMED notification
2. Verify claim information is included

**Expected Result:**
- Type: ITEM_CLAIMED
- Includes pickup location/deadline

---

### 5.3 ITEM_RETURNED Notification
**Objective:** Test item return confirmation

**Steps:**
1. Send ITEM_RETURNED notification
2. Verify return confirmation is stored

**Expected Result:**
- Type: ITEM_RETURNED
- Contains return confirmation details

---

### 5.4 REWARD_EARNED Notification
**Objective:** Test reward point notifications

**Steps:**
1. Send REWARD_EARNED notification with point amount
2. Verify reward amount is captured

**Expected Result:**
- Type: REWARD_EARNED
- Message includes point amount
- Linked to reward ledger entry

---

### 5.5 REWARD_REDEEMED Notification
**Objective:** Test reward redemption notification

**Steps:**
1. Send REWARD_REDEEMED notification
2. Verify voucher code is included

**Expected Result:**
- Type: REWARD_REDEEMED
- Includes redemption code/details

---

### 5.6 GENERAL Notification
**Objective:** Test system announcement notifications

**Steps:**
1. Send GENERAL type notification
2. Verify it's accessible to intended users

**Expected Result:**
- Type: GENERAL
- No required referenceItemId
- Can be broadcast to multiple users

---

## GROUP 6: Email Integration

### 6.1 Email Sent with IN_APP + EMAIL Channel
**Objective:** Verify email is sent when channel includes EMAIL

**Test Data:**
- Channel: BOTH or EMAIL
- RecipientEmail provided

**Steps:**
1. Send notification with channel=BOTH
2. Check application logs for email sending
3. Verify notification is stored in database

**Expected Result:**
- Notification created in database
- Email service is called (verify in logs or mock)
- Email template is used correctly

---

### 6.2 No Email Sent with IN_APP Only
**Objective:** Verify email is NOT sent for IN_APP only

**Steps:**
1. Send notification with channel=IN_APP
2. Check logs that email service is NOT called

**Expected Result:**
- Notification created
- Email service NOT triggered
- No email sent

---

## GROUP 7: Data Integrity

### 7.1 Foreign Key Constraints
**Objective:** Verify referential integrity

**Steps:**
1. Try to create notification with non-existent userId
2. Verify error is thrown

**Expected Result:**
- Status: 400 Bad Request or 404 Not Found
- Error message indicates invalid user ID

---

### 7.2 Timestamp Handling
**Objective:** Verify timestamps are correctly set

**Steps:**
1. Create new notification
2. Check createdAt timestamp
3. Mark as read and verify readAt timestamp

**Expected Result:**
- createdAt is set to current time
- readAt is null until marked as read
- readAt is set when notification is marked as read

**SQL Verification:**
```sql
SELECT id, created_at, read_at FROM notifications 
WHERE user_id = 1 
ORDER BY created_at DESC;
```

---

### 7.3 Data Consistency
**Objective:** Verify data is consistent across tables

**Steps:**
1. Create notification with referenceItemId
2. Verify referenced item exists

**Expected Result:**
- All notifications can be joined with items table
- No orphaned references

---

## Validation Checklist

Use this checklist to validate all test scenarios:

### Notification Retrieval ✓
- [ ] GET all notifications returns 200 OK
- [ ] GET unread notifications filters correctly
- [ ] GET unread count returns accurate number
- [ ] Notifications sorted by createdAt (descending)
- [ ] Response includes all required fields

### Notification Creation ✓
- [ ] POST creates notification with 201 status
- [ ] New notification assigned unique ID
- [ ] All notification types can be created
- [ ] Default isRead value is false
- [ ] CreatedAt timestamp set correctly

### Read Status ✓
- [ ] PATCH marks single notification as read
- [ ] readAt timestamp set when marked read
- [ ] PATCH marks all notifications as read
- [ ] Unread count decreases after marking read
- [ ] Unread notifications excluded from unread list

### Notification Types ✓
- [ ] ITEM_MATCH notifications work correctly
- [ ] ITEM_CLAIMED notifications work correctly
- [ ] ITEM_RETURNED notifications work correctly
- [ ] REWARD_EARNED notifications work correctly
- [ ] REWARD_REDEEMED notifications work correctly
- [ ] GENERAL notifications work correctly

### Channels ✓
- [ ] IN_APP channel creates notification only
- [ ] EMAIL channel triggers email service
- [ ] BOTH channel creates notification AND sends email
- [ ] Email recipient must be provided for EMAIL channel

### Data Integrity ✓
- [ ] Foreign keys are enforced
- [ ] Timestamps are accurate
- [ ] References are consistent
- [ ] Transactions are atomic

### Error Handling ✓
- [ ] 404 for non-existent notification
- [ ] 400 for invalid parameters
- [ ] Appropriate error messages
- [ ] No data corruption on errors

---

## Quick Test Execution

### Using cURL
```bash
# Get unread count
curl http://localhost:8080/api/notifications/users/1/unread-count

# Get unread notifications
curl http://localhost:8080/api/notifications/users/1/unread

# Mark as read
curl -X PATCH "http://localhost:8080/api/notifications/1/read?userId=1"
```

### Using Postman
1. Import `notification-api-test.json`
2. Import environment `environment.json`
3. Run requests from Postman collection
4. Verify responses match expected results

---

## Test Data Reference

### Users
```
ID  | Username    | Email                      | Role
----|-------------|----------------------------|--------
1   | john_doe    | john.doe@university.edu    | Owner
2   | jane_smith  | jane.smith@university.edu  | Owner
3   | robert_wilson | robert.wilson@... | Owner
6   | emily_davis | emily.davis@university.edu | Finder
7   | david_miller | david.miller@university.edu | Finder
8   | lisa_anderson | lisa.anderson@university.edu | Finder
```

### Key Notification IDs
```
ID | User | Type           | Is Read
---|------|----------------|--------
1  | 1    | ITEM_MATCH     | false
2  | 1    | ITEM_MATCH     | true
8  | 6    | REWARD_EARNED  | false
```

---

## Notes

- Test data includes realistic scenarios with mixed read/unread statuses
- Notifications span multiple days to test sorting and filtering
- Email addresses follow university domain convention
- Item references maintain referential integrity
- All timestamps use server time for consistency

