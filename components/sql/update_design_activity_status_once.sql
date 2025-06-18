DELIMITER $
CREATE EVENT IF NOT EXISTS update_design_activity_status_once
ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 1 MINUTE
ON COMPLETION DROP
DO
BEGIN
    UPDATE design_activity 
    SET 
        date_received = CASE WHEN date_received = '' THEN NULL ELSE date_received END,
        sir_me = CASE WHEN sir_me = '' THEN NULL ELSE sir_me END,
        sir_mjh = CASE WHEN sir_mjh = '' THEN NULL ELSE sir_mjh END,
        STATUS = CASE 
            WHEN sir_mjh IS NOT NULL AND sir_mjh != '' THEN 'Finished'
            WHEN STATUS = 'Rush' THEN 'Rush'
            WHEN date_received IS NULL OR date_received = '' OR DATEDIFF(CURDATE(), date_received) > 3 THEN 'Overdue'
            ELSE 'Pending'
        END;
        
    SELECT CONCAT('Updated ', ROW_COUNT(), ' records at ', NOW()) AS result;
END$
DELIMITER ;
