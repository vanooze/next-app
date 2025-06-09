import { Card, CardBody } from "@nextui-org/react";
import React from "react";
import { Community } from "../icons/community";

export const CardBalance3 = () => {
  return (
    <Card className="xl:max-w-sm bg-success rounded-xl shadow-md px-3 w-full">
      <CardBody className="py-5">
        <div className="flex gap-2.5">
          <Community />
          <div className="flex flex-col">
            <span className="text-white font-semibold">Total Task</span>
            <span className="text-white text-xs">That's a lot of tasks</span>
          </div>
        </div>
        <div className="flex justify-end content-center py-3 px-2">
          <span className="text-white text-4xl font-semibold">23</span>
        </div>
      </CardBody>
    </Card>
  );
};
