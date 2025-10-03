DELIMITER $$

ALTER DEFINER=`zanie`@`%` EVENT `update_awarded_management_hourly`
ON SCHEDULE EVERY 1 HOUR
STARTS '2025-01-01 01:30:00'
ON COMPLETION NOT PRESERVE
ENABLE
DO
BEGIN
    -- Insert new awarded tasks into awarded_management
    INSERT INTO awarded_management (sales_id, client_name, proj_desc, date_received, sir_mjh,date_awarded)
    SELECT sm.id, sm.client_name, sm.proj_desc, sm.date_received, sm.sir_mjh, sm.date_awarded
    FROM sales_management sm
    WHERE sm.status = 'Awarded'
      AND NOT EXISTS (
          SELECT 1
          FROM awarded_management am
          WHERE am.sales_id = sm.id
      );

    -- Cleanup: remove awarded rows if no longer valid
    DELETE am
    FROM awarded_management am
    LEFT JOIN sales_management sm ON am.sales_id = sm.id
    WHERE sm.status <> 'Awarded' OR sm.id IS NULL;
END$$

DELIMITER ;
