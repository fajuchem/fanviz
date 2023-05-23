import React, { useEffect, useState } from "react";
import { Tree } from "./hierarchies/Tree";
import { data } from "./hierarchies/data";
import { Treemap } from "./hierarchies/Treemap";
import axios from "axios";
import { Pack } from "./hierarchies/Pack";
import { Graph } from "./hierarchies/Graph";

enum VisuType {
  Tree = "Tree",
  Treemap = "TreeMap",
  Pack = "Pack",
}

export function Visu() {
  const [selectedOption, setSelectedOption] = useState(VisuType.Tree);
  const [fanOut, setFanOut] = useState(10);
  const [fanIn, setFanIn] = useState(10);
  const [data, setData] = useState({});
  const width = 800;
  const height = 800;

  useEffect(() => {
    const event = async (e) => {
      const target = e.target?.closest(".file");
      if (target) {
        const file = target?.getAttribute("data-tagsearch-path");
        const selected = window.getSelection()?.toString();

        const dependecies = await axios.get(
          `http://localhost:3030/dependecies?symbol=${selected}&file=${file}`
          //`http://localhost:3030/dependecies?symbol=getFromDb&file=src/user.ts`
        );
        setData(dependecies.data);
        // console.log(file);
        // console.log(selected);
        console.log(dependecies.data);
      }
    };

    document.addEventListener("mouseup", event);

    event({ target: { closest: () => ({ getAttribute: () => "file" }) } });

    return () => {
      document.removeEventListener("mouseup", event);
    };
  }, []);

  const handleSelect = (e) => {
    setSelectedOption(e.target.value);
  };

  const Visu = () => {
    if (selectedOption === VisuType.Tree) {
      return <Tree data={data} width={width} height={height} fanOut={fanOut} />;
    } else if (selectedOption === VisuType.Treemap) {
      return <Treemap data={data} width={width} height={height} />;
    } else if (selectedOption === VisuType.Pack) {
      return <Pack data={data} width={width} height={height} />;
    } else {
      return <>not found</>;
    }
  };

  return (
    <>
      <div style={{ marginTop: '20px' }}>
        <label htmlFor="fanIn">Fan In</label>
        <input
          id="fanIn"
          type="range"
          min="0"
          max="10"
          value={fanIn}
          onChange={(value) => setFanIn(Number(value.target.value))}
        />
        {fanIn}
      </div>
      <div>
        <label htmlFor="fanOut">Fan Out</label>
        <input
          id="fanOut"
          type="range"
          min="0"
          max="10"
          value={fanOut}
          onChange={(value) => setFanOut(Number(value.target.value))}
        />
        {fanOut}
      </div>
      <div style={{ marginTop: '20px' }}>
        <Graph height={height} width={width} fanIn={fanIn} fanOut={fanOut} data={data} />
      </div>
    </>
  );
}
