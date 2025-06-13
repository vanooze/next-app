import { Card, CardBody } from "@heroui/react";
import React from "react";
import { Community } from "../icons/community";

export const CardBalance2 = () => {
  return (
    <Card className="xl:max-w-sm bg-default-50 rounded-xl shadow-md px-3 w-full">
      <CardBody className="py-5">
        <div className="flex gap-2.5">
          <Community />
          <div className="flex flex-col">
            <span className="text-white font-semibold">Task Completed</span>
            <span className="text-white text-xs">Great Work!</span>
          </div>
        </div>
        <div className="flex justify-end content-center py-3 px-2">
          <span className="text-white text-4xl font-semibold">8</span>
        </div>
      </CardBody>
    </Card>
  );
};
