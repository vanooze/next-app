import { Card, CardBody } from "@heroui/react";
import React from "react";
import { Community } from "../icons/community";

interface CardBalance2Props {
  completed: number;
}

export const CardBalance2 = ({ completed }: CardBalance2Props) => {
  return (
    <Card className="xl:max-w-sm bg-secondary rounded-xl shadow-md px-3 w-full">
      <CardBody className="py-5">
        <div className="flex gap-2.5">
          <Community />
          <div className="flex flex-col">
            <span className="text-white font-semibold">Task Completed</span>
            <span className="text-white text-xs">Great Work!</span>
          </div>
        </div>
        <div className="flex justify-end content-center py-3 px-2">
          <span className="text-white text-4xl font-semibold">{completed}</span>
        </div>
      </CardBody>
    </Card>
  );
};
