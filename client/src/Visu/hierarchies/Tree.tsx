// @ts-nocheck
import * as d3 from "d3";
import { useEffect } from "react";
import "./Tree.css";

export function Tree({ data, width: parentWidth, height: parentHeight }) {
  const margin = { top: 20, right: 160, bottom: 30, left: 110 },
    width = parentWidth - margin.left - margin.right,
    height = parentHeight - margin.top - margin.bottom;

  useEffect(() => {
    // declares a tree layout and assigns the size
    const treemap = d3.tree().size([height, width]);

    //  assigns the data to a hierarchy using parent-child relationships
    let nodes = d3.hierarchy(data, function (d) {
      return d.children;
    });

    // maps the node data to the tree layout
    nodes = treemap(nodes);

    // append the svg object to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    // var svg = d3
    //     .select("body")
    //     .append("svg")
    //     .attr("width", width + margin.left + margin.right)
    //     .attr("height", height + margin.top + margin.bottom),
    //   g = svg
    //     .append("g")
    //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const g = d3.select("g");

    // adds the links between the nodes
    const link = g
      .selectAll(".link")
      .data(nodes.descendants().slice(1))
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", function (d) {
        return (
          "M" +
          d.y +
          "," +
          d.x +
          "C" +
          (d.y + d.parent.y) / 2 +
          "," +
          d.x +
          " " +
          (d.y + d.parent.y) / 2 +
          "," +
          d.parent.x +
          " " +
          d.parent.y +
          "," +
          d.parent.x
        );
      });

    // adds each node as a group
    const node = g
      .selectAll(".node")
      .data(nodes.descendants())
      .enter()
      .append("g")
      .attr("class", function (d) {
        return "node";
      })
      .attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")";
      });

    // adds the circle to the node
    node.append("circle").attr("r", 10);

    node.append("title").text((d) => d.data.name);

    // adds the text to the node
    node
      .append("text")
      .attr("dy", ".35em")
      .attr("x", function (d) {
        return d.children ? -13 : 13;
      })
      .attr("y", function (d) {
        return d.depth === 0 ? 0 : -20;
      })
      .style("text-anchor", function (d) {
        return d.children ? "end" : "end";
      })
      .style("fill", "white")
      .text(function (d) {
        return d.data.name;
      });

    const circles = g.selectAll("circle").data(nodes.descendants()).nodes();

    for (const node of circles) {
      if (node.__data__.depth === 0) {
        d3.select(node).style("fill", "#8ea2ff");
      } else if (node.__data__.depth === 1) {
        d3.select(node).style("fill", "#ff8d8f");
      } else {
        d3.select(node).style("fill", "#50a061");
      }
    }
  }, [data, parentHeight, parentWidth]);

  return (
    <div style={{ position: "fixed" }}>
      <svg width={parentWidth} height={parentHeight}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <g className="links"></g>
          <g className="nodes"></g>
        </g>
      </svg>
    </div>
  );
}
