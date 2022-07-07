import React from "react";
import ReactDOM from "react-dom";
import { AlluvialChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";
// Or
// import "@carbon/charts/styles/styles.scss";

// IBM Plex should either be imported in your project by using Carbon
// or consumed manually through an import
import "./plex-and-carbon-components.css";
import data from './Data/data2.json';
import BarChart from "../BarChart";

export default class App extends React.Component {
  state = {
    data: data,
    options: {
      "title": "Alluvial (gradient)",
      "alluvial": {
        "nodes": [
          {
            "name": "About Modal",
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
      "height": "300px",
      "width": "600px",
      "color": {
        "scale": {
          "Cards": "#da1e28",
          "About Modal": "#b28600",
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

  render = () => (
    <>
      <AlluvialChart
        data={this.state.data}
        options={this.state.options}>
      </AlluvialChart>
      <BarChart />
    </>
  );
}
ReactDOM.render(<App />, document.getElementById("root"));
