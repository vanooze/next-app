"use client";
import SalesOrder from "@/components/contents/SO/sales_order";
import { useProjectContext } from "@/components/layout/ProjectContext";

export default function SalesOrderPage() {
  const { project } = useProjectContext();
  return <SalesOrder project={project} />;
}
