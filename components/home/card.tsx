import { Card, CardBody } from "@heroui/react";
import React from "react";
import { Community } from "../icons/community";
import { useUserContext } from "../layout/UserContext";

interface CardProps {
  Rush: number;
}
export const Card0 = ({ Rush }: CardProps) => {
  const { user } = useUserContext();
  const isSales = user?.position.includes("SALES");

  return (
    <Card className="xl:max-w-sm bg-secondary rounded-xl shadow-md px-3 w-full">
      <CardBody className="py-5 overflow-hidden">
        <div className="flex gap-2.5">
          <Community />
          <div className="flex flex-col">
            <span className="text-white font-semibold">
              {isSales ? "On Hold" : "Task Priority"}
            </span>
            <span className="text-white text-xs">
              {isSales
                ? "Projects that are on Hold"
                : "Tasks that are priority first"}
            </span>
          </div>
        </div>
        <div className="flex justify-end content-center py-3 px-2">
          <span className="text-white text-4xl font-semibold">{Rush}</span>
        </div>
      </CardBody>
    </Card>
  );
};
