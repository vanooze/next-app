import { Card, CardBody } from "@heroui/react";
import React from "react";
import { Community } from "../icons/community";

interface CardProps {
  Rush: number;
}
export const Card0 = ({ Rush }: CardProps) => {
  return (
    <Card className="xl:max-w-sm bg-secondary rounded-xl shadow-md px-3 w-full">
      <CardBody className="py-5 overflow-hidden">
        <div className="flex gap-2.5">
          <Community />
          <div className="flex flex-col">
            <span className="text-white font-semibold">Task Rush</span>
            <span className="text-white text-xs">
              Tasks that needed to finish quickly
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
