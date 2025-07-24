import { Tooltip, Chip } from "@heroui/react";
import React from "react";
import { Items } from "@/helpers/acumatica";
import { displayValue } from "@/helpers/displayValue";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/components/layout/UserContext";

interface Props {
  items: Items;
  columnKey: keyof Items | "actions";
}

export const RenderCell = ({ items, columnKey }: Props) => {
  const cellValue = items[columnKey as keyof Items];
  const { user } = useUserContext();
  const router = useRouter();

  switch (columnKey) {
    case "inventoryId":
      return <span>{displayValue(cellValue)}</span>;
    case "description":
      return <span>{displayValue(cellValue)}</span>;
    case "type":
      return <span>{displayValue(cellValue)}</span>;
    case "itemClass":
      return <span>{displayValue(cellValue)}</span>;
    case "postingClass":
      return <span>{displayValue(cellValue)}</span>;
    case "taxCategory":
      return <span>{displayValue(cellValue)}</span>;
    case "defaultWarehouse":
      return <span>{displayValue(cellValue)}</span>;
    case "baseUnit":
      return <span>{displayValue(cellValue)}</span>;
    case "defaultPrice":
      return <span>{displayValue(cellValue)}</span>;

    case "status":
      return (
        <Chip
          size="sm"
          variant="flat"
          color={
            cellValue === "Active"
              ? "success"
              : cellValue === "No Sales"
              ? "primary"
              : cellValue === "No Purchase"
              ? "secondary"
              : cellValue === "No Request"
              ? "default"
              : cellValue === "Marked for Deletion"
              ? "warning"
              : "danger"
          }
        >
          <span className="capitalize text-xs">{cellValue}</span>
        </Chip>
      );
    default:
      return <p className="text-bold text-sm capitalize">{cellValue}</p>;
  }
};
