import React, { useEffect, useState } from "react";
import { Tree } from "./hierarchies/Tree";
import { data } from "./hierarchies/data";
import { Treemap } from "./hierarchies/Treemap";
import axios from "axios";
import { Pack } from "./hierarchies/Pack";

enum VisuType {
  Tree = "Tree",
  Treemap = "TreeMap",
  Pack = "Pack",
}

export function Visu() {
  const [selectedOption, setSelectedOption] = useState(VisuType.Tree);
  const [fanOut, setFanOut] = useState(10);
  const width = 700;
  const height = 700;
  const [data, setData] = useState({});

  useEffect(() => {
    const event = async (e) => {
      const target = e.target?.closest(".file");
      if (target) {
        const file = target?.getAttribute("data-tagsearch-path");
        const selected = window.getSelection()?.toString();

        const dependecies = await axios.get(
          `http://localhost:3030/dependecies?symbol=${selected}&file=${file}`
        );
        setData(dependecies.data);
        // console.log(file);
        // console.log(selected);
        // console.log(dependecies.data);
      }
    };

    document.addEventListener("mouseup", event);

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
      <div>
        <label htmlFor="fanOut">Fan Out</label>
        <input
          id="fanOut"
          type="range"
          min="1"
          max="10"
          value={fanOut}
          onChange={(value) => setFanOut(Number(value.target.value))}
        />
        {fanOut}
      </div>
      <div>
        <Visu />
      </div>
    </>
  );
}
