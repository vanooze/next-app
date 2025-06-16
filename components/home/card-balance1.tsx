import { Card, CardBody } from "@heroui/react";
import React from "react";
import { Community } from "../icons/community";

interface CardBalance1Props {
  WIP: number;
}
export const CardBalance1 = ({ WIP }: CardBalance1Props) => {
  return (
    <Card className="xl:max-w-sm bg-primary rounded-xl shadow-md px-3 w-full">
      <CardBody className="py-5 overflow-hidden">
        <div className="flex gap-2.5">
          <Community />
          <div className="flex flex-col">
            <span className="text-white font-semibold">Task in Progress</span>
            <span className="text-white text-xs">Task you're working on</span>
          </div>
        </div>
        <div className="flex justify-end content-center py-3 px-2">
          <span className="text-white text-4xl font-semibold">{WIP}</span>
        </div>
      </CardBody>
    </Card>
  );
};
