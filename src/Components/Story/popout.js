import axios from 'axios';
import * as d3 from 'd3';
import * as dailyViewJSON from './dailyView.json';

export function getStoryInfo(d, tooltip) {
  console.log('debug');
  console.log(d);
  const options = {
    params: {
      id: d.id,
    },
  };
  console.log(d.id);
  axios
    .get('/vevo/video_info/', options)
    .then(res => {
      if (res.data.error) {
        console.log('error');
      } else {
        const { artist } = res.data;
        const { totalViews } = res.data;
        const { genre } = res.data;
        const publishDate = new Date(res.data.publishDate);
        const { averageWatch } = res.data;
        const { channelID } = res.data;
        const { duration } = res.data;
        const { dailyViews } = res.data;
        drawPopout(
          d.id,
          artist,
          totalViews,
          genre,
          publishDate,
          averageWatch,
          channelID,
          duration,
          dailyViews,
          tooltip
        );
      }
    })
    .catch(function (error) {
      console.error(error);
    });

  const { artist1 } = "Adele";
  const { totalViews1 } = 12323542342;
  const { genre1 } = ["genre1", "genre2"];
  const publishDate1 = new Date(1291159752000);
  const { averageWatch1 } = 129483276;
  const { channelID1 } = "UComP_epzeKzvBX156r6pm1Q";
  const { duration1 } = "PT3M54S";
  const { dailyViews1 } = dailyViewJSON;
  console.log("artist1", artist1)
  drawPopout(
    d.id,
    artist1,
    totalViews1,
    genre1,
    publishDate1,
    averageWatch1,
    channelID1,
    duration1,
    dailyViews1,
    tooltip
  );
}

function drawPopout(
  title,
  artist,
  totalViews,
  genre,
  publishDate,
  averageWatch,
  channelID,
  duration,
  dailyViews,
  tooltip
) {
  const averageWatchWidth =
    ((averageWatch * 60) / timeInSeconds(duration)) * 430;

  tooltip.html(
    `${'<div style="background-color:dimgrey;height:100px;width:200px;margin-right:10px;display:inline-block;float:left;position:relative;">' +
    '<div style="background-color:black;position:absolute;bottom:5px;right:5px;height:15px;color:white;font-size:10px;padding-right:2px;padding-left:2px">'}${formatTime(
      duration
    )}</div>` +
    `</div>` +
    `<div id="songInfo"style="height:100px;width:220px;display:inline-block;">` +
    `<h6>${title}</h6>` +
    `<p style="color:#656565;">${artist}</br>${d3.format('.3s')(
      totalViews
    )} views &#183 ${publishDate.toLocaleDateString(publishDate, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}</p>` +
    `</div>` +
    `<br/>${formatGenres(genre)}<br/>` +
    `<div style="height:30px;width:430px;background-color:grey;position:relative;z-index:150;vertical-align:middle">` +
    `<div style="background-color:limegreen;position:absolute;bottom:0px;left:0px;z-index:151;height:30px;width:${averageWatchWidth}px;">` +
    `</div>` +
    `<p style="z-index:152;position:absolute;margin-top:4px;margin-left:5px">Average Watch Time: ${Math.floor(
      averageWatch
    )}:${Math.round((averageWatch % 1) * 60) < 10 ? '0' : ''}${Math.round(
      (averageWatch % 1) * 60
    )}/${formatTime(duration)}</p>` +
    `</div>` +
    `<br/>` +
    `Daily Views` +
    `<br/>` +
    `<div id='dailyViewsGraph'></div>`
  );

  const graphWidth = 430;
  const graphHeight = 100;
  const viewsArray = JSON.parse(dailyViews);

  const dailyViewsGraph = d3
    .select('#dailyViewsGraph')
    .append('svg')
    .attr('width', graphWidth)
    .attr('height', graphHeight);

  const x = d3
    .scaleLinear()
    .domain([0, viewsArray.length])
    .range([40, graphWidth - 1]);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(viewsArray)])
    .range([graphHeight - 10, 10]);

  const xAxis = d3
    .axisBottom()
    .scale(x)
    .tickValues([]);
  const yAxis = d3
    .axisLeft()
    .scale(y)
    .ticks(7)
    .tickFormat(d3.format('.3s'));
  dailyViewsGraph
    .append('g')
    .attr('transform', 'translate(0,90)')
    .call(xAxis);
  dailyViewsGraph
    .append('g')
    .attr('transform', 'translate(40,0)')
    .call(yAxis);

  dailyViewsGraph
    .append('path')
    .datum(viewsArray)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1.5)
    .attr(
      'd',
      d3
        .line()
        .x((d, i) => x(i))
        .y(d => y(d))
    );
}

function formatTime(timeString) {
  if (timeString === null) {
    return null;
  }
  let finalArr = [];
  const len = timeString.length;
  for (let i = 1; i <= len; i++) {
    if (timeString.charAt(len - i) === 'M') {
      if (finalArr.length === 0) {
        finalArr = [':', '0', '0'];
      } else if (finalArr.length === 1) {
        finalArr.unshift(':', '0');
      } else {
        finalArr.unshift(':');
      }
    } else if (timeString.charAt(len - i) === 'H') {
      if (finalArr.length === 3) {
        finalArr.unshift(':', '0', '0');
      } else if (finalArr.length === 4) {
        finalArr.unshift(':', '0');
      } else {
        finalArr.unshift(':');
      }
    } else if (timeString.charAt(len - i) === 'T') {
      return finalArr.join('');
    } else if (timeString.charAt(len - i) !== 'S') {
      finalArr.unshift(timeString.charAt(len - i));
    }
  }
}

function formatGenres(genreString) {
  if (genreString === null) {
    return null;
  }
  let arr = genreString.slice(2, -2).split("', '");
  arr = arr.filter(genre => genre !== 'Music');
  if (arr.length === 0) {
    return 'Genre: Other';
  }
  let output = arr.length > 1 ? 'Genres: ' : 'Genre: ';
  arr.forEach(genre => (output += `${genre.split('_').join(' ')}, `));
  return output.slice(0, -2);
}

function timeInSeconds(time) {
  if (time === null) {
    return null;
  }
  let total = 0;
  let multiplier = 1;
  const len = time.length;
  for (let i = 1; i <= len; i++) {
    if (time.charAt(len - i) === 'M') {
      multiplier = 60;
    } else if (time.charAt(len - i) === 'H') {
      multiplier = 3600;
    } else if (time.charAt(len - i) === 'T') {
      return total;
    } else if (time.charAt(len - i) !== 'S' && time.charAt(len - i) !== ' ') {
      total += parseInt(time.charAt(len - i)) * multiplier;
      multiplier *= 10;
    }
  }
}
