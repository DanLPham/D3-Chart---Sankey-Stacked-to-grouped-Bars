import React from "react";
import ReactDOM from "react-dom";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import data from './Data/data2.json';
import story_data from './Data/demodata.json';
import graph_data from './Data/graph_data.json';

import BarChart from "../BarChart";
import InfluenceGraph from "./InfluenceGraph";
import ColorSwatches from "./ColorSwatches";
import InfluenceBarChart from "./InfluenceBarChart";
import StoryInformation from "./StoryInformation";
import KeywordTree from "./KeywordTree";

const width = 1200;
const barchartHeight = 200;
const nodelinkHeight = 550;

const timesliderStyle = {
  width: width,
};

const colorNode = ["#D9D1B0", "#E07A5F", "#8F5D5D", "#3D405B", "#5F797B", "#69C7C4", "#81B29A", "#F0CC4C"];
const colorLink = ["#646BE7", "#CB273D", "#7DA81E"];
const focusedColor = "#F4F1DE";

const startDate = new Date(story_data.createdAt);
const endDate = new Date("06/30/2022");
const deltaDate = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

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
      "height": nodelinkHeight + "px",
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
      "height": nodelinkHeight + "px",
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
    selectedDate: [startDate, endDate],
    selectedRadioOption: "stacked",
    action: "",
    hoverId: 0,
    storyInfo: {},
  };

  sankeyData = [];
  sankeyChoices = [];

  addStoryColor = () => {
    for (let i = 0; i < story_data.neighbors.length; i++) {
      this.state.options.color.scale[story_data.neighbors[i].title] = colorNode[i];
    }
  }

  extractSankeyData = () => {
    let tmp_data = [];
    let tmp_choices = [];
    let choices_alluvial_nodes = "";
    let choices_color_scale = "";

    let focusedStoryTitle = story_data.title;

    story_data.neighbors.map((neighbor, idx) => {
      let value = 0;

      for (let i = 0; i < neighbor.dailyContributingView.length; i++) {
        value += neighbor.dailyContributingView[i].view;
      }

      tmp_data.push({
        "source": neighbor.title,
        "target": focusedStoryTitle,
        "value": value,
      });

      choices_alluvial_nodes += '{ "name": "' + neighbor.title + '", "category": "Neighbor Stories" }';
      if (idx < story_data.neighbors.length - 1) {
        choices_alluvial_nodes += ', ';
      }
      choices_color_scale += '"' + neighbor.title + '": "' + colorNode[idx] + '"';
      if (idx < story_data.neighbors.length - 1) {
        choices_color_scale += ', ';
      }
    });
    // console.log("sankey data:", tmp_data);

    let choices_string = '{ "alluvial": { "nodes": [' +
      '{ "name": "' + story_data.title + '", "category": "Focused Story" }, ' +
      choices_alluvial_nodes +
      '] }, "height": "' + nodelinkHeight + 'px", ' +
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

  convertValue2Date = (value) => {
    return new Date(startDate.getTime() + Math.round(((deltaDate * value) / 100)) * (1000 * 60 * 60 * 24));
  }

  componentDidMount() {
    // console.log("story_data:", story_data.neighbors.length);
    this.addStoryColor();
    // this.state.sankeyData = this.extractSankeyData()[0];
    // this.state.sankeyChoices = this.extractSankeyData()[1];
    // console.log("data2:", data);
    // console.log("sankey choices:", this.extractSankeyData()[1]);
    this.setState(prev => ({
      ...prev,
      sankeyData: this.extractSankeyData()[0],
      sankeyChoices: this.extractSankeyData()[1],
    }));
  }

  log = (value) => {
    console.log(value[0], value[1]); //eslint-disable-line
    this.setState(prev => ({
      ...prev,
      selectedDate: [this.convertValue2Date(value[0]), this.convertValue2Date(value[1])],
    }));

    let tmp_data = [];
    let focusedStoryTitle = story_data.title;
    story_data.neighbors.map((neighbor) => {
      let value = 0;

      for (let i = 0; i < neighbor.dailyContributingView.length; i++) {
        let contributing_date = new Date(neighbor.dailyContributingView[i].date);
        if (contributing_date >= this.state.selectedDate[0] && contributing_date <= this.state.selectedDate[1]) {
          value += neighbor.dailyContributingView[i].view;
        }
      }

      tmp_data.push({
        "source": neighbor.title,
        "target": focusedStoryTitle,
        "value": value,
      });
    });

    this.setState(prev => ({
      ...prev,
      sankeyData: tmp_data,
    }));
  }

  displayDate = (date) => {
    return (date.getUTCMonth() + 1) + "/" + date.getUTCDate() + "/" + date.getUTCFullYear();
  }

  onChangeValueRadioBtnBarChart = (event) => {
    this.setState(prev => ({
      ...prev,
      selectedRadioOption: event.target.value,
    }));
  }

  setHoverStory = (storyId, storyInfo) => {
    this.setState(prev => ({
      ...prev,
      action: "Hover on " + storyId,
      hoverId: storyId,
    }));

    if (storyId !== "other-sources") {
      this.setState(prev => ({
        ...prev,
        storyInfo: {
          title: storyInfo.title,
          imgSrc: storyInfo.imgSrc,
          totalViews: storyInfo.totalViews,
          createdAt: storyInfo.createdAt,
          keywords: storyInfo.keywords,
          gkrSimilarityScore: storyInfo.gkrSimilarityScore,
          contributingViews: storyInfo.contributingViews,
          receivedViews: storyInfo.receivedViews,
          color: storyInfo.color,
        },
      }));
    }
  }

  setClickedStory = (storyId) => {
    this.setState(prev => ({
      ...prev,
      action: "Click on " + storyId,
    }));
  }

  setNewAction = (new_action) => {
    this.setState(prev => ({
      ...prev,
      action: new_action,
    }));
  }

  render = () => {
    return (
      <div style={{ height: '100px', margin: '20px 150px', }}>
        <div>Influence Network 2.0 - Which stories influence the current story?</div>
        <div><u>Current action</u>: {this.state.action}</div>
        <div style={{ height: '10px' }}></div>
        <div>Daily View mode:</div>
        <div onChange={this.onChangeValueRadioBtnBarChart}>
          <input type="radio" value="stacked" name="barchartmode" checked={this.state.selectedRadioOption === "stacked"} /> Stacked
          <input type="radio" value="grouped" name="barchartmode" checked={this.state.selectedRadioOption === "grouped"} /> Grouped
        </div>
        <div style={{ height: '10px' }}></div>
        <div>Time frame: {this.displayDate(this.state.selectedDate[0])} to {this.displayDate(this.state.selectedDate[1])}</div>
        <div style={{ height: '20px' }}></div>
        <BarChart
          width={width}
          height={barchartHeight}
          vbWidth={width}
          vbHeight={barchartHeight}
          data={story_data}
          dateRange={this.state.selectedDate}
          mode={this.state.selectedRadioOption}
          colorNode={colorNode}
          hoverId={this.state.hoverId}
          setNewAction={this.setNewAction}
        />
        <div style={timesliderStyle}>
          <Slider range allowCross={false} defaultValue={[0, 100]} onChange={this.log} />
        </div>

        <div style={{ height: '10px' }}></div>

        <div style={{
          height: nodelinkHeight + 30,
          width: width * 3 / 5,
          position: 'fixed',
          left: 150,
        }}>
          <ColorSwatches width={width / 2} height={30} colorLink={colorLink} />
          <InfluenceGraph
            width={width * 3 / 5}
            height={nodelinkHeight}
            vbWidth={width}
            vbHeight={nodelinkHeight}
            data={graph_data}
            storyData={story_data}
            dateRange={this.state.selectedDate}
            mode={this.state.selectedRadioOption}
            colorNode={colorNode}
            colorLink={colorLink}
            setHoverStory={this.setHoverStory}
            setClickedStory={this.setClickedStory}
          />
        </div>

        <div style={{
          height: nodelinkHeight + 30,
          width: width * 2 / 5,
          position: 'fixed',
          left: 150 + width * 3 / 5,
        }}>
          <div style={{ width: '100%', height: nodelinkHeight / 2 + 40, }}>
            <StoryInformation storyInfo={this.state.storyInfo} />
          </div>
          <div style={{
            width: '100%',
            height: nodelinkHeight / 2 - 10,
            backgroundColor: '#F4F7E5',
          }}>
            <div style={{ padding: '10px 15px', }}>
              <div style={{ color: "#6D734F", fontWeight: 'bold', fontSize: '1rem', }}>
                Keyword Hierarchy {this.state.storyInfo.title ? 'between Story 2 and' : ''} {this.state.storyInfo.title}
              </div>
            </div>
            <KeywordTree
              width={width * 2 / 5}
              height={nodelinkHeight / 2 - 10}
            />
          </div>
        </div>

        {/* <InfluenceBarChart /> */}
      </div>
    )
  };
}
ReactDOM.render(<App />, document.getElementById("root"));
