DELIMITER $$

ALTER DEFINER=`zanie`@`%` EVENT `contract_status_update_daily` ON SCHEDULE EVERY 1 DAY STARTS '2025-07-28 02:00:00' ON COMPLETION NOT PRESERVE ENABLE COMMENT 'Updates contract status daily based on start_date and end_date' DO BEGIN
  UPDATE contract
  SET STATUS = CASE
    WHEN CURDATE() < start_date THEN 'Close'
    WHEN CURDATE() >= start_date AND CURDATE() <= end_date THEN 'Open'
    WHEN CURDATE() > end_date THEN 'Expired'
    ELSE STATUS
  END
  WHERE start_date IS NOT NULL AND end_date IS NOT NULL;

  -- Optional: log changes
  SELECT ROW_COUNT() AS records_updated, NOW() AS updated_at;
END$$

DELIMITER ;