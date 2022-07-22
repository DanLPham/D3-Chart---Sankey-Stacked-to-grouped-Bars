/* eslint-disable */
import { Navigate } from 'react-router-dom';
// import InfluenceNetwork from './Components/InfluenceNetwork';
// import AttentionFlow from './Components/AttentionFlow';
import Sankey from './Components/Sankey';
import NodeLink from './Components/NodeLink';

const routes = [
  // {
  //   path: 'sankey',
  //   element: <Sankey />,
  //   children: [
  //     // { path: 'attentionflow', element: <AttentionFlow /> },
  //   ]
  // },
  {
    path: 'nodelink',
    element: <NodeLink />,
  },
  // {
  //   path: 'barchart',
  //   element: <BarChart />,
  // },
];

export default routes;
