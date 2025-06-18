SET GLOBAL event_scheduler = ON;

-- Create the event to run daily at 2:00 AM
DELIMITER $
CREATE EVENT IF NOT EXISTS update_design_activity_status_daily
ON SCHEDULE EVERY 1 DAY
STARTS CONCAT(CURDATE() + INTERVAL 1 DAY, ' 02:00:00')
COMMENT 'Daily update of design_activity status based on date conditions'
DO
BEGIN
    -- Update status based on the same logic as your triggers
    UPDATE design_activity 
    SET 
        -- Handle empty strings by converting to NULL
        date_received = CASE WHEN date_received = '' THEN NULL ELSE date_received END,
        sir_me = CASE WHEN sir_me = '' THEN NULL ELSE sir_me END,
        sir_mjh = CASE WHEN sir_mjh = '' THEN NULL ELSE sir_mjh END,
        
        -- Update status based on priority conditions
        STATUS = CASE 
            -- 1. If sir_mjh has a date value → status = 'Finished' (highest priority)
            WHEN sir_mjh IS NOT NULL AND sir_mjh != '' THEN 'Finished'
            
            -- 2. If status = 'Rush' → Keep 'Rush' status (bypasses date-based automation)
            WHEN STATUS = 'Rush' THEN 'Rush'
            
            -- 3. If date_received > 3 days or is NULL → status = 'Overdue'
            WHEN date_received IS NULL OR date_received = '' OR DATEDIFF(CURDATE(), date_received) > 3 THEN 'Overdue'
            
            -- 4. If date_received ≤ 3 days → status = 'Pending'
            ELSE 'Pending'
        END
    WHERE 
        -- Only update records that need updating (optimization)
        (sir_mjh IS NOT NULL AND sir_mjh != '' AND STATUS != 'Finished')
        OR 
        (sir_mjh IS NULL AND STATUS != 'Rush' AND STATUS != 'Overdue' AND (date_received IS NULL OR date_received = '' OR DATEDIFF(CURDATE(), date_received) > 3))
        OR 
        (sir_mjh IS NULL AND STATUS != 'Rush' AND STATUS != 'Pending' AND date_received IS NOT NULL AND date_received != '' AND DATEDIFF(CURDATE(), date_received) <= 3);
        
    -- Optional: Log how many records were updated
    SELECT ROW_COUNT() AS records_updated, NOW() AS update_time;
END$
DELIMITER ;