import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import { useD3 } from '../../Utilities/useD3';
import {
  createNodesData,
  pushNewNodesData,
  createLinksData,
  getxFromId,
  convert2Epoch,
  getIdNumberFromId,
  pushNewLinksData,
} from './utils';

const InfluenceGraph = ({ width, height, vbWidth, vbHeight, storyData, story321_data, dateRange, mode, colorNode, colorLink, setHoverStory, setClickedStory, ...rest }) => {
  const types = ["contributing", "receiving", "GKRsimilarity", "2ndlink"];
  const GKR_similarity_scores = [5324, 1231, 2542, 3241, 4212, 943];
  const img_src = [
    "https://d2pn8kiwq2w21t.cloudfront.net/images/jpegPIA24937.width-1320.jpg",
    "https://www.sierraclub.org/sites/www.sierraclub.org/files/styles/sierra_full_page_width/public/slideshows/slide3.jpg?itok=g5BxckFW",
    "https://www.opodo.co.uk/blog/wp-content/uploads/sites/12/2018/11/natural-phenomena-6-720x480.jpg",
    "https://images.tpn.to/mr/es/kl/pt/content.jpg",
  ];

  const focusedId = "Story " + storyData.id;

  const maxWidthNode = 100;
  const minNodeSize = 10;
  const maxNodeSize = 50;

  let xScale, yScale, chart_xScale_minimum, chart_xScale_maximum;

  function linkArc(d) {
    // var px1 = getxFromId(d.source.id, xScale, maxWidthNode, width, focusedId);
    // var px2 = getxFromId(d.target.id, xScale, maxWidthNode, width, focusedId);
    var px1 = d.source.x;
    var px2 = d.target.x;
    var py1, py2;

    py1 = d.source.y;
    py2 = d.target.y;

    var dx = px2 - px1,
      dy = py2 - py1,
      dr = Math.sqrt(dx * dx + dy * dy);

    if (d.type === "GKRsimilarity") {
      return (
        'M' + px1 + ',' + py1 + 'L' + px2 + ',' + py2
      );
    }

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

      var nodes = createNodesData(storyData);
      var links = createLinksData(storyData, GKR_similarity_scores, dateRange);

      var simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(500))
        .force(
          'collision',
          d3
            .forceCollide()
            .radius(100)
            .iterations(8)
        )
        .force(
          'center',
          d3.forceCenter(0, 0)
        )
        .force("x", d3.forceX())
        .force("y", d3.forceY());

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
        .attr("refX", d => {
          if (d === "contributing" || d === "2ndlink") return 25;
          return 32;
        })
        .attr("refY", d => {
          if (d === "contributing" || d === "2ndlink") return -1.75;
          return -3;
        })
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", (d, i) => colorLink[i])
        .attr("d", "M0,-5L10,0L0,5");

      var link = svg.append("g")
        .attr("id", "in-link")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .selectAll("path");

      var node = svg.append("g")
        .attr("id", "in-node")
        .attr("fill", "currentColor")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .selectAll("g");

      const drawNetwork = () => {
        simulation.nodes(nodes);
        simulation.force("link").links(links);
        simulation.force("charge").initialize(nodes);
        simulation.force("collision").initialize(nodes);
        simulation.force("x").initialize(nodes);
        simulation.force("y").initialize(nodes);

        var new_nodes = node.data(nodes).join("g")
          .attr("id", d => `${d.id.replace(/\s+/g, '-').toLowerCase()}`)
          .call(drag(simulation));

        new_nodes.append("circle")
          .attr("fill", "white")
          .attr("r", d => {
            if (d.id === focusedId) return 45;
            let size = d.totalView / 50000000;
            size = Math.max(minNodeSize + 2, size);
            size = Math.min(maxNodeSize + 2, size);
            return `${size}`;
          });

        new_nodes.append("circle")
          .attr("class", "circle-color")
          .attr("fill", d => {
            if (d.id === focusedId) return colorNode[colorNode.length - 1];
            if (d.id === "Story 321") return colorNode[1];
            if (d.id === "Story 12") return colorNode[2];
            if (d.id === "Story 3974") return colorNode[3];
            if (d.id === "Story 279") return colorNode[4];
            if (d.id === "Story 842") return colorNode[5];
            if (d.id === "Story 703") return colorNode[6];
            if (d.id === "Story 610") return colorNode[7];
            return colorNode[0];
          })
          .attr("r", d => {
            if (d.id === focusedId) return 43;
            let size = d.totalView / 50000000;
            size = Math.max(minNodeSize, size);
            size = Math.min(maxNodeSize, size);
            return `${size}`;
          });

        new_nodes.append("text")
          .attr("x", 17)
          .attr("y", "0.31em")
          .text(d => {
            let text = d.id;
            if (d.id === focusedId) text += "\n(You are reading this story)";
            return text;
          })
          .attr("stroke", d => {
            if (d.id === focusedId) return "yellow";
            return "white";
          })
          .attr("stroke-width", 3)
          .attr("style", d => {
            if (d.id === focusedId) return `transform: translate(-20px,0px);`;
            return '';
          });

        new_nodes.append("text")
          .attr("x", 17)
          .attr("y", "0.31em")
          .text(d => {
            let text = d.id;
            if (d.id === focusedId) text += "\n(You are reading this story)";
            return text;
          })
          .attr("style", d => {
            if (d.id === focusedId) return `transform: translate(-20px,0px);`;
            return '';
          });

        node = new_nodes.merge(node);

        node.on('mouseover', event => mouseOverEvent(event));
        node.on('mouseleave', event => mouseLeaveEvent(event));

        var new_links = link.data(links).join("path")
          .attr("id", d => {
            let source_id = d.source.id.split(' ').pop();
            let target_id = d.target.id.split(' ').pop();
            return `link-${source_id}-${target_id}`
          })
          .attr("stroke", d => linkColorPick(d))
          .attr("marker-end", d => {
            if (d.type === "GKRsimilarity") return '';
            return `url(${new URL(`#arrow-${d.type}`, window.location)})`
          });

        link = new_links.merge(link);

        simulation.on("tick", () => {
          link
            .attr("d", linkArc)
            .attr('stroke-width', d => d.value / 5000000);
          node.attr("transform", d => `translate(${d.x},${d.y})`);
        });
      }

      drawNetwork();

      node.on('click', event => {
        setClickedStory(event.srcElement.parentElement.id);

        let current_story_id = event.srcElement.parentElement.id;
        if (current_story_id === "story-321") {
          if (nodes.length < 9) {
            nodes = pushNewNodesData(nodes, storyData, story321_data);
            links = pushNewLinksData(links, storyData, GKR_similarity_scores, story321_data, dateRange);
          }
          drawNetwork();
        } else if (current_story_id === focusedId.replace(' ', '-').toLowerCase()) {
          nodes = createNodesData(storyData);
          links = createLinksData(storyData, GKR_similarity_scores, dateRange);
          drawNetwork();
        }
      });

      node.on('mouseover', event => mouseOverEvent(event));
      node.on('mouseleave', event => mouseLeaveEvent(event));

      simulation.on("tick", () => {
        link
          .attr("d", linkArc)
          .attr('stroke-width', d => d.value / 5000000);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });
    }, []);

  const mouseOverEvent = (event) => {
    d3.select(event.srcElement.parentElement)
      .raise()
      .select('circle')
      .style('fill', "orange");
    d3.select(event.srcElement.parentElement)
      .raise()
      .select('text')
      .attr("stroke", "orange");

    let current_color = d3.select(event.srcElement.parentElement).select(".circle-color").attr("fill");
    let current_id = event.srcElement.parentElement.id;
    let current_imgSrc = img_src[3];
    if (current_id === "story-2") current_imgSrc = img_src[0];
    if (current_id === "story-321") current_imgSrc = img_src[1];
    if (current_id === "story-12") current_imgSrc = img_src[2];
    if (current_id === "story-3974") current_imgSrc = img_src[3];
    if (current_id === "story-279") current_imgSrc = img_src[0];
    if (current_id === "story-842") current_imgSrc = img_src[1];

    if (current_id === focusedId.replace(' ', '-').toLowerCase()) {
      setHoverStory(current_id, {
        title: storyData.title,
        author: storyData.author,
        imgSrc: current_imgSrc,
        totalViews: storyData.totalView,
        createdAt: storyData.createdAt,
        keywords: storyData.keywords,
        gkrSimilarityScore: -1,
        contributingViews: -1,
        receivedViews: -1,
        influenceScore: -1,
        color: current_color,
      });
    } else if (current_id === "other-sources") {
      setHoverStory(current_id, {});
    } else {
      storyData.neighbors.map(neighbor => {
        if (neighbor.id === current_id.split('-').pop()) {
          setHoverStory(current_id, {
            title: neighbor.title,
            author: neighbor.author,
            imgSrc: current_imgSrc,
            totalViews: neighbor.totalView,
            createdAt: neighbor.createdAt,
            keywords: neighbor.keywords,
            gkrSimilarityScore: 52354235,
            contributingViews: 23423,
            receivedViews: 234234,
            influenceScore: neighbor.influenceScore,
            color: current_color,
          });
        }
      });
    }
  }

  const mouseLeaveEvent = (event) => {
    d3.select(event.srcElement)
      .raise()
      .select('circle')
      .style('fill', 'white');
    d3.select(event.srcElement)
      .raise()
      .select('text')
      .attr("stroke", d => {
        if (d.id === focusedId) return "yellow";
        return "white";
      });
  }

  const linkColorPick = (d) => {
    if (d.type === types[0]) return colorLink[0];
    if (d.type === types[1]) return colorLink[1];
    if (d.type === types[2]) return colorLink[2];
    if (d.type === types[3]) return colorLink[3];
    return colorLink[0];
  }

  useEffect(() => {
    let svg = d3.select("#in-link");
    var links = createLinksData(storyData, GKR_similarity_scores, dateRange);
    svg.selectAll('path').attr("stroke-width", function (d, idx) {
      return links[idx].value / 5000000;
    })
  }, [dateRange]);

  return (
    <svg
      ref={ref}
    />
  );
}

export default InfluenceGraph;
