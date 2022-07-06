/* eslint-disable */
import { Navigate } from 'react-router-dom';
import InfluenceNetwork from './Components/InfluenceNetwork';
import AttentionFlow from './Components/AttentionFlow';
import Sankey from './Components/Sankey';
import BarChart from './Components/BarChart';

const routes = [
  {
    path: '/',
    element: <InfluenceNetwork />,
    children: [
      // { path: 'attentionflow', element: <AttentionFlow /> },
    ]
  },
  {
    path: 'attentionflow',
    element: <AttentionFlow />,
  },
  {
    path: 'sankey',
    element: <Sankey />,
  },
  {
    path: 'barchart',
    element: <BarChart />,
  },
];

export default routes;
