import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import { useD3 } from '../../Utilities/useD3';

const InfluenceGraph = ({ width, height, vbWidth, vbHeight, ...rest }) => {
  const types = ["contributing view", "receiving view", "GKR similarity"];

  const ref = useD3(
    (svg) => {
      const color = d3.scaleOrdinal(types, d3.schemeCategory10);

      svg.attr("height", height)
        .attr("width", width)
        .attr("viewBox", [-20, -height / 2, width, height])
        .style("font", "12px sans-serif");

      const colorSwatches = svg.append("g")
        .attr("id", "color-swatches")
        .attr("fill", "currentColor")
        .selectAll("g")
        .data(types)
        .join("g")
        .attr("style", (type, idx) => `transform:translate(${idx * 140}px,0px);`)

      colorSwatches
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 25)
        .attr("y2", 0)
        .attr("style", (type, idx) => `stroke:${color(type)};stroke-width:3;`);

      colorSwatches
        .append("text")
        .attr("x", 17)
        .attr("y", "0.31em")
        .text(type => type)
        .attr("style", (type, idx) => `transform:translate(12px,0px);`);
    }, []);

  return (
    <svg
      ref={ref}
    />
  );
}

export default InfluenceGraph;
