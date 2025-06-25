"use client";

import React, { useState } from "react";
import { DropZone, Text, type TextDropItem } from "react-aria-components";
import { useDrag } from "react-aria";

export default function Reports() {
  const [dropped, setDropped] = useState("");
  const { dragProps, isDragging } = useDrag({
    getItems() {
      return [
        {
          "text/plain": "hello world",
        },
      ];
    },
  });

  // Type guard
  const isTextDropItem = (item: any): item is TextDropItem => {
    return (
      item.kind === "text" &&
      item.types?.has?.("text/plain") &&
      typeof item.getText === "function"
    );
  };

  return (
    <>
      <div
        {...dragProps}
        role="button"
        tabIndex={0}
        className={`p-4 m-4 border rounded cursor-pointer ${
          isDragging ? "bg-blue-200" : "bg-white"
        }`}
      >
        Drag me
      </div>

      <DropZone
        onDrop={async (e) => {
          const items = await Promise.all(
            e.items
              .filter(isTextDropItem)
              .map((item) => item.getText("text/plain"))
          );
          setDropped(items.join("\n"));
        }}
        className="p-8 border-2 border-dashed border-gray-400 rounded-md text-center"
      >
        <Text slot="label">{dropped || "Drop here"}</Text>
      </DropZone>
    </>
  );
}
