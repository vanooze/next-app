import { Card, CardBody } from "@heroui/react";
import React from "react";
import { Community } from "../icons/community";

interface Card3Props {
  Finished: number;
}

export const Card3 = ({ Finished }: Card3Props) => {
  return (
    <Card className="xl:max-w-sm bg-success rounded-xl shadow-md px-3 w-full">
      <CardBody className="py-5">
        <div className="flex gap-2.5">
          <Community />
          <div className="flex flex-col">
            <span className="text-white font-semibold">
              Task Finished (30 Days)
            </span>
            <span className="text-white text-xs">
              That&apos;s a lot of tasks done in a month!
            </span>
          </div>
        </div>
        <div className="flex justify-end content-center py-3 px-2">
          <span className="text-white text-4xl font-semibold">{Finished}</span>
        </div>
      </CardBody>
    </Card>
  );
};
