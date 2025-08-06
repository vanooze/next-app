DELIMITER $$

ALTER DEFINER=`zanie`@`%` EVENT `update_design_activity_status_daily` 
ON SCHEDULE EVERY 1 DAY STARTS '2025-06-19 02:00:00' 
ON COMPLETION NOT PRESERVE ENABLE 
COMMENT 'Daily update of design_activity status based on date conditions' 
DO BEGIN

    -- First update statuses
    UPDATE design_activity 
    SET 
        date_received = CASE WHEN date_received = '' THEN NULL ELSE date_received END,
        sir_me = CASE WHEN sir_me = '' THEN NULL ELSE sir_me END,
        sir_mjh = CASE WHEN sir_mjh = '' THEN NULL ELSE sir_mjh END,

        STATUS = CASE 
            WHEN sir_mjh IS NOT NULL THEN 'Finished'
            WHEN STATUS = 'Rush' THEN 'Rush'
            WHEN sir_mjh IS NULL AND (date_received IS NULL OR DATEDIFF(CURDATE(), date_received) >= 3) THEN 'Overdue'
            WHEN sir_mjh IS NULL AND DATEDIFF(CURDATE(), date_received) < 3 THEN 'Pending'
            ELSE STATUS
        END
    WHERE 
        (STATUS != 'Finished' AND STATUS != 'Rush');

    -- Then insert finished rows into sales_management if not already inserted
    INSERT INTO sales_management (client_name, proj_desc, date_received, sir_mjh, sales_personnel, status, deleted)
    SELECT 
        da.client_name,
        da.proj_desc,
        da.date_received,
        da.sir_mjh,
        da.sales_personnel,
        'Ongoing' AS status,
        0 AS deleted
    FROM design_activity da
    WHERE 
        da.sir_mjh IS NOT NULL
        AND da.status = 'Finished'
        AND NOT EXISTS (
            SELECT 1 FROM sales_management sm
            WHERE sm.client_name = da.client_name 
              AND sm.proj_desc = da.proj_desc 
              AND sm.date_received = da.date_received
        );

    -- Optional: return count of affected rows
    SELECT ROW_COUNT() AS records_inserted, NOW() AS insert_time;

END$$

DELIMITER ;
