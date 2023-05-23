//// @ts-nocheck
import * as d3 from "d3";
import { useEffect, useState } from "react";
import "./Graph.css";

export function Graph({ height, width, fanIn, fanOut, data: externalData }) {
  const green = "#50a061";
  const red = "#ff8d8f";
  const blue = "#0075ff";
  let start = false;

  useEffect(() => {
    // console.log(externalData);
    // const links2 = [
    //   { source: "main.ts", target: "bootstrap" },
    //   { source: "bootstrap", target: "getActiveUsers" },
    //   { source: "getActiveUsers", target: "getUsers" },
    //   { source: "getActiveUsers", target: "getFromDb" },
    //   { source: "getInactiveUsers", target: "getUsers" },
    //   { source: "getUsersByGender", target: "getUsers" },
    //   { source: "getUsers", target: "getFromDb" },
    // ];

    const links2 = externalData?.graph || [];

    // const info = {
    //   fanIn: {
    //     "main.ts": 0,
    //     bootstrap: 1,
    //     getActiveUsers: 1,
    //     getInactiveUsers: 0,
    //     getUsersByGender: 0,
    //     getUsers: 3,
    //     getFromDb: 2,
    //   },
    //   fanOut: {
    //     "main.ts": 1,
    //     bootstrap: 1,
    //     getActiveUsers: 2,
    //     getInactiveUsers: 1,
    //     getUsersByGender: 1,
    //     getUsers: 1,
    //     getFromDb: 0,
    //   },
    // };
    const info = externalData?.meta || {};

    // const input = links2.map((d) => {

    // });

    const types = Array.from(new Set(links2.map((d) => d.type)));
    const data = {
      nodes: Array.from(
        new Set(links2.flatMap((l) => [l.source, l.target])),
        (id) => ({ id })
      ),
      links: links2,
    };

    const color = d3.scaleOrdinal(types, d3.schemeCategory10);
    const linkArc = (d) =>
      `M${d.source.x},${d.source.y}A0,0 0 0,1 ${d.target.x},${d.target.y}`;
    const links = data.links.map((d) => Object.create(d));
    const nodes = data.nodes.map((d) => Object.create(d));

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        // @ts-ignore
        d3.forceLink(links).id((d) => d.id)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force(
        "collide",
        d3.forceCollide((d) => 65)
      );

    const svg = d3
      .create("svg")
      .attr("viewBox", [-width / 2, -height / 2 - 60, width, height]);

    // Per-type markers, as they don't inherit styles.
    svg
      .append("defs")
      .selectAll("marker")
      .data(types)
      .join("marker")
      .attr("id", (d) => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 28)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "black")
      .attr("d", "M0,-5L10,0L0,5");

    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("stroke", (d) => "black")
      .attr(
        "marker-end",
        (d) => `url(${new URL(`#arrow-${d.type}`, location)})`
      );

    const node = svg
      .append("g")
      .attr("fill", "black")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(
        // @ts-ignore
        d3
          .drag()
          .container(svg.node())
          .subject(dragsubject)
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    function dragsubject(event) {
      return simulation.find(event.x, event.y);
    }
    function dragstarted(event) {
      start = true;
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
      start = false;
    }
    node
      .append("circle")
      .attr("stroke", (d) => {
        if (d.id === info?.selected) {
          return blue;
        } else {
          return "white";
        }
      })
      .attr("stroke-width", 3.0)
      .attr("r", 15)
      .attr("fill", (d) => {
        const infoFanIn = info.fanIn[d.id] || 0;
        const infoFanOut = info.fanOut[d.id] || 0;
        if (infoFanOut <= fanOut && infoFanIn <= fanIn) {
          return green;
        } else {
          return red;
        }
      });

    node.append("title").text((d) => {
      const infoFanIn = info.fanIn[d.id] || 0;
      const infoFanOut = info.fanOut[d.id] || 0;
      return `fan-in: ${infoFanIn}, fan-out: ${infoFanOut}`;
    });

    node
      .append("text")
      .attr("x", 20)
      .attr("y", "0.31em")
      .text((d) => d.id)
      .clone(true)
      .lower()
      .attr("fill", "blue")
      .attr("stroke", "white")
      .attr("stroke-width", 3);

    node.on("dblclick", (e, d) => console.log(nodes[d.index]));

    const container = d3.select("#container");
    const graph = d3.select("#graph");

    graph.remove();
    container
      .append("div")
      .attr("id", "graph")
      .style("width", "650px")
      .style("height", "650px");

    d3.select("#graph").insert(() => svg.node());

    if (!start) {
      // this removes the animation
      for (let i = 0; i < 300; ++i) simulation.tick();
    }

    setInterval(() => {
      // console.log(start);
      link.attr("d", linkArc);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    }, 0);
  }, [fanIn, fanOut, width, height, externalData]);

  return (
    <>
      <div id="container">
        <div id="graph">hi</div>
      </div>
    </>
  );
}
