-- Add friend_request to notification types
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('report_accepted', 'report_rejected', 'report_warning', 'comment_deleted', 'appeal_response', 'general', 'friend_request', 'system'));



