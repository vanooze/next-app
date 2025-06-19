import { Card, CardBody } from "@heroui/react";
import React from "react";
import { Community } from "../icons/community";

interface Card2Props {
  Overdue: number;
}

export const Card2 = ({ Overdue }: Card2Props) => {
  return (
    <Card className="xl:max-w-sm bg-danger rounded-xl shadow-md px-3 w-full">
      <CardBody className="py-5">
        <div className="flex gap-2.5">
          <Community />
          <div className="flex flex-col">
            <span className="text-white font-semibold">Task Overdue</span>
            <span className="text-white text-xs">
              Tasks that needed to work on
            </span>
          </div>
        </div>
        <div className="flex justify-end content-center py-3 px-2">
          <span className="text-white text-4xl font-semibold">{Overdue}</span>
        </div>
      </CardBody>
    </Card>
  );
};
