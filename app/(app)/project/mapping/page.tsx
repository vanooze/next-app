"use client";

import { useEffect, useState } from "react";
import { Projects } from "@/helpers/acumatica";
import ProjectTimelineD3 from "@/components/charts/project_mapping";

export default function ProjectTimelineWrapper() {
  const [projects, setProjects] = useState<Projects[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/department/PMO/project");
        const data: Projects[] = await res.json();
        setProjects(data);
        console.log("✅ Fetched projects:", data);
      } catch (err) {
        console.error("❌ Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <p>Loading project timeline...</p>;
  if (!projects.length) return <p>No projects available.</p>;

  const chartData = projects
    .filter((p) => p.startDate)
    .map((p) => {
      // Calculate default end date (3 months after start date) if not provided
      const startDate = new Date(p.startDate!);
      const defaultEndDate = new Date(startDate);
      defaultEndDate.setMonth(defaultEndDate.getMonth() + 3);
      
      return {
        projectId: p.projectId ?? String(p.id),
        projectName: p.description || `Project ${p.projectId}`,
        start_date: p.startDate!,
        end_date: defaultEndDate.toISOString().split('T')[0],
      };
    });

  console.log("📊 Chart Data:", chartData);

  return <ProjectTimelineD3 projects={chartData} />;
}
