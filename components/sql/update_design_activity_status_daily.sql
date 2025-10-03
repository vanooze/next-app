DELIMITER $$

ALTER DEFINER=`zanie`@`%` EVENT `update_design_activity_status_daily`
ON SCHEDULE EVERY 1 DAY
STARTS '2025-06-19 02:00:00'
ON COMPLETION NOT PRESERVE
ENABLE
COMMENT 'Daily update of design_activity status'
DO
BEGIN
    -- Normalize empty strings to NULL
    UPDATE design_activity
    SET 
        date_received = CASE WHEN date_received = '' THEN NULL ELSE date_received END,
        sir_me = CASE WHEN sir_me = '' THEN NULL ELSE sir_me END,
        sir_mjh = CASE WHEN sir_mjh = '' THEN NULL ELSE sir_mjh END;

    -- Main status update
    UPDATE design_activity
    SET STATUS = CASE
        WHEN sir_mjh IS NOT NULL THEN 'Finished'
        WHEN STATUS IN ('OnHold', 'Priority') THEN STATUS
        WHEN sir_mjh IS NULL AND date_received IS NOT NULL AND DATEDIFF(CURDATE(), date_received) >= 3 THEN 'Overdue'
        WHEN sir_mjh IS NULL AND date_received IS NOT NULL AND DATEDIFF(CURDATE(), date_received) < 3 THEN 'Pending'
        ELSE STATUS
    END;

    -- Cleanup / double-check: if sir_mjh is still NULL, enforce 3-day rule
    UPDATE design_activity
    SET STATUS = CASE
        WHEN date_received IS NOT NULL AND DATEDIFF(CURDATE(), date_received) >= 3 THEN 'Overdue'
        WHEN date_received IS NOT NULL AND DATEDIFF(CURDATE(), date_received) < 3 THEN 'Pending'
        ELSE STATUS
    END
    WHERE sir_mjh IS NULL
      AND STATUS NOT IN ('OnHold', 'Priority');
END$$

DELIMITER ;