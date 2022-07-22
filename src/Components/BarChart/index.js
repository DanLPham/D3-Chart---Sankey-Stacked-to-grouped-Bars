import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import { useD3 } from '../Utilities/useD3';

const BarChart = ({ width, height, vbWidth, vbHeight, data, dateRange, mode, colorList, ...rest }) => {

  // Returns an array of m psuedorandom, smoothly-varying non-negative numbers.
  // Inspired by Lee Byron’s test data generator.
  // http://leebyron.com/streamgraph/

  const normalizeContributingData = () => {
    const arr = [];

    let tmp = [];
    let day_cnt = Math.ceil((new Date("06/30/2022") - new Date(data.createdAt)) / (1000 * 60 * 60 * 24)) + 1;
    data.neighbors.map((neighbor) => {
      tmp = [];
      // for (let i = new Date(data.createdAt); i <= new Date("06/30/2022"); i.setDate(i.getDate() + 1)) {
      for (let i = 0; i < day_cnt; i++) {
        tmp.push(0);
      }
      for (let i = 0; i < neighbor.dailyContributingView.length; i++) {
        // console.log(new Date(neighbor.dailyContributingView[i].date));
        if (neighbor.dailyContributingView[i].date >= dateRange[0] && neighbor.dailyContributingView[i].date <= dateRange[1]) {
          let idx = Math.ceil((new Date(neighbor.dailyContributingView[i].date) - new Date(data.createdAt)) / (1000 * 60 * 60 * 24));
          tmp[idx] = neighbor.dailyContributingView[i].view;
        }
      }
      arr.push(tmp);
    });

    tmp = [];
    let out_of_range_data = [];
    for (let i = 0; i < day_cnt; i++) {
      let current_date = new Date(new Date(data.createdAt).getTime() + (1000 * 60 * 60 * 24) * i);
      // console.log("current_date:", current_date, " | i:", i);
      if (current_date >= dateRange[0] && current_date <= dateRange[1]) {
        tmp.push(Math.max(data.dailyView[i] - arr[0][i] - arr[1][i] - arr[2][i], 0));
        out_of_range_data.push(0);
      } else {
        tmp.push(0);
        out_of_range_data.push(data.dailyView[i]);
      }
    }
    arr.push(tmp);
    arr.push(out_of_range_data);

    arr.reverse();  // rest -> 3 -> 2 -> 1
    // console.log("normalizeContributingData:", arr);
    return arr;
  }

  const margin = ({ top: 0, right: 0, bottom: 20, left: 0 });

  const m = Math.ceil((new Date("06/30/2022") - new Date(data.createdAt)) / (1000 * 60 * 60 * 24)) + 1; // number of values per series

  const n = data.neighbors.length + 2; // number of series

  // const layout = "stacked";

  const xAxis = svg => svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(pre_xAxis).tickSizeOuter(0).tickFormat((d) => {
      let date = new Date(d);
      // console.log(d);
      return date.toLocaleString('default', { month: 'short' }) + " " + date.getDate();
    }))

  const yAxis = svg => svg.append("g")
    .attr("transform", `translate(5,0)`)
    .call(d3.axisLeft(x).tickSizeOuter(0).tickFormat(() => ""))

  // const z = d3.scaleSequential(d3.interpolateGreens)
  //   .domain([-0.5 * n, 1.5 * n])
  // console.log("z:", z)
  const z = ["#1192e8", "#198038", "#da1e28", "#b28600", "#f42891", "#ab3cd2", "#e82ac9"]; // Color code
  const color_gray = "Gainsboro";

  // const yz = d3.range(n).map(() => bumps(m)) // the y-values of each of the n series
  // const yz = new_yz;
  // console.log("yz:", yz);

  const [yz, set_yz] = useState(normalizeContributingData());
  const [y01z, set_y01z] = useState(d3.stack()
    .keys(d3.range(n))
    (d3.transpose(yz)) // stacked yz
    .map((data, i) => data.map(([y0, y1]) => [y0, y1, i])));
  const [y1Max, set_y1Max] = useState(d3.max(y01z, y => d3.max(y, d => d[1])));

  const xz = d3.range(m) // the x-values shared by all series

  var y = d3.scaleLinear()
    .domain([0, y1Max])
    .range([height - margin.bottom, margin.top]);
  var yMax = d3.max(yz, y => d3.max(y));

  var x = d3.scaleBand()
    .domain(xz)
    .rangeRound([margin.left, width - margin.right])
    .padding(0.08);

  var pre_xAxis = d3.scaleUtc()
    .domain([new Date(data.createdAt), new Date("06/30/2022")])
    .range([margin.left, width - margin.right - 10]);

  const transitionGrouped = (rect) => {
    y.domain([0, yMax]);

    rect.transition()
      .duration(500)
      .delay((d, i) => i * 20)
      .attr("x", (d, i) => x(i) + x.bandwidth() / n * d[2])
      .attr("width", x.bandwidth() / n)
      .transition()
      .attr("y", d => y(d[1] - d[0]))
      .attr("height", d => y(0) - y(d[1] - d[0]));
  }

  const transitionStacked = (rect) => {
    y.domain([0, y1Max]);

    rect.transition()
      .duration(500)
      .delay((d, i) => i * 20)
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .transition()
      .attr("x", (d, i) => x(i))
      .attr("width", x.bandwidth());
  }

  const update = (layout, rect) => {
    if (layout === "stacked") transitionStacked(rect);
    else transitionGrouped(rect);
  }

  useEffect(() => {
    set_yz(normalizeContributingData());
    set_y01z(d3.stack()
      .keys(d3.range(n))
      (d3.transpose(yz)) // stacked yz
      .map((data, i) => data.map(([y0, y1]) => [y0, y1, i])));
    set_y1Max(d3.max(y01z, y => d3.max(y, d => d[1])));
    console.log("changed")
  }, [dateRange]);

  const ref = useD3(
    (svg) => {
      y = d3.scaleLinear()
        .domain([0, y1Max])
        .range([height - margin.bottom, margin.top])

      yMax = d3.max(yz, y => d3.max(y))

      x = d3.scaleBand()
        .domain(xz)
        .rangeRound([margin.left, width - margin.right])
        .padding(0.08)

      svg
        .attr("height", height)
        .attr("width", width)
        .attr("viewBox", [0, 0, vbWidth, vbHeight])
        .attr("id", "barchart");

      var rect = svg.selectAll("g")
        .data(y01z)
        .join("g")
        // .attr("fill", (d, i) => z(i))
        .attr("fill", (d, i) => {
          if (i == 0) {
            return color_gray;
          } else {
            return z[i - 1];
          }
        })
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", (d, i) => x(i))
        .attr("y", height - margin.bottom)
        .attr("width", x.bandwidth())
        .attr("height", 0);

      svg.append("g")
        .call(xAxis)
        .call(yAxis);

      update(mode, rect);
    }, []);

  useEffect(() => {
    y = d3.scaleLinear()
      .domain([0, y1Max])
      .range([height - margin.bottom, margin.top]);

    yMax = d3.max(yz, y => d3.max(y));

    x = d3.scaleBand()
      .domain(xz)
      .rangeRound([margin.left, width - margin.right])
      .padding(0.08);

    pre_xAxis = d3.scaleUtc()
      .domain([new Date(data.createdAt), new Date("06/30/2022")])
      .range([margin.left, width - margin.right - 10]);

    let svg = d3.select("#barchart");
    svg.selectAll("g").remove();

    svg
      .attr("height", height)
      .attr("width", width)
      .attr("viewBox", [0, 0, vbWidth, vbHeight])
      .attr("id", "barchart");

    var rect = svg.selectAll("g")
      .data(y01z)
      .join("g")
      // .attr("fill", (d, i) => z(i))
      .attr("fill", (d, i) => {
        if (i == 0) {
          return color_gray;
        } else {
          return z[i - 1];
        }
      })
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", (d, i) => x(i))
      .attr("y", height - margin.bottom)
      .attr("width", x.bandwidth())
      .attr("height", 0);

    svg.append("g")
      .call(xAxis)
      .call(yAxis);

    update(mode, rect);
  });

  return (
    <svg
      ref={ref}
    />
  );
}

export default BarChart;
