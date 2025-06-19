import { Card, CardBody } from "@heroui/react";
import React from "react";
import { Community } from "../icons/community";

interface CardBalance1Props {
  Pending: number;
}
export const CardBalance1 = ({ Pending }: CardBalance1Props) => {
  return (
    <Card className="xl:max-w-sm bg-warning rounded-xl shadow-md px-3 w-full">
      <CardBody className="py-5 overflow-hidden">
        <div className="flex gap-2.5">
          <Community />
          <div className="flex flex-col">
            <span className="text-white font-semibold">Task Pending</span>
            <span className="text-white text-xs">New task pending</span>
          </div>
        </div>
        <div className="flex justify-end content-center py-3 px-2">
          <span className="text-white text-4xl font-semibold">{Pending}</span>
        </div>
      </CardBody>
    </Card>
  );
};
