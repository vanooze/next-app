import { Card, CardBody } from "@heroui/react";
import React from "react";
import { Community } from "../icons/community";
import { useUserContext } from "../layout/UserContext";

interface Card1Props {
  Pending: number;
}
export const Card1 = ({ Pending }: Card1Props) => {
  const { user } = useUserContext();
  const isSales = user?.position.includes("SALES");
  return (
    <Card className="xl:max-w-sm bg-warning rounded-xl shadow-md px-3 w-full">
      <CardBody className="py-5 overflow-hidden">
        <div className="flex gap-2.5">
          <Community />
          <div className="flex flex-col">
            <span className="text-white font-semibold">
              {isSales ? "On Progress" : "Task Pending"}
            </span>
            <span className="text-white text-xs">
              {isSales ? "Projects that in progress" : "New task pending"}
            </span>
          </div>
        </div>
        <div className="flex justify-end content-center py-3 px-2">
          <span className="text-white text-4xl font-semibold">{Pending}</span>
        </div>
      </CardBody>
    </Card>
  );
};
