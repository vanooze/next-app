DELIMITER $$

CREATE EVENT `newdashboard`.`pmo_activity_update_status_daily`
ON SCHEDULE EVERY 1 DAY STARTS '2025-06-19 02:00:00' 
ON COMPLETION NOT PRESERVE ENABLE 
COMMENT 'Daily update of pmo_activity status based on date_end and date_finished' 
DO
BEGIN
    UPDATE pmo_activity 
    SET 
        status = CASE
            WHEN date_finished IS NOT NULL THEN 'Finished'
            WHEN date_finished IS NULL AND date_end IS NOT NULL AND date_end < CURDATE() THEN 'Overdue'
            ELSE status
        END
    WHERE 
        status != 'Finished';

    SELECT ROW_COUNT() AS records_updated, NOW() AS update_time;
END$$

DELIMITER ;