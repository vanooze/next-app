import { Card, CardBody } from "@heroui/react";
import React from "react";
import { Community } from "../icons/community";

interface CardBalance1Props {
  OnHold: number;
}
export const CardBalance1 = ({ OnHold }: CardBalance1Props) => {
  return (
    <Card className="xl:max-w-sm bg-primary rounded-xl shadow-md px-3 w-full">
      <CardBody className="py-5 overflow-hidden">
        <div className="flex gap-2.5">
          <Community />
          <div className="flex flex-col">
            <span className="text-white font-semibold">Task On Hold</span>
            <span className="text-white text-xs">
              Tasks that are currently on Hold
            </span>
          </div>
        </div>
        <div className="flex justify-end content-center py-3 px-2">
          <span className="text-white text-4xl font-semibold">{OnHold}</span>
        </div>
      </CardBody>
    </Card>
  );
};
