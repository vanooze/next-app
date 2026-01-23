import React from "react";

export function parseBulletMessage(message: string) {
  if (!message) return null;

  const items = message
    .split("•")
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length <= 1) {
    return <p className="whitespace-pre-wrap leading-relaxed">{message}</p>;
  }

  return (
    <ul className="list-disc pl-5 space-y-1 leading-relaxed">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
