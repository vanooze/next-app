"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface ProjectTimelineItem {
  projectId: string | number;
  projectName: string;
  start_date: string;
  end_date: string;
}

interface ProjectTimelineProps {
  projects: ProjectTimelineItem[];
}

export default function ProjectTimelineD3({ projects }: ProjectTimelineProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const [rangeStart, setRangeStart] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  });
  const [rangeEnd, setRangeEnd] = useState(rangeStart + WEEK_MS * 3);

  const handlePrev = () => {
    setRangeStart((prev) => prev - WEEK_MS * 3);
    setRangeEnd((prev) => prev - WEEK_MS * 3);
  };
  const handleNext = () => {
    setRangeStart((prev) => prev + WEEK_MS * 3);
    setRangeEnd((prev) => prev + WEEK_MS * 3);
  };

  useEffect(() => {
    if (!projects.length || !containerRef.current) return;

    // Filter projects within the current range
    const visible = projects;

    // Assign rows (non-overlapping, max 5 rows)
    const sorted = [...visible].sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
    const rows: ProjectTimelineItem[][] = [[], [], [], [], []]; // always 5 rows

    sorted.forEach((p) => {
      const start = new Date(p.start_date).getTime();
      const end = new Date(p.end_date).getTime();
      let placed = false;
      for (const row of rows) {
        if (row.length === 0) {
          row.push(p);
          placed = true;
          break;
        } else {
          const overlaps = row.some((item) => {
            const s = new Date(item.start_date).getTime();
            const e = new Date(item.end_date).getTime();
            return !(end < s || start > e);
          });
          if (!overlaps) {
            row.push(p);
            placed = true;
            break;
          }
        }
      }
    });

    const width = containerRef.current.clientWidth;
    const height = 300;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    svg.selectAll("*").remove();

    // x scale (time)
    const x = d3
      .scaleTime()
      .domain([rangeStart, rangeEnd])
      .range([50, width - 20]);

    // y scale
    const y = d3
      .scaleBand()
      .domain(d3.range(rows.length).map(String))
      .range([40, height - 20])
      .padding(0.3);

    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0,${height - 30})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeWeek.every(1))
          .tickFormat(d3.timeFormat("%m/%d") as any)
      );

    const tooltip = d3.select(tooltipRef.current);

    // Draw bars and labels
    rows.forEach((row, rowIndex) => {
      svg
        .selectAll(`.bar-row-${rowIndex}`)
        .data(row)
        .join("rect")
        .attr("class", `bar-row-${rowIndex}`)
        .attr("x", (d) => x(new Date(d.start_date).getTime()))
        .attr("y", y(String(rowIndex))!)
        .attr(
          "width",
          (d) =>
            x(new Date(d.end_date).getTime()) -
            x(new Date(d.start_date).getTime())
        )
        .attr("height", y.bandwidth())
        .attr("fill", "#42a5f5")
        .on("mousemove", (event, d) => {
          tooltip
            .style("opacity", 1)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 20 + "px")
            .html(
              `<strong>${d.projectName}</strong><br/>
               ID: ${d.projectId}<br/>
               Start: ${d.start_date}<br/>
               End: ${d.end_date}`
            );
        })
        .on("mouseleave", () => tooltip.style("opacity", 0));

      svg
        .selectAll(`.label-row-${rowIndex}`)
        .data(row)
        .join("text")
        .attr("class", `label-row-${rowIndex}`)
        .attr("x", (d) => x(new Date(d.start_date).getTime()) + 5)
        .attr("y", (y(String(rowIndex)) ?? 0) + y.bandwidth() / 1.5)
        .attr("fill", "white")
        .attr("font-size", "12px")
        .text((d) => d.projectName);
    });

    svg
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text("Projects");

    // Enable pan/drag
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 1])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(x);
        xAxisGroup.call(
          d3
            .axisBottom(newX)
            .ticks(d3.timeWeek.every(1))
            .tickFormat(d3.timeFormat("%m/%d") as any)
        );

        svg
          .selectAll<SVGRectElement, ProjectTimelineItem>("rect")
          .attr("x", (d) => newX(new Date(d.start_date).getTime()))
          .attr(
            "width",
            (d) =>
              newX(new Date(d.end_date).getTime()) -
              newX(new Date(d.start_date).getTime())
          );

        svg
          .selectAll<SVGTextElement, ProjectTimelineItem>(
            "text.label-row-0, text.label-row-1, text.label-row-2, text.label-row-3, text.label-row-4"
          )
          .attr("x", (d) => newX(new Date(d.start_date).getTime()) + 5);
      });

    svg.call(zoom as any);
  }, [projects, rangeStart, rangeEnd]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div className="flex gap-2 mb-4">
        <button
          onClick={handlePrev}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          ⏮ Previous 3 Weeks
        </button>
        <button
          onClick={handleNext}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          Next 3 Weeks ⏭
        </button>
      </div>
      <svg ref={svgRef}></svg>
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          opacity: 0,
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "5px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
