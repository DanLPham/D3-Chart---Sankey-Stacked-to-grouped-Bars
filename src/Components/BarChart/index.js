import React from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import { useD3 } from '../Utilities/useD3';

const BarChart = ({ width, height, vbWidth, vbHeight, data, ...rest }) => {

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
        let idx = Math.ceil((new Date(neighbor.dailyContributingView[i].date) - new Date(data.createdAt)) / (1000 * 60 * 60 * 24));
        tmp[idx] = neighbor.dailyContributingView[i].view;
      }
      arr.push(tmp);
    });

    tmp = [];
    for (let i = 0; i < day_cnt; i++) {
      tmp.push(Math.max(data.dailyView[i] - arr[0][i] - arr[1][i] - arr[2][i], 0));
    }
    arr.push(tmp);

    arr.reverse();  // rest -> 3 -> 2 -> 1
    // console.log("normalizeContributingData:", arr);
    return arr;
  }

  const margin = ({ top: 0, right: 0, bottom: 10, left: 0 });

  const m = Math.ceil((new Date("06/30/2022") - new Date(data.createdAt)) / (1000 * 60 * 60 * 24)) + 1; // number of values per series

  const n = data.neighbors.length + 1; // number of series

  const layout = "stacked";

  const new_yz = normalizeContributingData();

  const ref = useD3(
    (svg) => {
      const xAxis = svg => svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0).tickFormat(() => ""))

      const yAxis = svg => svg.append("g")
        .attr("transform", `translate(5,0)`)
        .call(d3.axisLeft(x).tickSizeOuter(0).tickFormat(() => ""))

      // const z = d3.scaleSequential(d3.interpolateGreens)
      //   .domain([-0.5 * n, 1.5 * n])
      // console.log("z:", z)
      const z = ["#1192e8", "#198038", "#da1e28", "#b28600"]; // Color code

      // const yz = d3.range(n).map(() => bumps(m)) // the y-values of each of the n series
      const yz = new_yz;
      // console.log("yz:", yz);

      const y01z = d3.stack()
        .keys(d3.range(n))
        (d3.transpose(yz)) // stacked yz
        .map((data, i) => data.map(([y0, y1]) => [y0, y1, i]))

      const y1Max = d3.max(y01z, y => d3.max(y, d => d[1]))

      const y = d3.scaleLinear()
        .domain([0, y1Max])
        .range([height - margin.bottom, margin.top])

      const yMax = d3.max(yz, y => d3.max(y))

      const xz = d3.range(m) // the x-values shared by all series

      const x = d3.scaleBand()
        .domain(xz)
        .rangeRound([margin.left, width - margin.right])
        .padding(0.08)

      svg
        .attr("height", height)
        .attr("width", width)
        .attr("viewBox", [0, 0, vbWidth, vbHeight]);

      const rect = svg.selectAll("g")
        .data(y01z)
        .join("g")
        // .attr("fill", (d, i) => z(i))
        .attr("fill", (d, i) => z[i])
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

      function transitionGrouped() {
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

      function transitionStacked() {
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

      function update(layout) {
        if (layout === "stacked") transitionStacked();
        else transitionGrouped();
      }

      update(layout);
    }, []);

  return (
    <svg
      ref={ref}
    />
  );
}

export default BarChart;
