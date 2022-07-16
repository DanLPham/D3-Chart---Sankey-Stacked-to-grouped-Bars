import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import { useD3 } from '../../Utilities/useD3';
import {
  createNodesData,
  createLinksData,
  getxFromId,
  convert2Epoch,
} from './utils';

const InfluenceGraph = ({ width, height, vbWidth, vbHeight, storyData, dateRange, mode, ...rest }) => {
  const types = ["licensing", "suit", "resolved", "contributing", "receiving"];

  const nodes = createNodesData(storyData);
  const links = createLinksData(storyData);

  const focusedId = "Story " + storyData.id;

  const maxWidthNode = 100;

  let xScale, yScale, chart_xScale_minimum, chart_xScale_maximum;

  function linkArc(d) {
    var px1 = getxFromId(d.source.id, xScale, maxWidthNode, width, focusedId);
    var px2 = getxFromId(d.target.id, xScale, maxWidthNode, width, focusedId);
    var py1, py2;

    py1 = d.source.y;
    py2 = d.target.y;

    var dx = px2 - px1,
      dy = py2 - py1,
      dr = Math.sqrt(dx * dx + dy * dy);
    if (d.source.id === d.target.id && d.source.id === focusedId) {
      var drs = 0;
      return (
        'M' +
        (px1 + drs / 2) +
        ',' +
        (py1 - drs / 2) +
        'A' +
        drs +
        ',' +
        drs +
        ' 135,1,1 ' +
        (px2 + drs / 2) +
        ',' +
        (py2 + drs / 2)
      );
    } else {
      return (
        'M' + px1 + ',' + py1 + 'A' + dr + ',' + dr + ' 0,0,1 ' + px2 + ',' + py2
      );
    }
  }

  const ref = useD3(
    (svg) => {
      const color = d3.scaleOrdinal(types, d3.schemeCategory10);

      chart_xScale_minimum = convert2Epoch(new Date(storyData.createdAt));
      chart_xScale_maximum = convert2Epoch(new Date('06/30/2022'));

      xScale = d3
        .scaleTime()
        .domain([
          chart_xScale_minimum,
          chart_xScale_maximum,
        ])
        .range([0, width]);
      yScale = d3
        .scaleLinear()
        .domain([
          0,
          1000
        ])
        .range([height, 0]);

      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-200))
        .force(
          'collision',
          d3
            .forceCollide()
            .radius(70)
            .iterations(8)
        )
        .force(
          'center',
          d3.forceCenter(0, 0)
        )
      // .force("x", d3.forceX())
      // .force("y", d3.forceY());

      const drag = simulation => {
        function dragstarted(event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(event, d) {
          d.fx = event.x;
          d.fy = event.y;
        }

        function dragended(event, d) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }

        return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
      }

      svg
        .attr("height", height)
        .attr("width", width)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .style("font", "12px sans-serif");

      // Per-type markers, as they don't inherit styles.
      svg.append("defs").selectAll("marker")
        .data(types)
        .join("marker")
        .attr("id", d => `arrow-${d}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 21)
        .attr("refY", -0.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", color)
        .attr("d", "M0,-5L10,0L0,5");

      const link = svg.append("g")
        .attr("id", "in-link")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("id", d => {
          let source_id = d.source.id.split(' ').pop();
          let target_id = d.target.id.split(' ').pop();
          return `link-${source_id}-${target_id}`
        })
        .attr("stroke", d => color(d.type))
        .attr("marker-end", d => {
          // console.log("d:", d);
          return `url(${new URL(`#arrow-${d.type}`, window.location)})`
        });

      const node = svg.append("g")
        .attr("fill", "currentColor")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .attr("id", d => `${d.id.replace(/\s+/g, '-').toLowerCase()}`)
        .call(drag(simulation));

      node.append("circle")
        .attr("fill", "white")
        .attr("r", d => `${d.totalView / 50000000 + 2}`);

      node.append("circle")
        .attr("fill", "CornflowerBlue")
        .attr("r", d => `${d.totalView / 50000000}`);

      node.append("text")
        .attr("x", 17)
        .attr("y", "0.31em")
        .text(d => d.id)
        .attr("stroke", "white")
        .attr("stroke-width", 3);

      node.append("text")
        .attr("x", 17)
        .attr("y", "0.31em")
        .text(d => d.id);

      simulation.on("tick", () => {
        link
          .attr("d", linkArc)
          .attr('stroke-width', d => d.value / 5000000);
        node.attr("transform", d => {
          let new_x = getxFromId(d.id, xScale, maxWidthNode, width, focusedId);
          return `translate(${new_x},${d.y})`
        });
      });

      // invalidation.then(() => simulation.stop());

    }, []);

  useEffect(() => {
    let svg = d3.select("#in-link");
    svg.selectAll('path').attr("stroke-width", function (d) {
      return d.value / 5000000 * 2;
    })
  });

  return (
    <svg
      ref={ref}
    />
  );
}

export default InfluenceGraph;
