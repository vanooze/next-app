"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  Spinner,
} from "@heroui/react";
import { Projects } from "@/helpers/acumatica";
import { useUserContext } from "@/components/layout/UserContext";
import { DeleteIcon } from "@/components/icons/table/delete-icon";

interface BudgetProps {
  project: Projects | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  return Array.isArray(data) ? data : [data]; // Ensure array format
};

export default function Budget({ project }: BudgetProps) {
  const { user } = useUserContext();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemCost, setItemCost] = useState("");
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (project) {
      setProjectId(project?.projectId);
    }
  }, [project]);

  const canAddBudget = user?.designation?.includes("PMO");
  useEffect(() => {
    if (!project?.projectId) return;

    const fetchBudgetItems = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/department/PMO/project_tasks/projectkickoff/budget?projectId=${project.projectId}`
        );
        if (!res.ok) throw new Error("Failed to fetch budget items");
        const data = await res.json();
        setBudgetItems(data);
      } catch (err) {
        console.error("Error fetching budget items:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgetItems();
  }, [project]);

  const addBudgetItem = async () => {
    if (!itemName || !itemCost) return;

    setIsSaving(true);

    try {
      const res = await fetch(
        "/api/department/PMO/project_tasks/projectkickoff/budget/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            createdBy: user?.name,
            items: [
              {
                name: itemName,
                price: parseFloat(itemCost),
              },
            ],
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to save item");

      const data = await res.json();

      // Add locally for immediate display
      setBudgetItems((prev) => [
        ...prev,
        { item_name: itemName, price: parseFloat(itemCost) },
      ]);
      setItemName("");
      setItemCost("");
    } catch (error) {
      console.error("Error saving budget item:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      const res = await fetch(
        "/api/department/PMO/project_tasks/projectkickoff/budget/delete",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId }),
        }
      );

      if (!res.ok) throw new Error("Failed to delete");

      setBudgetItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto p-4 mt-6">
      <CardBody>
        {canAddBudget && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Item Name"
                value={itemName}
                onValueChange={setItemName}
                placeholder="e.g. Router Purchase"
                isRequired
              />
              <Input
                label="Item Cost (₱)"
                type="number"
                value={itemCost}
                onValueChange={setItemCost}
                placeholder="e.g. 12000"
                isRequired
              />
            </div>
            <Button
              className="mt-4"
              color="primary"
              isLoading={isSaving}
              onPress={addBudgetItem}
            >
              Add Budget Item
            </Button>
          </>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Spinner color="primary" label="Loading budget items..."></Spinner>
          </div>
        ) : (
          <Table aria-label="Budget Items Table">
            <TableHeader>
              <TableColumn>Item Name</TableColumn>
              <TableColumn>Price</TableColumn>
              <TableColumn>Action</TableColumn>
            </TableHeader>

            <TableBody emptyContent={"No budget items yet"}>
              {budgetItems.map((item) => {
                const { id, item_name, price } = item;
                return (
                  <TableRow key={id}>
                    <TableCell>{item_name}</TableCell>
                    <TableCell>₱ {Number(price).toLocaleString()}</TableCell>
                    <TableCell>
                      {canAddBudget ? (
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => handleDeleteItem(id)}
                        >
                          <DeleteIcon size={20} fill="#FF0080" />
                        </Button>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
}
