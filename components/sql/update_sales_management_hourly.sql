DELIMITER $$

ALTER DEFINER=`zanie`@`%` EVENT `update_sales_management_hourly`
ON SCHEDULE EVERY 1 HOUR
STARTS '2025-01-01 01:00:00'
ON COMPLETION NOT PRESERVE
ENABLE
DO
BEGIN
    -- 1️⃣ Insert new finished tasks from design_activity → sales_management
    INSERT INTO sales_management (
        proj_id,
        client_id,
        client_name,
        proj_desc,
        date_received,
        sir_mjh,
        sales_personnel
    )
    SELECT 
        da.id,
        da.client_id,
        da.client_name,
        da.proj_desc,
        da.date_received,
        da.sir_mjh,
        da.sales_personnel
    FROM design_activity da
    WHERE da.status = 'Finished'
      AND NOT EXISTS ( 
          SELECT 1 FROM sales_management sm WHERE sm.proj_id = da.id
      );

    -- 2️⃣ Cleanup: remove rows from sales_management with missing sir_mjh in design_activity
    DELETE sm
    FROM sales_management sm
    LEFT JOIN design_activity da ON sm.proj_id = da.id
    WHERE da.sir_mjh IS NULL;
END$$

DELIMITER ;
