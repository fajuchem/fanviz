// @ts-nocheck
import * as d3 from "d3";
import { useEffect } from "react";
import "./Pack.css";

export function Pack({ data, width, height }) {
  useEffect(() => {
    const packLayout = d3.pack().size([width, height]);

    const rootNode = d3.hierarchy(data);

    rootNode.sum(function (d) {
      return d.value;
    });

    packLayout(rootNode);

    const nodes = d3
      .select("svg g")
      .selectAll("g")
      .attr("class", function (d) {
        return "pack-node";
      })
      .data(rootNode.descendants())
      .join("g")
      .attr("transform", function (d) {
        return "translate(" + [d.x, d.y] + ")";
      });

    nodes.append("circle").attr("r", function (d) {
      return d.r;
    });

    nodes
      .append("text")
      .attr("dy", 4)
      .text(function (d) {
        return d.children === undefined ? d.data.name : "";
      });
  }, [data]);

  return (
    <svg width={width} height={height}>
      <g></g>
    </svg>
  );
}
