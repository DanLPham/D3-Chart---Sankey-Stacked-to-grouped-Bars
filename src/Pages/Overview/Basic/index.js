import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Navigate } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import artist from '../../assets/utils/images/vevo_artist.png';
import video from '../../assets/utils/images/vevo_video.png';
import wiki from '../../assets/utils/images/wiki_traffic.png';
import '../../assets/vevovis.css';

export default class AnalyticsDashboard1 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickedOnSong: false,
      title: null,
      dropdownOpen: false,
      activeTab1: '11',
      isLoaded: false,
      isLoading: true,
      hasError: false,
      errorMessage: '',
      bubblesInfo: {},
      search: false,
      links: [],
      videos: [],
    };
    this.toggle = this.toggle.bind(this);
    this.toggle1 = this.toggle1.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      clickedOnSong: false,
    });
  }

  componentDidMount() {
    document.body.classList.add('bg-light');
    //    this.fetchExample();
  }

  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen,
    }));
  }

  toggle1(tab) {
    if (this.state.activeTab1 !== tab) {
      this.setState({
        activeTab1: tab,
      });
    }
  }

  // For search box
  display = d => {
    this.setState({
      clickedOnSong: true,
      title: document.getElementById('search-text').value,
    });
  };

  render() {
    if (this.state.clickedOnSong === true) {
      console.log('redirecting');
      return <Navigate push to={`/overview/video/${this.state.videoId}`} />;
    }
    return (
      <>
        <ReactCSSTransitionGroup
          component="div"
          transitionName="TabsAnimation"
          transitionAppear
          transitionAppearTimeout={0}
          transitionEnter={false}
          transitionLeave={false}
        >
          <button id="display" hidden="hidden" onClick={this.display} />
          <div class="mainpage">
            <Row>
              <Col md="8" lg="8">
                <div className="text-block">
                  <h3>
                    AttentionFlow: Visualising Influence in Networks of Time
                    Series{' '}
                  </h3>

                  <div>
                    <p>
                      {' '}
                      <b>Abstract:</b> The collective attention on online items
                      such as web pages, search terms, and videos reflects
                      trends that are of social, cultural, and economic
                      interest. Moreover, attention trends of different items
                      exhibit mutual influence via mechanisms such as hyperlinks
                      or recommendations. Many visualisation tools exist for
                      time series, network evolution, or network influence;
                      however, few systems connect all three. In this work, we
                      present AttentionFlow, a new system to visualise networks
                      of time series and the dynamic influence they have on one
                      another. Centred around an ego node, our system
                      simultaneously presents the time series on each node using
                      two visual encodings: a tree ring for an overview and a
                      line chart for details. AttentionFlow supports
                      interactions such as overlaying time series of influence,
                      and filtering neighbours by time or flux. We demonstrate
                      AttentionFlow using two real-world datasets, Vevo and
                      Wiki. We show that attention spikes in songs can be
                      explained by external events such as major awards, or
                      changes in the network such as the release of a new song.
                      Separate case studies also demonstrate how an artist's
                      influence changes over their career, and that correlated
                      Wikipedia traffic is driven by cultural interests. More
                      broadly, AttentionFlow can be generalised to visualise
                      networks of time series on physical infrastructures such
                      as road networks, or natural phenomena such as weather and
                      geological measurements.
                    </p>
                  </div>

                  <p>
                    {' '}
                    <b>Team:</b> Minjeong Shin, Alasdair Tran, Siqi Wu,
                    Alexander Mathews, Rong Wang, Georgiana Lyall, and Lexing
                    Xie @
                    <a href="http://cm.cecs.anu.edu.au/" target="_blank">
                      ANU Computational Media Lab
                    </a>
                  </p>

                  <p>
                    {' '}
                    <b>Paper:</b>{' '}
                    <a href="http://arxiv.org/abs/2102.01974" target="_blank">
                      Arxiv Link
                    </a>
                  </p>

                  <p>
                    {' '}
                    <b>Source:</b>{' '}
                    <a
                      href="https://github.com/alasdairtran/attentionflow"
                      target="_blank"
                    >
                      GitHub Repo
                    </a>
                  </p>

                  <p>
                    {' '}
                    <b>References:</b>
                    <br />
                    Minjeong Shin, Alasdair Tran, Siqi Wu, Alexander Mathews,
                    Rong Wang, Georgiana Lyall, Lexing Xie. 2021. AttentionFlow:
                    Visualising Influence in Networks of Time Series. In the
                    Proceedings of the Fourteenth ACM International Conference
                    on Web Search and Data Mining (WSDM ’21), March 8–12, 2021,
                    Virtual Event, Israel. ACM. 4 pages.{' '}
                    <a href="https://doi.org/10.1145/3437963.3441703">
                      https://doi.org/10.1145/3437963.3441703
                    </a>
                    <br />
                    <br />
                    (VevoMusic dataset and the ARNet algorithm) Estimating
                    Attention Flow in Online Video Networks, Siqi Wu,
                    Marian-Andrei Rizoiu, and Lexing Xie, ACM Conference on
                    Computer-Supported Cooperative Work and Social Computing
                    (CSCW '19), 2019.{' '}
                    <a href="https://doi.org/10.1145/3359285">
                      https://doi.org/10.1145/3359285
                    </a>{' '}
                    <br />
                    <br />
                    (WikiTraffic dataset and the Radflow algorithm) Radflow: A
                    Recurrent, Aggregated, and Decomposable Model for Networks
                    of Time Series, Alasdair Tran, Alexander Mathews, Cheng Soon
                    Ong, and Lexing Xie, Proceedings of The Web Conference 2021.{' '}
                    <a href="https://doi.org/10.1145/3442381.3449945">
                      https://doi.org/10.1145/3442381.3449945
                    </a>
                  </p>
                </div>
              </Col>

              <Col md="4" lg="4">
                <div className="video-block">
                  <iframe
                    width="100%"
                    height="320"
                    frameBorder="0"
                    src="https://www.youtube.com/embed/8hAVa4LK254"
                  ></iframe>
                </div>
              </Col>
            </Row>

            <Row>
              <Col md="12" lg="12">
                <div className="text-block">
                  <h4>Use cases</h4>

                  <p>
                    {' '}
                    Exploring how a network of (a) musicians, (b) music videos,
                    and (c) Wikipedia pages drive attention to each other.
                  </p>
                </div>
              </Col>
              <Col md="4" lg="4">
                <div className="column">
                  <div className="header-block">
                    (a) Which artists influence "Adele"?
                  </div>
                  <div className="single-image">
                    <a href="/#/overview/artist/UComP_epzeKzvBX156r6pm1Q">
                      <img width="100%" src={artist} />
                    </a>
                  </div>
                </div>
              </Col>
              <Col md="4" lg="4">
                <div className="column">
                  <div className="header-block">
                    (b) Which videos influence "Adele - Rolling in the Deep"?
                  </div>
                  <div className="single-image">
                    <a href="/#/overview/video/rYEDA3JcQqw">
                      <img width="100%" src={video} />
                    </a>
                  </div>
                </div>
              </Col>
              <Col md="4" lg="4">
                <div className="column">
                  <div className="header-block">
                    (c) Which Wiki pages drive traffic to "Kylo Ren"?
                  </div>
                  <div className="single-image">
                    <a href="/#/overview/wiki/318487">
                      <img width="100%" src={wiki} />
                    </a>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </ReactCSSTransitionGroup>
      </>
    );
  }
}
