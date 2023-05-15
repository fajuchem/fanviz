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
          `http://localhost:3000/dependecies?symbol=${selected}&file=${file}`
        );
        setData(dependecies.data);
        console.log(file);
        console.log(selected);
        console.log(dependecies.data);
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
      return <Tree data={data} width={width} height={height} />;
    } else if (selectedOption === VisuType.Treemap) {
      return <Treemap data={data} width={width} height={height} />;
    } else if (selectedOption === VisuType.Pack) {
      return <Pack data={data} width={width} height={height} />;
    } else {
      return <>not found</>;
    }
  };

  //<Tree data={data} />
  return (
    <>
      <div>
        <select value={selectedOption} onChange={handleSelect}>
          <option value={VisuType.Tree}>Tree</option>
          <option value={VisuType.Treemap}>Treemap</option>
          <option value={VisuType.Pack}>Pack</option>
        </select>
      </div>
      <div>
        <Visu />
      </div>
    </>
  );
}
