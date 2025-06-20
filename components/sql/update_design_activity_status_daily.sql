DELIMITER $$

ALTER DEFINER=`zanie`@`%` EVENT `update_design_activity_status_daily` 
ON SCHEDULE EVERY 1 DAY STARTS '2025-06-19 02:00:00' 
ON COMPLETION NOT PRESERVE ENABLE 
COMMENT 'Daily update of design_activity status based on date conditions' 
DO BEGIN

    UPDATE design_activity 
    SET 
        -- Convert empty strings to NULL
        date_received = CASE WHEN date_received = '' THEN NULL ELSE date_received END,
        sir_me = CASE WHEN sir_me = '' THEN NULL ELSE sir_me END,
        sir_mjh = CASE WHEN sir_mjh = '' THEN NULL ELSE sir_mjh END,

        -- Status logic
        STATUS = CASE 
            WHEN sir_mjh IS NOT NULL THEN 'Finished'
            WHEN STATUS = 'Rush' THEN 'Rush'
            WHEN sir_mjh IS NULL AND (date_received IS NULL OR DATEDIFF(CURDATE(), date_received) >= 3) THEN 'Overdue'
            WHEN sir_mjh IS NULL AND DATEDIFF(CURDATE(), date_received) < 3 THEN 'Pending'
            ELSE STATUS -- Keep current if no condition matches
        END
    WHERE 
        -- Only update if status is not Finished or Rush
        (STATUS != 'Finished' AND STATUS != 'Rush');

    SELECT ROW_COUNT() AS records_updated, NOW() AS update_time;

END$$

DELIMITER ;
