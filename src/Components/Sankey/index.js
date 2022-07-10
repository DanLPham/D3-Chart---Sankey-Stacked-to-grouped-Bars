import React from "react";
import ReactDOM from "react-dom";
import { AlluvialChart } from "@carbon/charts-react";
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';
import "@carbon/charts/styles.css";
// Or
// import "@carbon/charts/styles/styles.scss";

// IBM Plex should either be imported in your project by using Carbon
// or consumed manually through an import
import "./plex-and-carbon-components.css";

import data from './Data/data2.json';
import story_data from './Data/demodata.json';
import BarChart from "../BarChart";

const width = 1200;
const barchartHeight = 200;
const sankeychartHeight = 300;

const timesliderStyle = {
  width: width,
};

const colorList = ["#b28600", "#da1e28", "#198038", "#ee538b"];
const focusedColor = "#1192e8";

export default class App extends React.Component {
  state = {
    sankeyChoices: {
      "alluvial": {
        "nodes": [
          {
            "name": "About Modal1",
            "category": "Pattern"
          },
          {
            "name": "Cards",
            "category": "Pattern"
          },
          {
            "name": "Create Flow",
            "category": "Pattern"
          },
          {
            "name": "Page Header",
            "category": "Pattern"
          },
          // {
          //   "name": "Notifications",
          //   "category": "Pattern"
          // },
          {
            "name": "Data and AI, AI Apps",
            "category": "Group"
          },
          // {
          //   "name": "Data and AI, Info Architecture",
          //   "category": "Group"
          // },
          // {
          //   "name": "Public Cloud",
          //   "category": "Group"
          // },
          // {
          //   "name": "Security",
          //   "category": "Group"
          // },
          // {
          //   "name": "Automation",
          //   "category": "Group"
          // }
        ]
      },
      "height": sankeychartHeight + "px",
      "width": width + "px",
      "color": {
        "scale": {
          "Cards": "#da1e28",
          "About Modal1": "#b28600",
          "Create Flow": "#198038",
          "Page Header": "#ee538b",
          // "Notifications": "#08bdba",
          "Data and AI, AI Apps": "#1192e8",
          // "Data and AI, Info Architecture": "#a56eff",
          // "Security": "#009d9a",
          // "Automation": "#fa4d56",
          // "Public Cloud": "#198038"
        },
        "gradient": {
          "enabled": true
        }
      }
    },
    sankeyData: data,
    data: data,
    options: {
      "title": "Alluvial (gradient)",
      "alluvial": {
        "nodes": [
          {
            "name": "About Modal1",
            "category": "Pattern"
          },
          {
            "name": "Cards",
            "category": "Pattern"
          },
          {
            "name": "Create Flow",
            "category": "Pattern"
          },
          {
            "name": "Page Header",
            "category": "Pattern"
          },
          // {
          //   "name": "Notifications",
          //   "category": "Pattern"
          // },
          {
            "name": "Data and AI, AI Apps",
            "category": "Group"
          },
          // {
          //   "name": "Data and AI, Info Architecture",
          //   "category": "Group"
          // },
          // {
          //   "name": "Public Cloud",
          //   "category": "Group"
          // },
          // {
          //   "name": "Security",
          //   "category": "Group"
          // },
          // {
          //   "name": "Automation",
          //   "category": "Group"
          // }
        ]
      },
      "height": sankeychartHeight + "px",
      "width": width + "px",
      "color": {
        "scale": {
          "Cards": "#da1e28",
          "About Modal1": "#b28600",
          "Create Flow": "#198038",
          "Page Header": "#ee538b",
          // "Notifications": "#08bdba",
          "Data and AI, AI Apps": "#1192e8",
          // "Data and AI, Info Architecture": "#a56eff",
          // "Security": "#009d9a",
          // "Automation": "#fa4d56",
          // "Public Cloud": "#198038"
        },
        "gradient": {
          "enabled": true
        }
      }
    }
  };

  sankeyData = [];
  sankeyChoices = [];

  addStoryColor = () => {
    for (let i = 0; i < story_data.neighbors.length; i++) {
      this.state.options.color.scale[story_data.neighbors[i].title] = colorList[i];
    }
  }

  extractSankeyData = () => {
    let tmp_data = [];
    let tmp_choices = [];
    let choices_alluvial_nodes = "";
    let choices_color_scale = "";

    let focusedStoryTitle = story_data.title;

    story_data.neighbors.map((neighbor, idx) => {
      tmp_data.push({
        "source": neighbor.title,
        "target": focusedStoryTitle,
        "value": neighbor.influenceScore,
      });

      choices_alluvial_nodes += '{ "name": "' + neighbor.title + '", "category": "Neighbor Stories" }';
      if (idx < story_data.neighbors.length - 1) {
        choices_alluvial_nodes += ', ';
      }
      choices_color_scale += '"' + neighbor.title + '": "' + colorList[idx] + '"';
      if (idx < story_data.neighbors.length - 1) {
        choices_color_scale += ', ';
      }
    });
    // console.log("sankey data:", tmp_data);

    let choices_string = '{ "alluvial": { "nodes": [' +
      '{ "name": "' + story_data.title + '", "category": "Focused Story" }, ' +
      choices_alluvial_nodes +
      '] }, "height": "' + sankeychartHeight + 'px", ' +
      '"width": "' + width + 'px",' +
      '"color": { "scale": {' +
      '"' + story_data.title + '": "' + focusedColor + '", ' +
      choices_color_scale +
      '}, "gradient": { "enabled": true }}}';
    tmp_choices = JSON.parse(choices_string);
    // console.log("sankey choices:", tmp_choices);
    // console.log("options:", this.state.options);

    return [tmp_data, tmp_choices];
  }

  componentDidMount() {
    // console.log("story_data:", story_data.neighbors.length);
    this.addStoryColor();
    // this.state.sankeyData = this.extractSankeyData()[0];
    // this.state.sankeyChoices = this.extractSankeyData()[1];
    // console.log("data2:", data);
    console.log("sankey choices:", this.extractSankeyData()[1]);
    this.setState(prev => ({
      ...prev,
      sankeyData: this.extractSankeyData()[0],
      sankeyChoices: this.extractSankeyData()[1],
      // sankeyData: data,
      // sankeyChoices: this.state.options,
    }));
  }


  log = (value) => {
    console.log(value); //eslint-disable-line
  }


  render = () => {
    console.log(this.state.sankeyData)
    console.log(this.state.sankeyChoices)
    return (
      <div style={{ height: '100px', margin: '100px 150px', }}>
        <BarChart
          width={width}
          height={barchartHeight}
          vbWidth={width}
          vbHeight={barchartHeight}
          data={story_data}
        />
        <div style={timesliderStyle}>
          <Slider range allowCross={false} defaultValue={[0, 20]} onChange={this.log} />
        </div>
        <AlluvialChart
          data={this.state.sankeyData}
          options={this.state.sankeyChoices}>
        </AlluvialChart>
      </div>
    )
  };
}
ReactDOM.render(<App />, document.getElementById("root"));
