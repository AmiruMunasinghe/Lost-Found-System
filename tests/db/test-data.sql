-- ============================================================================
-- Lost and Found System - Test Data for Notification API Testing
-- ============================================================================
-- This script populates the database with realistic test data for testing
-- the notification API endpoints and functionality.
-- ============================================================================

-- ─── Insert Test Users ───────────────────────────────────────────────────

INSERT INTO users (id, username, email, created_at) VALUES
(1, 'john_doe', 'john.doe@university.edu', NOW()),
(2, 'jane_smith', 'jane.smith@university.edu', NOW()),
(3, 'robert_wilson', 'robert.wilson@university.edu', NOW()),
(4, 'sarah_johnson', 'sarah.johnson@university.edu', NOW()),
(5, 'michael_brown', 'michael.brown@university.edu', NOW()),
(6, 'emily_davis', 'emily.davis@university.edu', NOW()),
(7, 'david_miller', 'david.miller@university.edu', NOW()),
(8, 'lisa_anderson', 'lisa.anderson@university.edu', NOW());

-- ─── Insert Test Items (Lost Items) ──────────────────────────────────────

INSERT INTO items (id, user_id, title, description, category, location, report_type, status, created_at, updated_at) VALUES
(101, 1, 'Samsung Galaxy S21', 'Black smartphone with blue case, found near the library entrance', 'Electronics', 'Library Entrance', 'LOST', 'OPEN', NOW() - INTERVAL '5 days', NOW()),
(102, 1, 'Red Backpack', 'Red hiking backpack with laptop pocket, lost in the cafeteria', 'Accessories', 'Cafeteria', 'LOST', 'MATCHED', NOW() - INTERVAL '7 days', NOW()),
(103, 2, 'Airpods Pro', 'White Apple AirPods in charging case', 'Electronics', 'Student Center', 'LOST', 'MATCHED', NOW() - INTERVAL '3 days', NOW()),
(104, 2, 'MacBook Pro 14"', 'Silver MacBook Pro, last seen in computer lab', 'Electronics', 'Computer Lab', 'LOST', 'OPEN', NOW() - INTERVAL '2 days', NOW()),
(105, 3, 'Car Keys', 'Black and silver Hyundai car keys', 'Keys', 'Parking Lot B', 'LOST', 'CLAIMED', NOW() - INTERVAL '1 day', NOW()),
(106, 4, 'Student ID Card', 'University ID card with photo', 'Documents', 'Main Gate', 'LOST', 'OPEN', NOW() - INTERVAL '4 days', NOW()),
(107, 5, 'Gold Watch', 'Gold Rolex watch with leather band', 'Accessories', 'Gymnasium', 'LOST', 'OPEN', NOW() - INTERVAL '6 days', NOW());

-- ─── Insert Test Items (Found Items) ──────────────────────────────────────

INSERT INTO items (id, user_id, title, description, category, location, report_type, status, created_at, updated_at) VALUES
(201, 6, 'Samsung Galaxy S21', 'Black smartphone found with blue case', 'Electronics', 'Library Entrance', 'FOUND', 'MATCHED', NOW() - INTERVAL '5 days', NOW()),
(202, 6, 'Red Backpack', 'Red backpack with laptop pocket found in lost and found', 'Accessories', 'Lost and Found Office', 'FOUND', 'MATCHED', NOW() - INTERVAL '6 days', NOW()),
(203, 7, 'Airpods Pro', 'White AirPods in charging case found in student center', 'Electronics', 'Student Center', 'FOUND', 'MATCHED', NOW() - INTERVAL '3 days', NOW()),
(204, 7, 'Student ID Card', 'University ID card found near main gate', 'Documents', 'Main Gate', 'FOUND', 'OPEN', NOW() - INTERVAL '2 days', NOW()),
(205, 8, 'Car Keys', 'Black and silver car keys found in parking lot', 'Keys', 'Parking Lot B', 'FOUND', 'CLAIMED', NOW() - INTERVAL '1 day', NOW()),
(206, 8, 'Blue Umbrella', 'Blue umbrella with white polka dots', 'Accessories', 'Main Entrance', 'FOUND', 'OPEN', NOW() - INTERVAL '10 days', NOW()),
(207, 6, 'Brown Leather Wallet', 'Brown leather wallet with several cards', 'Accessories', 'Cafeteria', 'FOUND', 'OPEN', NOW() - INTERVAL '8 days', NOW());

-- ─── Insert Test Item Matches ──────────────────────────────────────────────

INSERT INTO item_matches (id, lost_item_id, found_item_id, confidence_score, status, created_at, updated_at) VALUES
(1, 101, 201, 0.95, 'SUGGESTED', NOW() - INTERVAL '5 days', NOW()),
(2, 102, 202, 0.87, 'ACCEPTED', NOW() - INTERVAL '6 days', NOW()),
(3, 103, 203, 0.92, 'ACCEPTED', NOW() - INTERVAL '3 days', NOW()),
(4, 105, 205, 0.98, 'ACCEPTED', NOW() - INTERVAL '1 day', NOW()),
(5, 106, 204, 0.89, 'SUGGESTED', NOW() - INTERVAL '2 days', NOW());

-- ─── Insert Test Notifications ──────────────────────────────────────────────

-- Notification Type: ITEM_MATCH (user 1 - lost item matched)
INSERT INTO notifications (id, user_id, type, title, message, is_read, channel, reference_item_id, created_at, read_at) VALUES
(1, 1, 'ITEM_MATCH', 'Your Lost Item Has a Match!', 'Your Samsung Galaxy S21 has been matched with a found item. The confidence score is 95%. Please review and accept or reject the match.', false, 'IN_APP', 101, NOW() - INTERVAL '5 days', NULL),
(2, 1, 'ITEM_MATCH', 'Match Update: Red Backpack', 'Your Red Backpack has been matched with a found item (87% confidence). Click to review details.', true, 'IN_APP', 102, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days'),
(3, 1, 'ITEM_MATCH', 'High Confidence Match', 'Samsung Galaxy S21 is highly likely to be your lost item. A match has been suggested.', true, 'BOTH', 101, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days');

-- Notification Type: ITEM_MATCH (user 2 - lost items)
INSERT INTO notifications (id, user_id, type, title, message, is_read, channel, reference_item_id, created_at, read_at) VALUES
(4, 2, 'ITEM_MATCH', 'Airpods Match Found', 'Your Airpods Pro has been matched with a found item (92% confidence).', false, 'IN_APP', 103, NOW() - INTERVAL '3 days', NULL),
(5, 2, 'ITEM_MATCH', 'MacBook Pro Search Update', 'No matches found yet for your MacBook Pro. We continue to search.', true, 'EMAIL', 104, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day');

-- Notification Type: ITEM_CLAIMED (user 1)
INSERT INTO notifications (id, user_id, type, title, message, is_read, channel, reference_item_id, created_at, read_at) VALUES
(6, 1, 'ITEM_CLAIMED', 'Your Lost Item Has Been Claimed!', 'Your Red Backpack has been successfully claimed and is ready for pickup at the Lost and Found Office. Please collect it within 7 days.', true, 'BOTH', 102, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days');

-- Notification Type: ITEM_CLAIMED (user 3)
INSERT INTO notifications (id, user_id, type, title, message, is_read, channel, reference_item_id, created_at, read_at) VALUES
(7, 3, 'ITEM_CLAIMED', 'Car Keys Claimed', 'Your Car Keys have been claimed and ready for pickup at the Lost and Found Office.', true, 'IN_APP', 105, NOW() - INTERVAL '1 day', NOW());

-- Notification Type: REWARD_EARNED (user 6 - finder rewards)
INSERT INTO notifications (id, user_id, type, title, message, is_read, channel, reference_item_id, created_at, read_at) VALUES
(8, 6, 'REWARD_EARNED', 'Congratulations! You Earned Reward Points', 'You have earned 50 points for reporting the Samsung Galaxy S21 as a found item.', false, 'IN_APP', 201, NOW() - INTERVAL '5 days', NULL),
(9, 6, 'REWARD_EARNED', 'Reward Points Added', 'You have earned 40 points for reporting the Red Backpack.', true, 'IN_APP', 202, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days'),
(10, 6, 'REWARD_EARNED', 'Finder Rewards', 'You have earned 35 points for your item submission.', true, 'BOTH', 201, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days');

-- Notification Type: REWARD_EARNED (user 7)
INSERT INTO notifications (id, user_id, type, title, message, is_read, channel, reference_item_id, created_at, read_at) VALUES
(11, 7, 'REWARD_EARNED', 'Reward Points Earned', 'You have earned 50 points for reporting the Airpods Pro.', false, 'IN_APP', 203, NOW() - INTERVAL '3 days', NULL);

-- Notification Type: REWARD_REDEEMED
INSERT INTO notifications (id, user_id, type, title, message, is_read, channel, reference_item_id, created_at, read_at) VALUES
(12, 6, 'REWARD_REDEEMED', 'Reward Points Redeemed', 'You have redeemed 100 points for a $10 voucher. Your voucher code is: REWARD2024X1.', true, 'BOTH', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
(13, 8, 'REWARD_REDEEMED', 'Redemption Successful', 'You have successfully redeemed 50 points.', false, 'IN_APP', NULL, NOW() - INTERVAL '1 day', NULL);

-- Notification Type: ITEM_RETURNED
INSERT INTO notifications (id, user_id, type, title, message, is_read, channel, reference_item_id, created_at, read_at) VALUES
(14, 1, 'ITEM_RETURNED', 'Item Successfully Returned', 'Your Red Backpack has been returned to you. Thank you for using the Lost and Found System.', true, 'BOTH', 102, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
(15, 3, 'ITEM_RETURNED', 'Car Keys Returned', 'Your Car Keys have been successfully returned. Thank you!', true, 'IN_APP', 105, NOW() - INTERVAL '1 day', NOW());

-- Notification Type: GENERAL (system announcements)
INSERT INTO notifications (id, user_id, type, title, message, is_read, channel, reference_item_id, created_at, read_at) VALUES
(16, 1, 'GENERAL', 'System Maintenance Notice', 'The Lost and Found System will undergo maintenance on Saturday from 10 PM to 2 AM.', true, 'EMAIL', NULL, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days'),
(17, 2, 'GENERAL', 'Lost and Found Office Hours', 'The Lost and Found Office is now open from 9 AM to 5 PM, Monday to Friday.', false, 'IN_APP', NULL, NOW() - INTERVAL '10 days', NULL),
(18, 4, 'GENERAL', 'Important Security Update', 'A security update has been deployed. Please note the new verification process for claimed items.', false, 'BOTH', NULL, NOW() - INTERVAL '3 days', NULL),
(19, 5, 'GENERAL', 'Campus Lost and Found Policy Update', 'Items unclaimed after 30 days will be scheduled for donation or auction.', true, 'EMAIL', NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days');

-- ─── Insert Test Reward Ledger Entries ──────────────────────────────────────

-- Rewards for user 6 (finder - submitted items)
INSERT INTO reward_ledger (id, user_id, points, transaction_type, description, reference_id, created_at) VALUES
(1, 6, 50, 'CREDIT', 'Found item submission: Samsung Galaxy S21', 201, NOW() - INTERVAL '5 days'),
(2, 6, 40, 'CREDIT', 'Found item submission: Red Backpack', 202, NOW() - INTERVAL '6 days'),
(3, 6, 35, 'CREDIT', 'Found item submission: Brown Leather Wallet', 207, NOW() - INTERVAL '8 days');

-- Reward redemption for user 6
INSERT INTO reward_ledger (id, user_id, points, transaction_type, description, reference_id, created_at) VALUES
(4, 6, -100, 'DEBIT', 'Reward redemption: $10 voucher', 6, NOW() - INTERVAL '2 days');

-- Rewards for user 7 (finder)
INSERT INTO reward_ledger (id, user_id, points, transaction_type, description, reference_id, created_at) VALUES
(5, 7, 50, 'CREDIT', 'Found item submission: Airpods Pro', 203, NOW() - INTERVAL '3 days'),
(6, 7, 30, 'CREDIT', 'Found item submission: Student ID Card', 204, NOW() - INTERVAL '2 days');

-- Rewards for user 8 (finder)
INSERT INTO reward_ledger (id, user_id, points, transaction_type, description, reference_id, created_at) VALUES
(7, 8, 45, 'CREDIT', 'Found item submission: Car Keys', 205, NOW() - INTERVAL '1 day'),
(8, 8, 25, 'CREDIT', 'Found item submission: Blue Umbrella', 206, NOW() - INTERVAL '10 days');

-- Reward redemption for user 8
INSERT INTO reward_ledger (id, user_id, points, transaction_type, description, reference_id, created_at) VALUES
(9, 8, -50, 'DEBIT', 'Reward redemption: $5 voucher', 8, NOW() - INTERVAL '1 day');

-- Bonus reward for user 1 (owner of returned item)
INSERT INTO reward_ledger (id, user_id, points, transaction_type, description, reference_id, created_at) VALUES
(10, 1, 25, 'CREDIT', 'Item successfully returned and claimed', 102, NOW() - INTERVAL '5 days');

-- ─── Summary of Test Data ───────────────────────────────────────────────
-- Users: 8 test users (IDs: 1-8)
-- Items (Lost): 7 items (IDs: 101-107)
-- Items (Found): 7 items (IDs: 201-207)
-- Matches: 5 item matches (IDs: 1-5)
-- Notifications: 19 notifications covering all types
--   - ITEM_MATCH: 5 notifications
--   - ITEM_CLAIMED: 2 notifications
--   - ITEM_RETURNED: 2 notifications
--   - REWARD_EARNED: 4 notifications
--   - REWARD_REDEEMED: 2 notifications
--   - GENERAL: 4 notifications
-- Reward Ledger: 10 transaction entries
--
-- Test Scenarios Covered:
-- 1. User receives match notification for their lost item
-- 2. User receives notification when their item is claimed
-- 3. Finder receives reward points for submitted items
-- 4. User receives notification when item is returned
-- 5. Mixed notification channels (IN_APP, EMAIL, BOTH)
-- 6. Read and unread notifications
-- 7. Multiple notifications per user
-- ============================================================================
