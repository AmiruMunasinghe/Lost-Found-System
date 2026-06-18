# Postman Testing - Item Management API

This folder contains Postman collections and environment configurations for testing the Lost-Found Item Management API.

## Files

### 1. **Lost-Found-Item-Management.postman_collection.json**
Comprehensive API collection with 59 test cases organized in 6 categories:
- **Item Creation** (2 tests) - Create LOST/FOUND items
- **Item Retrieval** (4 tests) - Get all items, by ID, by user, with pagination
- **Item Filtering & Search** (8 tests) - Filter by type, status, category, location, and search
- **Item Updates** (2 tests) - Update item status
- **Item Images** (1 test) - Add images to items
- **Item Deletion** (1 test) - Delete items

**Usage:**
1. Open Postman
2. Click **Import** → Select this file
3. Select the **Lost-Found Local Development** environment
4. Click **Send** on any request to test

### 2. **Lost-Found-LocalDev.postman_environment.json**
Environment configuration with pre-configured variables for local development:
- `baseUrl`: `http://localhost:8080`
- `itemId`: `1`
- `userId`: `1`
- `categoryName`: `Electronics`
- `location`: `Library`
- `searchTerm`: `keys`
- `reportType`: `LOST`
- `itemStatus`: `OPEN`

**Setup:**
1. Import this environment file into Postman
2. Select it from the environment dropdown before running requests

## Getting Started

### Prerequisites
- Postman installed (v10+)
- Backend service running on `http://localhost:8080`
- Database populated with test data

### Quick Start
1. Import both files into Postman
2. Select "Lost-Found Local Development" from environment dropdown
3. Navigate to any request folder and click **Send**
4. View responses in the Response panel

### Customizing Variables
To test with different data, edit variables in Postman:
1. Click the environment dropdown → **Edit**
2. Modify values as needed
3. Save changes

## Testing Tips

- **For LOST items**: Use `reportType: LOST`
- **For FOUND items**: Use `reportType: FOUND`
- **Valid ItemStatus values**: OPEN, MATCHED, CLAIMED, PENDING_REVIEW, AWAITING_PICKUP, SCHEDULED_FOR_AUCTION, SCHEDULED_FOR_DONATION, CLOSED
- **Category examples**: Electronics, Documents, Clothing, Accessories, Other
- **Location examples**: Library, Student Center, Cafeteria, Parking Lot, Classroom

## Common Issues

**Q: Getting 404 errors?**
- Ensure the backend service is running on port 8080
- Verify database has test data with matching IDs

**Q: Getting 400 errors on POST requests?**
- Check that all required fields are included in request body
- Validate JSON format is correct

**Q: Variable not substituting correctly?**
- Verify environment is selected in dropdown
- Check variable names are wrapped in `{{variableName}}`

## Related Documentation
- See [POSTMAN_TESTING_GUIDE.md](../POSTMAN_TESTING_GUIDE.md) for detailed testing workflows
- See [UNIT_TESTING_GUIDE.md](../UNIT_TESTING_GUIDE.md) for unit testing approach
