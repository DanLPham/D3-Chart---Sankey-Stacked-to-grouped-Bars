import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import { useD3 } from '../../Utilities/useD3';
import {
  createNodesData,
  createLinksData,
  getxFromId,
  convert2Epoch,
  getIdNumberFromId,
} from './utils';

const InfluenceGraph = ({ width, height, vbWidth, vbHeight, storyData, dateRange, mode, colorNode, colorLink, setHoverStory, setClickedStory, ...rest }) => {
  const types = ["contributing", "receiving", "GKRsimilarity"];
  const GKR_similarity_scores = [5324, 1231, 2542, 3241, 4212, 943];
  const img_src = [
    "https://d2pn8kiwq2w21t.cloudfront.net/images/jpegPIA24937.width-1320.jpg",
    "https://www.sierraclub.org/sites/www.sierraclub.org/files/styles/sierra_full_page_width/public/slideshows/slide3.jpg?itok=g5BxckFW",
    "https://www.opodo.co.uk/blog/wp-content/uploads/sites/12/2018/11/natural-phenomena-6-720x480.jpg",
    "https://images.tpn.to/mr/es/kl/pt/content.jpg",
  ];

  const nodes = createNodesData(storyData);
  var links = createLinksData(storyData, GKR_similarity_scores, dateRange);

  const focusedId = "Story " + storyData.id;

  const maxWidthNode = 100;

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

      const simulation = d3.forceSimulation(nodes)
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
        .attr("refX", d => {
          if (d === "contributing") return 25;
          return 32;
        })
        .attr("refY", d => {
          if (d === "contributing") return -1.75;
          return -3;
        })
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", (d, i) => colorLink[i])
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
        .attr("stroke", d => {
          if (d.type === types[0]) return colorLink[0];
          if (d.type === types[1]) return colorLink[1];
          if (d.type === types[2]) return colorLink[2];
          return colorLink[0];
        })
        .attr("marker-end", d => {
          // console.log("d:", d);
          if (d.type === "GKRsimilarity") return '';
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
        .attr("r", d => {
          if (d.id === focusedId) return 45;
          return `${d.totalView / 50000000 + 2}`;
        });

      node.append("circle")
        .attr("class", "circle-color")
        .attr("fill", d => {
          if (d.id === focusedId) return colorNode[colorNode.length - 1];
          if (d.id === "Story 321") return colorNode[1];
          if (d.id === "Story 12") return colorNode[2];
          if (d.id === "Story 3974") return colorNode[3];
          if (d.id === "Story 279") return colorNode[4];
          if (d.id === "Story 842") return colorNode[5];
          return colorNode[0];
        })
        .attr("r", d => {
          if (d.id === focusedId) return 43;
          return `${d.totalView / 50000000}`;
        });

      // node.append("defs")
      //   .append("clipPath")
      //   .attr("id", d => `circleimg-story-${getIdNumberFromId(d.id)}`)
      //   .append("circle")
      //   .attr("cx", d => `300`)
      //   .attr("cy", d => `75`)
      //   .attr("r", d => {
      //     if (d.id === focusedId) return 40;
      //     return `${d.totalView / 50000000 - 5}`;
      //   })
      //   .attr("fill");

      // node.append("image")
      //   .attr("xlink:href", d => {
      //     if (d.id === focusedId) return img_src[0];
      //     if (d.id === "Story 321") return img_src[1];
      //     if (d.id === "Story 12") return img_src[2];
      //     if (d.id === "Story 3974") return img_src[3];
      //     if (d.id === "Story 279") return img_src[0];
      //     if (d.id === "Story 842") return img_src[1];
      //   })
      //   .attr("clip-path", d => `url(#circleimg-story-${getIdNumberFromId(d.id)})`)
      //   .attr("width", () => {
      //     let current_img = new Image();
      //     current_img.src = img_src;
      //     // console.log(current_img.width, current_img.height);
      //     // return scaleImage()
      //     return "500";
      //   })
      //   .attr("height", "150")
      //   .attr("style", d => {
      //     return `transform: translate(-300px,-75px);`
      //   });

      node.append("text")
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

      node.append("text")
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

      node.on('click', event => {
        // console.log("Redirecting to " + event.srcElement.parentElement.id);
        setClickedStory(event.srcElement.parentElement.id);
        // showStoryInfoBox(event.srcElement.parentElement.id);
      });

      node.on('mouseover', event => {
        // console.log("Hovering " + event.srcElement.parentElement.id);
        // console.log(d3.select(event.srcElement.parentElement));
        d3.select(event.srcElement.parentElement)
          .raise()
          .select('circle')
          .style('fill', "orange");
        d3.select(event.srcElement.parentElement)
          .raise()
          .select('text')
          .attr("stroke", "orange");
        // showStoryInfoBox(event.srcElement.parentElement.id);

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
            imgSrc: current_imgSrc,
            totalViews: storyData.totalView,
            createdAt: storyData.createdAt,
            keywords: storyData.keywords,
            gkrSimilarityScore: -1,
            contributingViews: -1,
            receivedViews: -1,
            color: current_color,
          });
        } else if (current_id === "other-sources") {
          setHoverStory(current_id, {});
        } else {
          storyData.neighbors.map(neighbor => {
            if (neighbor.id === current_id.split('-').pop()) {
              setHoverStory(current_id, {
                title: neighbor.title,
                imgSrc: current_imgSrc,
                totalViews: neighbor.totalView,
                createdAt: neighbor.createdAt,
                keywords: neighbor.keywords,
                gkrSimilarityScore: 52354235,
                contributingViews: 23423,
                receivedViews: 234234,
                color: current_color,
              });
            }
          });
        }
      });

      node.on('mouseleave', event => {
        // console.log(event.srcElement)
        // console.log("Leave " + event.srcElement.id);
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
        // hideStoryInfoBox();
      });

      simulation.on("tick", () => {
        link
          .attr("d", linkArc)
          .attr('stroke-width', d => d.value / 5000000);
        node.attr("transform", d => {
          let new_x = getxFromId(d.id, xScale, maxWidthNode, width, focusedId);
          // return `translate(${new_x},${d.y})`
          return `translate(${d.x},${d.y})`
        });
      });

      // invalidation.then(() => simulation.stop());

      const storyInfoBox = svg.append('g');

      storyInfoBox
        .append('rect')
        .attr('id', 'otherInfobox')
        .attr("fill", "white")
        .attr("stroke", "DarkOliveGreen")
        .attr("stroke-width", 2);

      storyInfoBox.append("defs")
        .append("clipPath")
        .attr("id", "otherInfobox-clippath")
        .append("rect");

      storyInfoBox.append("image")
        .attr("id", "otherInfobox")
        .attr("clip-path", 'url(#otherInfobox-clippath)');

      storyInfoBox
        .append('text')
        .attr('id', 'otherInfobox')
        .attr('display', 'none')
        .style('font-size', '12px');

      const showStoryInfoBox = (storyId) => {
        // console.log("showStoryInfoBox", storyId);

        var img_width = 300;
        var img_height = 100;
        var box_width = img_width + 10;
        var box_height = img_height + 120;

        var xpos_node = d3.select(`#${storyId}`)._groups[0][0].__data__.x;
        // console.log(xpos_node)
        var xpos_infoText = xpos_node + 20;
        var ypos_node = d3.select(`#${storyId}`)._groups[0][0].__data__.y;
        var ypos_infoText = -80 + ypos_node;
        // if (ypos_infoText < chart_topMargin) {
        //   ypos_infoText += 180;
        // }

        svg.select('#otherInfobox-clippath').select("rect")
          .attr('x', xpos_infoText - 10)
          .attr('y', ypos_infoText - 15)
          .style("transform", `translate(${xpos_infoText * (-1)}px,${ypos_infoText * (-1)}px`)
          .attr('width', img_width)
          .attr('height', img_height);

        svg.select('image#otherInfobox')
          .attr("xlink:href", () => {
            // console.log(storyId);
            if (storyId === "story-2") return img_src[0];
            if (storyId === "story-321") return img_src[1];
            if (storyId === "story-12") return img_src[2];
            if (storyId === "story-3974") return img_src[3];
            if (storyId === "story-279") return img_src[0];
            if (storyId === "story-842") return img_src[1];
            return img_src[3];
          })
          .attr('width', img_width)
          // .attr('height', img_height)
          .style("transform", `translate(${xpos_infoText}px,${ypos_infoText - 8}px`);

        svg.select('text#otherInfobox')
          .attr('y', ypos_infoText + img_height)
          .attr('display', 'block')
          .html(
            '<tspan x="' +
            xpos_infoText +
            '" dy="0" font-weight="bold" font-size="18px">' +
            storyId +
            '</tspan><tspan x="' +
            xpos_infoText +
            '" dy="15">Total views: <tspan font-weight="bold" style="fill:DarkOliveGreen">' +
            10000000 +
            '</tspan> views</tspan><tspan x="' +
            xpos_infoText +
            '" dy="15">Created at: <tspan style="fill:DarkOliveGreen">' +
            '06/25/2022' +
            '</tspan></tspan><tspan x="' +
            xpos_infoText +
            '" dy="15">Keywords: <tspan style="fill:DarkOliveGreen">' +
            'Keyword 1, ' + 'Keyword 2, ' + 'Keyword 3' +
            '</tspan></tspan><tspan x="' +
            xpos_infoText +
            '" dy="15">GKR similarity score: <tspan style="fill:DarkOliveGreen">' +
            100000000 +
            '</tspan></tspan><tspan x="' +
            xpos_infoText +
            '" dy="15">Contributed <tspan style="fill:DarkOliveGreen">' +
            100000000 +
            '</tspan> views</tspan><tspan x="' +
            xpos_infoText +
            '" dy="15">Received <tspan style="fill:DarkOliveGreen">' +
            100000000 +
            '</tspan> views</tspan>'
          );

        // var textWidth = infotext.node().getBBox().width;
        svg.select('rect#otherInfobox')
          .attr('x', xpos_infoText - 10)
          .attr('y', ypos_infoText - 15)
          .attr('width', box_width)
          .attr('height', box_height)
          .attr('display', 'block');
      }

      const hideStoryInfoBox = () => {
        svg.select('rect#otherInfobox')
          .attr('display', 'none');

        svg.select('image#otherInfobox')
          .attr("xlink:href", "");

        svg.select('text#otherInfobox')
          .attr('display', 'none');
      }

    }, []);

  useEffect(() => {
    let svg = d3.select("#in-link");
    links = createLinksData(storyData, GKR_similarity_scores, dateRange);
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
