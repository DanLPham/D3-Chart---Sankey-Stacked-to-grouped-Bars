import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import { useD3 } from '../../Utilities/useD3';

const KeywordTree = ({ width, height, vbWidth, vbHeight, ...rest }) => {
  const data = {
    name: "a",
    children: [
      {
        name: "b",
        children: [
          {
            name: "c",
            children: [
              {
                name: "d",
                children: [
                  {
                    name: "Keyword 1",
                    children: [
                      {
                        name: "Keyword 6",
                      }
                    ]
                  }
                ]
              },
              {
                name: "e",
                children: [
                  {
                    name: "Keyword 2",
                    children: [
                      {
                        name: "Keyword 5",
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: "Keyword 3",
          }
        ]
      },
      {
        name: "f",
        children: [
          {
            name: "Keyword 4",
          }
        ]
      }
    ],
  }

  const id = Array.isArray(data) ? d => d.id : null;
  const parentId = Array.isArray(data) ? d => d.parentId : null;
  const tree = d3.cluster;
  // const sort = (a, b) => d3.descending(a.height, b.height);
  const children = d => d.children;
  const padding = 1;
  const label = d => d.name;
  const title = (d,n) => `${n.ancestors().reverse().map(d => d.data.name).join(".")}`;
  const stroke = "#555";
  const fill = "#999";
  const r = 3;
  const halo = "#fff";
  const haloWidth = 3;

  const ref = useD3(
    (svg) => {
      const root = id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
          : d3.hierarchy(data, children);

      // if (sort != null) root.sort(sort);

      const descendants = root.descendants();
      const L = label == null ? null : descendants.map(d => label(d.data, d));

      // Compute the layout.
      const dx = 10;
      const dy = width / (root.height + padding) - 10;
      tree().nodeSize([dx, dy])(root);

      // Center the tree.
      let x0 = Infinity;
      let x1 = -x0;
      root.each(d => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
      });

      // Compute the default height.
      if (height === undefined) height = x1 - x0 + dx * 2;

      svg.attr("viewBox", [-40, -height / 2, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12);

      svg.append("g")
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-opacity", 0.4)
        .attr("stroke-linecap", 0.4)
        .attr("stroke-linejoin", 0.4)
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(root.links())
        .join("path")
        .attr("d", d3.linkHorizontal()
          .x(d => d.y)
          .y(d => d.x));

      const node = svg.append("g")
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.y},${d.x})`);

      node.append("circle")
        .attr("fill", d => d.children ? stroke : fill)
        .attr("r", r);

      if (title != null) node.append("title")
        .text(d => title(d.data, d));

      if (L) node.append("text")
        .attr("dy", "0.32em")
        .attr("x", d => d.children ? -6 : 6)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .attr("paint-order", "stroke")
        .attr("stroke", halo)
        .attr("stroke-width", haloWidth)
        .text((d, i) => L[i]);
    }, []);

  return (
    <svg
      ref={ref}
    />
  );
}

export default KeywordTree;
