import * as d3 from 'd3';
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import './timeseries.css';

const drag = simulation => {
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3
    .drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
};

Date.prototype.toShortFormat = function () {
  let monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  let day = this.getDate();
  let monthIndex = this.getMonth();
  let monthName = monthNames[monthIndex];
  let year = this.getFullYear();
  // return monthName + ' ' + day + ', ' + year;
  return [year, monthIndex + 1, day].join('/');
};

function numFormatter(num) {
  var newNum = '';
  if (Math.abs(num) > 999999999)
    newNum = Math.sign(num) * (Math.abs(num) / 1000000000).toFixed(1) + 'B';
  else if (Math.abs(num) > 999999)
    newNum = Math.sign(num) * (Math.abs(num) / 1000000).toFixed(1) + 'M';
  else if (Math.abs(num) > 999)
    newNum = Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'K';
  else newNum = Math.sign(num) * Math.abs(num);
  return newNum === 0 ? '' : newNum;
}

function stringfy(id) {
  return '_' + id;
}

function markerEnd(d) {
  var scale = Math.max(6, Math.min(maxStroke * 2, strokeScale(d.flux)));
  return 'M0,-' + scale + 'L' + 2 * scale + ',0L0,' + scale;
}

const hcolor = '#f78ca0';
let radiusScale, strokeScale;
let padding_x = 15;
let rightMargin = 80;
let chart_yScale_minimum = 1000000;
let chart_xScale_minimum;
let chart_xScale_maximum;
let viewColourScale;
let egoNode, egoID, egoType, egoTime, simulation, neighbors, links;
let graphSorting, infSlider;
let graphSortingOpts = [
  'Force Directed',
  'Total View',
  'Contributed',
  'Received',
  'Author Name',
];
let chart_height, chart_topMargin;
let chart_yScale_view, chart_yScale_artist, startPos, topVideos;
let vis, visinfo, defs, viewcount, highlighted;
let xScale, yScale, yAxis, oldMaxView, viewCountPath;
const minStroke = 1;
const maxStroke = 20;
const maxRadius = 50;
const minRadius = 10;

class AttentionFlow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickedOnSong: false,
      clickedVideoID: null,
    };
  }

  componentDidMount() {
    this.divTitle = document.getElementById('egoTitle');
    this.divInfo = document.getElementById('egoInfo');
    this.divTimeline = document.getElementById('egoTimeline');
    this.drawTimePanel();
  }

  drawTimePanel() {
    console.log('drawTimePanel', this.props);
    egoNode = this.props.egoInfo;
    console.log('egoNode', egoNode, this.props.egoType);

    egoID = stringfy(egoNode.id);
    console.log("egoID:", egoID);

    this.canvasWidth = this.divTimeline.offsetWidth - padding_x * 2;
    this.chartHeight = 120;
    this.chartWidth = this.canvasWidth - padding_x * 2 - rightMargin;
    this.canvasHeight = this.chartHeight + 560;

    d3.select(this.refs.canvas)
      .selectAll('svg')
      .remove();
    const outer = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', this.canvasWidth)
      .attr('height', this.canvasHeight)
      .attr('pointer-events', 'all');
    vis = outer.append('g');
    visinfo = outer.append('g');
    defs = outer.append('defs');

    chart_xScale_minimum = new Date('2010-11-01');
    chart_xScale_maximum = new Date('2012-11-01');

    viewColourScale = d3
      .scaleSequential(d3.interpolateYlGnBu)
      .domain([
        chart_xScale_minimum.getYear(),
        chart_xScale_maximum.getYear() + 3,
      ]);

    this.drawEgoInfoCard();
    this.drawEgoViewCount();
    this.drawEgoNetwork();
    this.drawTimeSelector();
    this.drawAxes();

    infSlider.noUiSlider.set(1);
  }

  drawAxes() {
    viewcount
      .append('g')
      .attr('transform', 'translate(0,' + this.chartHeight + ')')
      .call(d3.axisBottom(xScale).tickFormat(''));
    yAxis = viewcount
      .append('g')
      .attr('transform', 'translate(' + startPos + ',0)')
      .call(d3.axisLeft(yScale).tickFormat(numFormatter));
  }

  drawTimeSelector() {
    var old = document.getElementById('timeRange');
    if (old) old.remove();

    let dateHeight = 30;
    let colorBarHeight = 20;
    let rangePaddingTop = 2;

    var range = document.createElement('div');
    range.id = 'timeRange';
    range.style.width = this.canvasWidth - padding_x * 2 - rightMargin + 'px';
    range.style.top = this.divTitle.offsetHeight + this.divInfo.offsetHeight + this.chartHeight + dateHeight + colorBarHeight + rangePaddingTop + 'px';
    range.style.left = this.divTimeline.offsetLeft + maxRadius + 'px';
    this.divTimeline.append(range);

    var egoCreatedAt = egoNode.createdAt;
    console.log("egoCreatedAt:", egoCreatedAt);
    var minTime = xScale.domain()[0].getTime();
    var maxTime = xScale.domain()[1].getTime();
    noUiSlider.create(range, {
      range: {
        min: minTime,
        max: maxTime,
      },
      connect: true,
      step: aDay(), // A day
      padding: [egoCreatedAt - minTime, aDay()],
      start: [egoCreatedAt, parseInt(minTime + (maxTime - minTime) * 0.98)],
    });

    var start_indicator = viewcount
      .append('line')
      .attr('id', 'startIndicator')
      .attr('y1', 0)
      .attr('y2', this.chartHeight + 525)
      .attr('display', 'none');
    var time_indicator = viewcount
      .append('line')
      .attr('id', 'egoIndicator')
      .attr('y1', 0)
      .attr('y2', this.chartHeight + 525)
      .attr('display', 'none');
    var other_indicator_pub = viewcount
      .append('path')
      .attr('id', 'otherIndicatorPub')
      .attr('display', 'none');
    var other_indicator = viewcount
      .append('line')
      .attr('id', 'otherIndicator')
      .attr('y1', 0)
      .attr('y2', this.chartHeight + 525)
      .attr('display', 'none');

    // add highlighted layer under timecover
    highlighted = viewcount.append('g');
    var time_cover_l = viewcount
      .append('rect')
      .attr('id', 'timeCover_left')
      .attr('class', 'timeCover')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', this.chartHeight + 525);
    var time_cover_r = viewcount
      .append('rect')
      .attr('id', 'timeCover_right')
      .attr('class', 'timeCover')
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', this.chartHeight + 525);

    egoTime = Math.floor(xScale.invert(0));
    var egoInfoBox = visinfo
      .append('text')
      .attr('id', 'egoInfoBox')
      .style('font-size', '12px');
    visinfo.append('rect').attr('id', 'otherInfobox');
    visinfo
      .append('text')
      .attr('id', 'otherInfobox')
      .attr('display', 'none');

    range.noUiSlider.on('update', updateTimeSlider);
    range.noUiSlider.on('set', updateTimeSlider);
  }

  drawEgoInfoCard() {
    // Set ego title
    // this.divTitle.innerHTML = '<h5><b>' + egoNode.title + '</b></h5>';
    this.divTitle.innerHTML = '<h5><b>Sankey chart</b></h5>';

    // update ego information
    this.divInfo.innerHTML = '';
    var infocard = document.createElement('div');
    infocard.id = 'egoInfoCard';

    var controlPanel = document.createElement('div');
    controlPanel.id = 'controlPanel';

    var infSliderLabel = document.createElement('div');
    infSlider = document.createElement('div');
    infSlider.id = 'infSlider';
    noUiSlider.create(infSlider, {
      range: {
        min: 0,
        max: 20,
      },
      step: 1,
      start: 1,
      pips: { mode: 'count', values: 5 },
    });

    var pips = infSlider.querySelectorAll('.noUi-value');
    for (var i = 0; i < pips.length; i++) {
      pips[i].style.cursor = 'pointer';
      pips[i].addEventListener('click', function () {
        var value = Number(this.getAttribute('data-value'));
        infSlider.noUiSlider.set(value);
      });
    }
    infSlider.noUiSlider.on('set.one', function () {
      var infVal = parseInt(infSlider.noUiSlider.get());
      infSliderLabel.innerHTML =
        '<b>Show stories with influence greater than (' + infVal + '%)</b>';
      filterNodes();
      simulation.restart();
    });

    var graphSortingLabel = document.createElement('div');
    graphSortingLabel.innerHTML = '<b>Sort along y-axis by</b>';

    graphSorting = document.createElement('SELECT');
    graphSorting.id = 'graphSorting';
    for (var o = 0; o < graphSortingOpts.length; o++) {
      var option = document.createElement('option');
      option.value = o;
      option.text = graphSortingOpts[o];
      graphSorting.add(option);
    }

    controlPanel.append(infSliderLabel);
    controlPanel.append(infSlider);
    controlPanel.append(graphSortingLabel);
    controlPanel.append(graphSorting);

    this.divInfo.append(controlPanel);
  }

  drawEgoViewCount() {
    viewcount = vis
      .append('g')
      .attr('transform', 'translate(' + maxRadius + ',' + 20 + ')');
    viewcount
      .append('rect')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)
      .attr('fill', 'transparent');

    var createdAt = new Date(egoNode.createdAt);
    console.log('createdAt:', createdAt);
    // console.log('drawEgoViewCount', createdAt, egoNode.dailyView.length);

    var data = [];
    for (var i = 0; i < egoNode.dailyView.length; i++) {
      data.push({
        date: new Date(createdAt.getTime() + aDay() * i),
        value: egoNode.dailyView[i],
      });
    }
    const chart_xScale_minimum = new Date('2010-11-30');
    xScale = d3
      .scaleTime()
      .domain([
        Math.min(
          chart_xScale_minimum,
          d3.min(data, function (d) {
            return d.date;
          })
        ),
        d3.max(data, function (d) {
          return d.date;
        }),
      ])
      .range([0, this.chartWidth]);
    yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, function (d) {
          return +d.value;
        }),
      ])
      .range([this.chartHeight, 0]);
    oldMaxView = yScale.domain()[1];
    startPos = xScale(
      d3.min(data, function (d) {
        return d.date;
      })
    );

    // coloring legend
    var secondYear = chart_xScale_minimum.getYear() + 1;
    var st = chart_xScale_minimum;
    for (var y = secondYear; y <= chart_xScale_maximum.getYear() + 1; y++) {
      var et = Math.min(chart_xScale_maximum, new Date(y + 1900, 0, 1));
      viewcount
        .append('rect')
        .attr('y', this.chartHeight)
        .attr('x', xScale(st))
        .attr('width', xScale(et) - xScale(st))
        .attr('height', 20)
        .attr('fill', viewColourScale(y));
      st = et;
    }

    viewCountPath = viewcount
      .append('path')
      .datum(data)
      .attr('class', 'viewcount')
      .attr(
        'd',
        d3
          .line()
          .x(function (d) {
            return xScale(d.date);
          })
          .y(function (d) {
            return yScale(d.value);
          })
      );
  }

  drawEgoNetwork() {
    const songsArr = egoNode.neighbors;
    const linksArr = egoNode.links;

    const strokeList = linksArr.map(link => link[2]);
    const viewsList = songsArr.map(d => Math.sqrt(d.totalView));

    strokeScale = d3
      .scaleLinear()
      .domain(d3.extent(strokeList))
      .range([minStroke, maxStroke]);

    radiusScale = d3
      .scaleLinear()
      .domain(d3.extent(viewsList))
      .range([minRadius, maxRadius]);

    const inDegreeList = songsArr.map(d => 19);
    const minInDegree = d3.min(inDegreeList);
    const maxInDegree = d3.max(inDegreeList);
    const colourScale = d3
      .scaleSequential(d3.interpolateRdPu)
      .domain([minInDegree, maxInDegree + 5]);

    const artistSet = new Set(songsArr.map(video => video.author));
    neighbors = songsArr.map(video => ({
      id: stringfy(video.id),
      name: video.title,
      radius: radiusScale(Math.sqrt(video.totalView)),
      colour: colourScale(19),
      totalView: video.totalView,
      dailyView: video.dailyView,
      artist: video.author,
      createdAt: new Date(video.createdAt),
      time: new Date(video.createdAt),
      startInfluence: new Date(video.createdAt + aDay() * video.dailyView.length),
      contributed: 0,
      received: 0,
    }));
    console.log("neighbors:", neighbors);

    links = linksArr.map(video => ({
      id: stringfy(video[0] + '_' + video[1]),
      source: stringfy(video[0]),
      target: stringfy(video[1]),
      flux: video[2],
      createdAt: new Date(video[3]),
      dailyFlux: video[4],
    }));
    console.log("links:", links);

    chart_height = 350;
    chart_topMargin = this.chartHeight + 70;
    const chart = vis.append('g');
    // const neighborTitles = songsArr.map(video => video.id);
    simulation = d3
      .forceSimulation(neighbors)
      .force(
        'link',
        d3
          .forceLink(links)
          .id(d => {
            console.log("d3 d link:", d);
            return d.id;
          })
          .strength(0.001)
      )
      .force(
        'collision',
        d3
          .forceCollide()
          .radius(function (d) {
            console.log("d3 d collision:", d.id, radiusScale(Math.sqrt(d.totalView)) + 10);
            return radiusScale(Math.sqrt(d.totalView)) + 10;
          })
          .iterations(10)
      )
      .force(
        'center',
        d3.forceCenter(this.canvasWidth / 2, chart_topMargin + chart_height / 2)
      );

    // var newDomain = [xScale.invert(0), xScale.invert(this.canvasWidth)];
    chart
      .append('g')
      .attr('transform', 'translate(' + maxRadius + ',' + chart_topMargin + ')')
      .call(d3.axisTop(xScale));

    // chart_yScale_view = d3
    //   .scaleLog()
    //   .domain([
    //     chart_yScale_minimum,
    //     5 *
    //     d3.max(neighbors, function (d) {
    //       return d.totalView;
    //     }),
    //   ])
    //   .range([chart_height, 0]);
    // // .nice();
    // chart_yScale_artist = d3
    //   .scaleBand()
    //   .domain([''].concat(Array.from(artistSet)))
    //   .range([0, chart_height]);
    var chart_y = chart.append('g');

    // defs
    //   .selectAll('marker')
    //   .data(links)
    //   .enter()
    //   .append('marker')
    //   .attr('id', d => 'arrow' + d.id)
    //   .attr('markerWidth', maxStroke * 2)
    //   .attr('markerHeight', maxStroke * 2)
    //   .attr('markerUnits', 'userSpaceOnUse')
    //   .attr(
    //     'viewBox',
    //     '0 -' + [maxStroke, maxStroke * 2, maxStroke * 2].join(' ')
    //   )
    //   .attr('refX', d => 10 + d.target.radius)
    //   .attr('refY', 0)
    //   .attr('orient', 'auto')
    //   .append('path')
    //   .attr('d', d => markerEnd(d))
    //   .style('fill', d => (d.target.id === egoID ? 'steelblue' : '#f78ca0'));

    var link = chart
      .append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('class', 'edge')
      .attr('id', d => d.id);
    // .attr('marker-end', d => 'url(#arrow_' + d.id + ')');

    var neighbor = chart
      .append('g')
      .selectAll('g')
      .data(neighbors)
      .enter()
      .append('g');

    // Add gradient circles
    var grads = chart
      .append('defs')
      .selectAll('radialGradient')
      .data(neighbors)
      .enter()
      .append('radialGradient')
      .attr('gradientUnits', 'objectBoundingBox')
      .attr('id', d => 'grad' + d.id);

    neighbor
      .append('circle')
      .call(drag(simulation))
      .attr('id', d => {
        console.log("neighbor append circle id:", d.id);
        return d.id;
      })
      .attr('class', 'node')
      .attr('fill', d => `url(#grad${d.id})`);
    console.log("neighbor append circle:", neighbor);

    neighbors.sort((a, b) => a.radius - b.radius);
    const radiusLimit = minRadius * 1.5;
    console.log("radiusLimit:", radiusLimit)
    neighbor
      .append('text')
      .call(drag(simulation))
      .attr('class', 'node')
      .text(function (d) {
        return d.name.split('-')[1];
      })
      .attr('x', function (d) {
        return -2.5 * (1 + !d.name ? 0 : d.name.length);
      })
      .attr('y', 3)
      .style('visibility', function (d) {
        if (d.id === egoID) return 'visible';
        else return d.radius > radiusLimit ? 'visible' : 'hidden';
      });
    console.log("neighbor without s:", neighbor)

    neighbor.on('click', d => {
      console.log(d);
      // if (d.id === egoID) return;
    });

    neighbor.on('mouseover', function (d) {
      if (d.id === egoID) return;
      d3.select(this)
        .raise()
        .select('circle')
        .style('fill', hcolor);
      d3.select(this)
        .raise()
        .select('text')
        .style('visibility', 'visible');
      showOtherSongViewCount(d);
    });

    neighbor.on('mouseleave', function (d) {
      d3.select(this)
        .raise()
        .select('circle')
        .style('fill', d => `url(#grad${d.id})`);
      d3.select(this)
        .raise()
        .select('text')
        .style('visibility', function (d) {
          if (d.id === egoID) return 'visible';
          else return d.radius > radiusLimit ? 'visible' : 'hidden';
        });
      hideOtherSongViewCount(d);
    });

    graphSorting.addEventListener('change', function () {
      var sortingOpt = graphSortingOpts[graphSorting.value];
      if (sortingOpt === 'Force Directed') {
        chart_y.attr('display', 'none');
      } else if (
        sortingOpt === 'Total View' ||
        sortingOpt === 'Contributed' ||
        sortingOpt === 'Received'
      ) {
        chart_y
          .attr('display', 'block')
          .attr(
            'transform',
            'translate(' + (startPos + maxRadius) + ',' + chart_topMargin + ')'
          )
          .call(
            d3
              .axisLeft(chart_yScale_view)
              .ticks(5)
              .tickFormat(numFormatter)
          );
      } else if (sortingOpt === 'Artist Name') {
        chart_y
          .attr('display', 'block')
          .attr(
            'transform',
            'translate(' + (startPos + maxRadius) + ',' + chart_topMargin + ')'
          )
          .call(d3.axisLeft(chart_yScale_artist));
      }
      simulation.restart();
    });

    simulation.on('tick', () => {
      // ## this code makes neighbors NOT bounded in the panel
      neighbor
        .attr('display', function (d) {
          if (d.id === egoID) return 'block';
          // console.log(d.id, d.isVisible, '\n' + new Date(d.startInfluence.getTime()).toString(), '\n' + new Date(egoTime).toString());
          if (d.isVisible && d.startInfluence.getTime() <= egoTime)
            return 'block';
          else return 'block';
        })
        .attr('cx', function (d) {
          if (d.id === egoID) return maxRadius + xScale(egoTime);
          if (d.startInfluence.getTime() <= egoTime) {
            return maxRadius + xScale(d.startInfluence);
          }
        })
        .attr('cy', function (d) {
          var sortingOpt = graphSortingOpts[graphSorting.value];
          if (sortingOpt === 'Force Directed') {
            return Math.min(
              chart_topMargin + chart_height - 20,
              Math.max(chart_topMargin + 20, d.y)
            );
          } else if (sortingOpt === 'Total View') {
            return (
              chart_topMargin +
              chart_yScale_view(Math.max(chart_yScale_minimum, d.viewSum))
            );
          } else if (sortingOpt === 'Contributed') {
            return (
              chart_topMargin +
              chart_yScale_view(Math.max(chart_yScale_minimum, d.contributed))
            );
          } else if (sortingOpt === 'Received') {
            return (
              chart_topMargin +
              chart_yScale_view(Math.max(chart_yScale_minimum, d.received))
            );
          } else if (sortingOpt === 'Artist Name') {
            return (
              chart_topMargin +
              chart_yScale_artist.bandwidth() / 2 +
              chart_yScale_artist(d.artist)
            );
          }
        })
        .attr('transform', function (d) {
          var new_x = maxRadius + xScale(d.startInfluence);
          var new_y;
          var sortingOpt = graphSortingOpts[graphSorting.value];
          if (sortingOpt === 'Force Directed') {
            new_y = Math.min(
              chart_topMargin + chart_height - 20,
              Math.max(chart_topMargin + 20, d.y)
            );
          } else if (sortingOpt === 'Total View') {
            new_y =
              chart_topMargin +
              chart_yScale_view(Math.max(chart_yScale_minimum, d.viewSum));
          } else if (sortingOpt === 'Contributed') {
            new_y =
              chart_topMargin +
              chart_yScale_view(Math.max(chart_yScale_minimum, d.contributed));
          } else if (sortingOpt === 'Received') {
            new_y =
              chart_topMargin +
              chart_yScale_view(Math.max(chart_yScale_minimum, d.received));
          } else if (sortingOpt === 'Artist Name') {
            new_y =
              chart_topMargin +
              chart_yScale_artist.bandwidth() / 2 +
              chart_yScale_artist(d.artist);
          }
          if (d.id === egoID) {
            new_x = maxRadius + xScale(egoTime);
            // new_y = chart_topMargin;
          }
          return `translate(${new_x},${new_y})`;
        });
      link
        .attr('d', linkArc)
        .attr('stroke-width', d => d.value)
        .attr('display', function (d) {
          if (
            (d.source.isVisible &&
              d.target.isVisible &&
              d.source.startInfluence.getTime() <= egoTime &&
              d.target.startInfluence.getTime() <= egoTime) ||
            (d.source.isVisible &&
              d.source.startInfluence.getTime() <= egoTime &&
              d.target.id === egoID) ||
            (d.target.isVisible &&
              d.target.startInfluence.getTime() <= egoTime &&
              d.source.id === egoID)
          )
            return 'block';
          else return 'none';
        });
    });
  }

  redraw(transition) {
    // if mouse down then we are dragging not panning
    // if (this.neighborMouseDown) return;
    (transition ? vis.transition() : vis).attr('transform', d3.event.transform);
  }

  render() {
    if (this.state.clickedOnSong === true) {
      console.log('redirecting');
      console.log(this.state);
      let suffix = '';
      if (this.props.egoType === 'A') {
        suffix = 'artist';
      } else if (this.props.egoType === 'V') {
        suffix = 'video';
      } else if (this.props.egoType === 'W') {
        suffix = 'wiki';
      }
      return (
        <Navigate
          push
          to={`/overview/${suffix}/${this.state.clickedVideoID}`}
        />
      );
    }
    return <div ref="canvas" />;
  }
}

function gradColour(d, ts, te) {
  const nPoints = d.dailyView.length;
  const curRange = getTimeSelection();
  const minTime = chart_xScale_minimum.getTime();
  const startR = parseInt(
    Math.max(0, (curRange[0].getTime() - d.createdAt.getTime()) / aDay())
  );
  const endR = parseInt(
    Math.min(
      d.dailyView.length,
      (curRange[1].getTime() - d.createdAt.getTime()) / aDay()
    )
  );
  // var step = d3.scaleLinear().domain([1, 5])
  //   .range([chart_xScale_minimum.getYear(), chart_xScale_maximum.getYear()]);
  // const viewColourScale = d3.scaleLinear()
  //   .range(['#f78ca0', '#FFE1E6', '#FFFFFF', '#B5DCFF', 'steelblue'])
  //   .domain([step(1), step(2), step(3), step(4), step(5)])
  //   .interpolate(d3.interpolateHcl);
  const currentTime = new Date(
    d.createdAt.getTime() + te * (1000 * 60 * 60 * 24)
  );
  const nTotalViews = d.dailyView
    .slice(startR, endR)
    .reduce((a, b) => a + b, 0);
  const nViews = d.dailyView.slice(startR, te).reduce((a, b) => a + b, 0);
  const offset = Math.min(100, 100 * Math.sqrt(nViews / nTotalViews));
  // if (d.name == "Adele - Rolling in the Deep")
  //   console.log(d.name, d.createdAt.getYear(), startR, endR, te, offset, currentTime.getYear()+1900);
  return [offset, viewColourScale(currentTime.getYear())];
}

function changeNodeGradient() {
  var smoothness = 0;
  neighbors.forEach(function (neighbor) {
    var numDays = neighbor.dailyView.length;
    var secondYear = new Date(1901 + neighbor.createdAt.getYear(), 0, 1);
    var startIdx = parseInt(
      (secondYear.getTime() - neighbor.createdAt.getTime()) / aDay()
    );
    var unit = 365;
    var prevOffset = 0;
    var prevIndex = 0;
    d3.selectAll('radialGradient#grad' + neighbor.id)
      .selectAll('*')
      .remove();
    for (var trange = startIdx; trange < numDays + unit; trange += unit) {
      // console.log("trange", prevIndex, trange, numDays);
      var grad = gradColour(neighbor, prevIndex, Math.min(numDays, trange));
      d3.selectAll('radialGradient#grad' + neighbor.id)
        .append('stop')
        .attr('offset', `${prevOffset + smoothness}%`)
        .style('stop-color', grad[1]);
      d3.selectAll('radialGradient#grad' + neighbor.id)
        .append('stop')
        .attr('offset', `${grad[0] - smoothness}%`)
        .style('stop-color', grad[1]);
      prevIndex = trange;
      prevOffset = grad[0];
    }
  });
}

function getTimePositionX() {
  var mouseX = Math.max(0, mouse.x - getWindowLeftMargin());
  var trange = getTimeSelection();
  var xMin = xScale(trange[0]);
  var xMax = xScale(trange[1]);
  return Math.max(xMin, Math.min(mouseX, xMax));
}

function getTimeSelection() {
  var tSlider = document.getElementById('timeRange');
  if (tSlider == null) return [chart_xScale_minimum, chart_xScale_maximum];
  var range = tSlider.noUiSlider.get('range');
  return [new Date(parseInt(range[0])), new Date(parseInt(range[1]) - aDay())];
}

function getWindowLeftMargin() {
  var div = document.getElementById('egoTimeline');
  return div.getBoundingClientRect().x;
}

function calculateViewCount(minTime, maxTime) {
  var egoViewSum;
  for (var i = 0; i < neighbors.length; i++) {
    // console.log("calculateView neighbors:", neighbors[i]);
    var n = document.getElementById(neighbors[i].id);
    var viewSum = neighborSize(neighbors[i], minTime, maxTime);
    var radius = radiusScale(Math.sqrt(viewSum));
    neighbors[i]['viewSum'] = viewSum;
    neighbors[i]['radius'] = radius;
    n.style.r = radius;
    if (neighbors[i].id === egoID) egoViewSum = viewSum;
  }
  for (var i = 0; i < links.length; i++) {
    var fluxSum = linkWeight(links[i], minTime, maxTime);
    links[i]['fluxSum'] = fluxSum;
    links[i].value = strokeScale(fluxSum);
  }
  return egoViewSum;
}

function aDay() {
  return 3600 * 1000 * 24;
}

function filterNodes() {
  // var starttime = Date.now();
  var minScale = xScale.domain()[0].getTime();
  var maxScale = xScale.domain()[1].getTime();
  var trange = getTimeSelection();
  var infSlider = document.getElementById('infSlider').noUiSlider;

  for (var i = 0; i < neighbors.length; i++) {
    neighbors[i].startInfluence = xScale.domain()[1];
    neighbors[i].isVisible = false;
  }
  for (var tick = minScale; tick < maxScale; tick += aDay() * 30) {
    var egoViewSum = calculateViewCount(trange[0].getTime(), tick);
    for (var i = 0; i < links.length; i++) {
      var d = links[i];
      var curTime = new Date(tick);
      if (
        d.source.startInfluence > curTime &&
        d.target.id === egoID &&
        d.fluxSum > (infSlider.get() / 100.0) * egoViewSum
      ) {
        // console.log("D", d.source.name, d.source.createdAt, curTime);
        d.source.startInfluence = curTime;
      }
    }
  }
  var egoViewSum = calculateViewCount(trange[0].getTime(), egoTime);
  for (var i = 0; i < neighbors.length; i++) {
    if (neighbors[i].contributed > (infSlider.get() / 100.0) * egoViewSum)
      neighbors[i].isVisible = true;
  }
  // console.log("filterNodes", Date.now()-starttime);
}

function neighborSize(d, minTime, maxTime) {
  var createdAt = d.createdAt.getTime();
  var ts = Math.max(
    0,
    Math.min(d.dailyView.length, parseInt((minTime - createdAt) / aDay()))
  );
  var te = Math.max(
    0,
    Math.min(d.dailyView.length, parseInt((maxTime - createdAt) / aDay()))
  );
  return d.dailyView.slice(ts, te).reduce((a, b) => a + b, 0);
}

function linkWeight(d, minTime, maxTime) {
  var createdAt = d.createdAt.getTime();
  var ts = Math.max(
    0,
    Math.min(d.dailyFlux.length, parseInt((minTime - createdAt) / aDay()))
  );
  var te = Math.max(
    0,
    Math.min(d.dailyFlux.length, parseInt((maxTime - createdAt) / aDay()))
  );
  var sum = d.dailyFlux.slice(ts, te).reduce((a, b) => a + b, 0);
  d.source.contributed = d.target.received = sum;
  return sum;
}

function arraysum(total, num) {
  return total + num;
}

function linkArc(d) {
  var px1 = maxRadius + xScale(d.source.startInfluence);
  var px2 = maxRadius + xScale(d.target.startInfluence);
  var py1, py2;
  var sortingOpt = graphSortingOpts[graphSorting.value];
  if (sortingOpt === 'Force Directed') {
    py1 = Math.min(
      chart_topMargin + chart_height - 20,
      Math.max(chart_topMargin + 20, d.source.y)
    );
    py2 = Math.min(
      chart_topMargin + chart_height - 20,
      Math.max(chart_topMargin + 20, d.target.y)
    );
  } else if (sortingOpt === 'Total View') {
    var ypos1 = chart_yScale_view(
      Math.max(chart_yScale_minimum, d.source.viewSum)
    );
    var ypos2 = chart_yScale_view(
      Math.max(chart_yScale_minimum, d.target.viewSum)
    );
    py1 = chart_topMargin + ypos1;
    py2 = chart_topMargin + ypos2;
  } else if (sortingOpt === 'Contributed') {
    var ypos1 = chart_yScale_view(
      Math.max(chart_yScale_minimum, d.source.contributed)
    );
    var ypos2 = chart_yScale_view(
      Math.max(chart_yScale_minimum, d.target.contributed)
    );
    py1 = chart_topMargin + ypos1;
    py2 = chart_topMargin + ypos2;
  } else if (sortingOpt === 'Received') {
    var ypos1 = chart_yScale_view(
      Math.max(chart_yScale_minimum, d.source.received)
    );
    var ypos2 = chart_yScale_view(
      Math.max(chart_yScale_minimum, d.target.received)
    );
    py1 = chart_topMargin + ypos1;
    py2 = chart_topMargin + ypos2;
  } else if (sortingOpt === 'Artist Name') {
    py1 =
      chart_topMargin +
      chart_yScale_artist.bandwidth() / 2 +
      chart_yScale_artist(d.source.artist);
    py2 =
      chart_topMargin +
      chart_yScale_artist.bandwidth() / 2 +
      chart_yScale_artist(d.target.artist);
  }

  if (d.source.id === egoID) {
    px1 = maxRadius + xScale(egoTime);
  }
  if (d.target.id === egoID) {
    px2 = maxRadius + xScale(egoTime);
  }

  var dx = px2 - px1,
    dy = py2 - py1,
    dr = Math.sqrt(dx * dx + dy * dy);
  if (d.source.id === d.target.id && d.source.id === egoID) {
    var drs = d.source.radius;
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

function updateTimeSlider(values, handle, unencoded, isTap, positions) {
  if (handle === 0) {
    // left handle
    var m_pos = xScale(values[0]);
    d3.select('#startIndicator')
      .attr('x1', m_pos)
      .attr('x2', m_pos)
      .attr('display', 'block');
    d3.select('#timeCover_left').attr('width', m_pos);
  } else if (handle === 1) {
    // right handle
    var m_pos = xScale(values[1]);
    egoTime = parseInt(values[1]);
    console.log("updateTimeSlider - egoTime:", new Date(egoTime).toString())
    d3.select('#egoIndicator')
      .attr('x1', m_pos)
      .attr('x2', m_pos)
      .attr('display', 'block');
    var chartWidth = document
      .getElementById('timeRange')
      .getBoundingClientRect().width;
    d3.select('#timeCover_right')
      .attr('x', m_pos + 1)
      .attr('width', chartWidth - m_pos);

    var egoCircle = d3.select('circle#' + egoID);
    // console.log("egoID:", egoID);
    // console.log("egoCircle:", egoCircle);
    // console.log("egoCircle.node():", egoCircle.node());
    // console.log("egoCircle.node().parentNode:", egoCircle.node().parentNode);
    var ego_ypos = d3.select(egoCircle.node().parentNode).attr('cy');
    var pos_y = (pos_y = 30 + parseFloat(ego_ypos));
    var viewSum = egoCircle.data()[0].viewSum;

    d3.select('#egoInfoBox')
      .attr('y', pos_y)
      .html(
        '<tspan x="' +
        (maxRadius + m_pos + 15) +
        '" dy="0">' +
        numFormatter(viewSum) +
        ' views</tspan>' +
        '<tspan x="' +
        (maxRadius + m_pos + 15) +
        '" dy="15">' +
        new Date(egoTime).toShortFormat() +
        '</tspan>'
      );
  }
  calculateViewCount(values[0], egoTime);
  filterNodes();
  changeNodeGradient();
  simulation.restart();
}

function hideOtherSongViewCount(othersong) {
  viewcount.select('path#otherIndicatorPub').attr('display', 'none');
  viewcount.select('line#otherIndicator').attr('display', 'none');
  visinfo.select('rect#otherInfobox').attr('display', 'none');
  visinfo.select('text#otherInfobox').attr('display', 'none');
  var incoming = d3.select('path#' + othersong.id + egoID);
  if (incoming) {
    incoming.attr('class', 'edge').attr('marker-end', 'none');
  }
  var outgoing = d3.select('path#' + egoID + othersong.id);
  if (outgoing) {
    outgoing.attr('class', 'edge').attr('marker-end', 'none');
  }

  yScale.domain([0, oldMaxView]);
  yAxis.call(d3.axisLeft(yScale).tickFormat(numFormatter));
  viewCountPath.attr(
    'd',
    d3
      .line()
      .x(function (d) {
        return xScale(d.date);
      })
      .y(function (d) {
        return yScale(d.value);
      })
  );
  highlighted.attr('display', 'none');
}

function showOtherSongViewCount(othersong) {
  // console.log('othersong.id', othersong.id, egoID);
  var createdAt = new Date(othersong.createdAt);

  var edgeToEgo = d3.select('path#' + othersong.id + egoID);
  var viewToEgo = 0;
  if (edgeToEgo.data()[0]) {
    edgeToEgo.attr('class', 'edge incoming');
    if (othersong.id !== egoID)
      edgeToEgo.attr('marker-end', d => 'url(#arrow' + d.id + ')');
    viewToEgo = parseInt(edgeToEgo.data()[0].fluxSum).toLocaleString();
  }
  var edgeFromEgo = d3.select('path#' + egoID + othersong.id);
  var viewFromEgo = 0;
  if (edgeFromEgo.data()[0]) {
    edgeFromEgo.attr('class', 'edge outgoing');
    if (othersong.id !== egoID)
      edgeFromEgo.attr('marker-end', d => 'url(#arrow' + d.id + ')');
    viewFromEgo = parseInt(edgeFromEgo.data()[0].fluxSum).toLocaleString();
  }

  var otherNode = d3.select('circle#' + othersong.id).node();
  var xpos = xScale(createdAt);
  var xpos_influence = xScale(othersong.startInfluence);
  var xpos_infoText = maxRadius + xpos_influence + 15;
  var ypos = parseFloat(d3.select(otherNode.parentNode).attr('cy'));
  var ypos_infoText = -90 + ypos;
  if (ypos_infoText < chart_topMargin) {
    ypos_infoText += 180;
  }
  var delayArea = [
    [xpos, 0],
    [xpos, chart_topMargin - 20],
    [xpos_influence, ypos],
    [xpos_influence, 0],
  ];
  viewcount
    .select('path#otherIndicatorPub')
    .attr('d', d3.line()(delayArea))
    .attr('display', 'block');
  viewcount
    .select('line#otherIndicator')
    .attr('x1', xpos_influence)
    .attr('x2', xpos_influence)
    .attr('display', 'block');

  var timeLeft = new Date(Math.max(getTimeSelection()[0], createdAt));
  var infotext = visinfo
    .select('text#otherInfobox')
    .attr('y', ypos_infoText)
    .attr('display', 'block')
    .html(
      '<tspan x="' +
      xpos_infoText +
      '" dy="0" font-weight="bold">' +
      othersong.name +
      '</tspan><tspan x="' +
      xpos_infoText +
      '" dy="15">' +
      numFormatter(othersong.viewSum) +
      ' views (' +
      timeLeft.toShortFormat() +
      ' ~ ' +
      new Date(egoTime).toShortFormat() +
      ')</tspan><tspan x="' +
      xpos_infoText +
      '" dy="15">Contribute <tspan style="fill:blue">' +
      viewToEgo +
      '</tspan> views</tspan>' +
      (parseInt(viewFromEgo) > 0
        ? '<tspan x="' +
        xpos_infoText +
        '" dy="15">Receive <tspan style="fill:red">' +
        viewFromEgo +
        '</tspan> views</tspan>'
        : '')
    );

  var textWidth = infotext.node().getBBox().width;
  visinfo
    .select('rect#otherInfobox')
    .attr('x', xpos_infoText - 10)
    .attr('y', ypos_infoText - 15)
    .attr('width', textWidth + 20)
    .attr('height', 70)
    .attr('display', 'block');

  var data = [];
  for (var i = 0; i < othersong.dailyView.length; i++) {
    data.push({
      date: new Date(createdAt.getTime() + aDay() * i),
      value: othersong.dailyView[i],
    });
  }

  let new_max = d3.max(data, function (d) {
    return +d.value;
  });
  if (yScale.domain()[1] < new_max) {
    yScale.domain([0, new_max]);
  }
  yAxis.call(d3.axisLeft(yScale).tickFormat(numFormatter));
  viewCountPath.attr(
    'd',
    d3
      .line()
      .x(function (d) {
        return xScale(d.date);
      })
      .y(function (d) {
        return yScale(d.value);
      })
  );
  // yScale = d3.scaleLinear()
  //   .domain([0, d3.max(data, function(d) { return +d.value; })])
  //   .range([ this.chartHeight, 0 ]);
  highlighted.selectAll('*').remove();
  highlighted
    .append('path')
    .datum(data)
    .attr('class', 'viewcount_other')
    .attr(
      'd',
      d3
        .line()
        .x(function (d) {
          return xScale(d.date);
        })
        .y(function (d) {
          return yScale(d.value);
        })
    );
  highlighted.attr('display', 'block');
}

export default AttentionFlow;

var mouse = {
  x: 0,
  y: 0,
  startX: 0,
  startY: 0,
};
function setMousePosition(e) {
  var ev = e || window.event; //Moz || IE
  if (ev.pageX) {
    //Moz
    mouse.x = ev.pageX + window.pageXOffset;
    mouse.y = ev.pageY + window.pageYOffset;
  } else if (ev.clientX) {
    //IE
    mouse.x = ev.clientX + document.body.scrollLeft;
    mouse.y = ev.clientY + document.body.scrollTop;
  }
  mouse.x -= padding_x * 2;
  // console.log(mouse)
}
