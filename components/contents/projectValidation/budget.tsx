"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
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

interface BudgetProps {
  project: Projects | null;
}

export default function Budget({ project }: BudgetProps) {
  const { user } = useUserContext();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const canAddBudget =
    user?.name.includes("HAROLD DAVID") ||
    user?.name.includes("MARVIN JIMENEZ");

  useEffect(() => {
    if (project) {
      setProjectId(project?.projectId);
    }
  }, [project]);

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

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setSelectedItems((prev) => {
      const updated = new Set(prev);
      checked ? updated.add(id) : updated.delete(id);
      return updated;
    });
  };

  return (
    <Card className="max-w-3xl mx-auto p-4 mt-6">
      <CardBody>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Spinner color="primary" label="Loading budget items..." />
          </div>
        ) : (
          <Table aria-label="Budget Items Table">
            <TableHeader>
              <TableColumn>
                <Checkbox
                  isSelected={
                    budgetItems.length > 0 &&
                    selectedItems.size === budgetItems.length
                  }
                  isIndeterminate={
                    selectedItems.size > 0 &&
                    selectedItems.size < budgetItems.length
                  }
                  onValueChange={(checked) => {
                    setSelectedItems(
                      checked
                        ? new Set(budgetItems.map((item) => item.id))
                        : new Set()
                    );
                  }}
                />
              </TableColumn>
              <TableColumn>Item Name</TableColumn>
              <TableColumn>Price</TableColumn>
            </TableHeader>

            <TableBody emptyContent={"No budget items yet"}>
              {budgetItems.map((item) => {
                const { id, item_name, price } = item;
                const isSelected = selectedItems.has(id);

                return (
                  <TableRow
                    key={id}
                    className={
                      isSelected ? "bg-blue-100 dark:bg-blue-900/30" : ""
                    }
                  >
                    <TableCell>
                      <Checkbox
                        isSelected={isSelected}
                        onValueChange={(checked) =>
                          handleCheckboxChange(id, checked)
                        }
                      />
                    </TableCell>
                    <TableCell>{item_name}</TableCell>
                    <TableCell>₱ {Number(price).toLocaleString()}</TableCell>
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
