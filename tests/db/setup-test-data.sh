#!/bin/bash
# ============================================================================
# Quick Setup Script for Notification API Test Data
# ============================================================================
# This script helps you quickly populate your database with test data
# and provides commands for common testing tasks.
# ============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration (update these with your values)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-lostfound_db}
DB_USER=${DB_USER:-postgres}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to print colored output
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Function to check if database exists
check_database() {
    print_info "Checking database connection..."
    
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "\q" 2>/dev/null; then
        print_success "Database connection successful"
        return 0
    else
        print_error "Cannot connect to database"
        print_info "Make sure PostgreSQL is running and credentials are correct:"
        print_info "  Host: $DB_HOST"
        print_info "  Port: $DB_PORT"
        print_info "  User: $DB_USER"
        print_info "  Database: $DB_NAME"
        return 1
    fi
}

# Function to load test data
load_test_data() {
    print_header "Loading Test Data"
    
    if [ ! -f "$SCRIPT_DIR/test-data.sql" ]; then
        print_error "test-data.sql not found in $SCRIPT_DIR"
        return 1
    fi
    
    print_info "Loading test data from $SCRIPT_DIR/test-data.sql..."
    
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/test-data.sql" > /dev/null 2>&1; then
        print_success "Test data loaded successfully!"
        verify_data_loaded
        return 0
    else
        print_error "Failed to load test data"
        return 1
    fi
}

# Function to verify data is loaded
verify_data_loaded() {
    print_info "Verifying data..."
    
    USERS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users;" | xargs)
    ITEMS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM items;" | xargs)
    NOTIFICATIONS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM notifications;" | xargs)
    MATCHES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM item_matches;" | xargs)
    
    echo ""
    echo -e "${GREEN}Data Summary:${NC}"
    echo "  Users:         $USERS"
    echo "  Items:         $ITEMS"
    echo "  Notifications: $NOTIFICATIONS"
    echo "  Matches:       $MATCHES"
    echo ""
}

# Function to clean up test data
cleanup_test_data() {
    print_header "Cleaning Up Test Data"
    
    read -p "$(echo -e ${YELLOW}Are you sure you want to delete all test data? [y/N]${NC} )" -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deleting test data..."
        
        CLEANUP_SQL="
        DELETE FROM reward_ledger;
        DELETE FROM notifications;
        DELETE FROM item_matches;
        DELETE FROM item_images;
        DELETE FROM items;
        DELETE FROM users;
        ALTER SEQUENCE users_id_seq RESTART WITH 1;
        ALTER SEQUENCE items_id_seq RESTART WITH 1;
        ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
        ALTER SEQUENCE item_matches_id_seq RESTART WITH 1;
        ALTER SEQUENCE item_images_id_seq RESTART WITH 1;
        ALTER SEQUENCE reward_ledger_id_seq RESTART WITH 1;
        "
        
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "$CLEANUP_SQL" > /dev/null 2>&1; then
            print_success "Test data cleaned up successfully!"
            verify_data_loaded
        else
            print_error "Failed to clean up test data"
            return 1
        fi
    else
        print_info "Cleanup cancelled"
    fi
}

# Function to show quick API test commands
show_api_tests() {
    print_header "Common API Test Commands"
    
    cat << 'EOF'

Using cURL:

1. Get all notifications for user 1:
   curl http://localhost:8080/api/notifications/users/1

2. Get unread notifications for user 1:
   curl http://localhost:8080/api/notifications/users/1/unread

3. Get unread count for user 1:
   curl http://localhost:8080/api/notifications/users/1/unread-count

4. Mark notification 1 as read:
   curl -X PATCH "http://localhost:8080/api/notifications/1/read?userId=1"

5. Mark all notifications as read for user 1:
   curl -X PATCH http://localhost:8080/api/notifications/users/1/read-all

6. Send a new item match notification:
   curl -X POST http://localhost:8080/api/notifications \
     -H "Content-Type: application/json" \
     -d '{
       "userId": 1,
       "type": "ITEM_MATCH",
       "title": "Your Lost Item Has a Match!",
       "message": "Your item has been matched with a found item.",
       "channel": "BOTH",
       "referenceItemId": 101,
       "recipientEmail": "john.doe@university.edu"
     }'

Using Postman:
- Import the file: tests/postman/notification-api-test.json
- Run requests directly from Postman UI

EOF
}

# Function to show test data summary
show_summary() {
    print_header "Test Data Summary"
    
    cat << 'EOF'

Users:
- john_doe (ID: 1) - Lost item owner with 3 notifications
- jane_smith (ID: 2) - Lost item owner with 2 notifications
- robert_wilson (ID: 3) - Lost item owner
- sarah_johnson (ID: 4) - Lost item owner
- michael_brown (ID: 5) - Lost item owner
- emily_davis (ID: 6) - Item finder with rewards
- david_miller (ID: 7) - Item finder with rewards
- lisa_anderson (ID: 8) - Item finder with rewards

Notification Types:
✓ ITEM_MATCH (5)     - Item matching notifications
✓ ITEM_CLAIMED (2)   - Item claimed notifications
✓ ITEM_RETURNED (2)  - Item returned notifications
✓ REWARD_EARNED (4)  - Reward point earned notifications
✓ REWARD_REDEEMED (2) - Reward redemption notifications
✓ GENERAL (4)        - System announcements

Channels:
✓ IN_APP (8)   - In-application notifications
✓ EMAIL (5)    - Email notifications
✓ BOTH (6)     - Both channels

Read Status:
✓ Unread (7)  - For testing unread queries
✓ Read (12)   - For testing read status filtering

EOF
}

# Main menu
show_menu() {
    echo ""
    echo "What would you like to do?"
    echo ""
    echo "1) Load test data into database"
    echo "2) Verify data is loaded"
    echo "3) Clean up test data"
    echo "4) Show API test examples"
    echo "5) Show test data summary"
    echo "6) Exit"
    echo ""
    read -p "Enter your choice [1-6]: " choice
    
    case $choice in
        1)
            check_database && load_test_data
            ;;
        2)
            check_database && verify_data_loaded
            ;;
        3)
            check_database && cleanup_test_data
            ;;
        4)
            show_api_tests
            ;;
        5)
            show_summary
            ;;
        6)
            print_success "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
}

# Main execution
main() {
    print_header "Lost & Found System - Notification API Test Setup"
    
    print_info "Database Configuration:"
    echo "  Host: $DB_HOST:$DB_PORT"
    echo "  User: $DB_USER"
    echo "  Database: $DB_NAME"
    echo ""
    
    # Check if running in interactive mode
    if [ $# -eq 0 ]; then
        # Interactive mode
        while true; do
            show_menu
        done
    else
        # Command line mode
        case "$1" in
            load)
                check_database && load_test_data
                ;;
            verify)
                check_database && verify_data_loaded
                ;;
            clean)
                check_database && cleanup_test_data
                ;;
            summary)
                show_summary
                ;;
            help)
                show_api_tests
                ;;
            *)
                echo "Usage: $0 [load|verify|clean|summary|help]"
                echo ""
                echo "Commands:"
                echo "  load    - Load test data into database"
                echo "  verify  - Verify data is loaded"
                echo "  clean   - Clean up test data"
                echo "  summary - Show test data summary"
                echo "  help    - Show API test examples"
                ;;
        esac
    fi
}

# Run main function
main "$@"
