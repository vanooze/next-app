INSERT INTO newdashboard.users (
    user_id,
    NAME,
    designation,
    designation_status,
    department,
    cms,
    POSITION,
    email,
    username,
    PASSWORD,
    contact_number,
    access,
    restriction,
    STATUS
)
SELECT
    user_id,
    NAME,
    designation,
    designation_status,
    department,
    cms,
    POSITION,
    email,
    username,
    pass AS PASSWORD,
    contact_number,
    access AS access,
    restriction,
    STATUS
FROM eform.tbl_user
WHERE user_id = 325035;