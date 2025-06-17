import { Card, CardBody } from "@heroui/react";
import React from "react";
import { Community } from "../icons/community";

interface CardBalance3Props {
  total: number;
}

export const CardBalance3 = ({ total }: CardBalance3Props) => {
  return (
    <Card className="xl:max-w-sm bg-success rounded-xl shadow-md px-3 w-full">
      <CardBody className="py-5">
        <div className="flex gap-2.5">
          <Community />
          <div className="flex flex-col">
            <span className="text-white font-semibold">Total Task</span>
            <span className="text-white text-xs">
              That&apos;s a lot of Tasks!
            </span>
          </div>
        </div>
        <div className="flex justify-end content-center py-3 px-2">
          <span className="text-white text-4xl font-semibold">{total}</span>
        </div>
      </CardBody>
    </Card>
  );
};
