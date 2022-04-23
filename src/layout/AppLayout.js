import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import TopNav from "../containers/navs/Topnav";
import Sidebar from "../containers/navs/Sidebar";
import Footer from "../containers/navs/Footer";
import { usePromiseTracker } from "react-promise-tracker";
import Loader from "react-promise-loader";
import {connect_socket} from "../helpers/Utils";

class AppLayout extends Component {

  componentDidMount(){
    connect_socket("GlobalChannel");
  }

  render() {
    const { containerClassnames } = this.props;
    
    return (
      <div id="app-container" className={containerClassnames}>
        <TopNav history={this.props.history} />
        <Sidebar />
        <main>
          <div className="container-fluid">
            <div style={{ position: "fixed", top: "50%", zIndex: '1', left: '50%'}}>
              <Loader
                promiseTracker={usePromiseTracker}
                background={'rgba(0,0,0,.2)'}
                color={'#000'}
              />
            </div>
            {this.props.children}
          </div>
        </main>
        <Footer />
      </div>
    );
  }
}
const mapStateToProps = ({ menu }) => {
  const { containerClassnames } = menu;
  return { containerClassnames };
};
const mapActionToProps = {};

export default withRouter(
  connect(mapStateToProps, mapActionToProps)(AppLayout)
);
