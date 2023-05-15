// @ts-nocheck
import * as d3 from "d3";
import { useEffect } from "react";
import "./Treemap.css";

export function Treemap({ data, width, height }) {
  useEffect(() => {
    var treemapLayout = d3.treemap().size([width, height]).paddingOuter(16);

    var rootNode = d3.hierarchy(data);

    rootNode.sum(function (d) {
      return d.value;
    });

    treemapLayout(rootNode);

    var nodes = d3
      .select("svg g")
      .selectAll("g")
      .data(rootNode.descendants())
      .join("g")
      .attr("transform", function (d) {
        return "translate(" + [d.x0, d.y0] + ")";
      });

    nodes
      .append("rect")
      .attr("width", function (d) {
        return d.x1 - d.x0;
      })
      .attr("height", function (d) {
        return d.y1 - d.y0;
      });

    nodes
      .append("text")
      .attr("dx", 4)
      .attr("dy", 14)
      .text(function (d) {
        return d.data.name;
      });
  }, [data]);

  return (
    <svg width={width} height={height}>
      <g></g>
    </svg>
  );
}
