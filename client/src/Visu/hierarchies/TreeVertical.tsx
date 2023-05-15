// @ts-nocheck
import * as d3 from "d3";
import { useEffect } from "react";
import "./Tree.css";

export function Tree({ data, width, height }) {
  useEffect(() => {
    const treeLayout = d3.tree().size([width, height - 200]);

    const root = d3.hierarchy(data);

    treeLayout(root);

    const elem = d3
      .select("svg g.nodes")
      .selectAll("circle.node")
      .data(root.descendants());

    // Create and place the "blocks" containing the circle and the text
    var elemEnter = elem.enter().append("g");

    // Create the circle for each block
    var circle = elemEnter
      .append("circle")
      .classed("node", true)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 4);

    // Create the text for each block
    elemEnter
      .append("text")
      .classed("label", true)
      .style("fill", "black")
      .text((d) => d.data.name)
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y);

    // Links
    d3.select("svg g.links")
      .selectAll("line.link")
      .data(root.links())
      .join("line")
      .classed("link", true)
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    for (const node of elem.nodes()) {
      if (node.__data__.depth === 0) {
        d3.select(node).style("fill", "#8ea2ff");
      } else if (node.__data__.depth === 1) {
        d3.select(node).style("fill", "#ff8d8f");
      } else {
        d3.select(node).style("fill", "#50a061");
      }
    }

    d3.selectAll("circle").on("click", function (e, d) {
      console.log(d.data);
    });
  }, []);

  return (
    <svg width={width} height={height}>
      <g transform="translate(10, 50)">
        <g className="links"></g>
        <g className="nodes"></g>
      </g>
    </svg>
  );
}
