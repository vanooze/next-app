"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ProjectDefaultPage() {
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (id) router.replace(`/project/${id}/sales-order`);
  }, [id, router]);

  return null;
}
