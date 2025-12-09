import { executeQuery } from "./db";

export async function logNotification({
  type,
  message,
  receiverName,
  redirectUrl,
  active = 1,
}) {
  if (!type || !message) {
    throw new Error("type and message are required to log a notification");
  }

  const query = `
    INSERT INTO notifications_logs (type, message, receiver_name, redirect_url, active)
    VALUES (?, ?, ?, ?, ?)
  `;

  await executeQuery(query, [
    type,
    message,
    receiverName ?? null,
    redirectUrl ?? null,
    active,
  ]);
}
