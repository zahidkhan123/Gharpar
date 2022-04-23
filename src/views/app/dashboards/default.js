import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import { Row } from "reactstrap";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import Breadcrumb from "../../../containers/navs/Breadcrumb";
import IconCardsCarousel from "../../../containers/dashboards/IconCardsCarousel";
import Logs from "../../../containers/dashboards/Logs";
import Tickets from "../../../containers/dashboards/Tickets";
import Calendar from "../../../containers/dashboards/Calendar";
import ProfileStatuses from "../../../containers/dashboards/ProfileStatuses";
import SalesChartCard from "../../../containers/dashboards/SalesChartCard";

class DefaultDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cities: [],
      areas: [],
    };
  }
  render() {
    return (
      <Fragment>
        <Row>
          <Colxx xxs="12">
            <Breadcrumb heading="menu.default" match={this.props.match} />
            <Separator className="mb-5" />
          </Colxx>
        </Row>
        <Row>
          <Colxx lg="12" xl="6">
            <IconCardsCarousel />
            <Row>
              <Colxx md="12" className="mb-4">
                <SalesChartCard />
              </Colxx>
            </Row>
          </Colxx>
          <Colxx xl="6" lg="12" className="mb-4">
            <Calendar />
          </Colxx>
        </Row>
        <Row>
          <Colxx sm="12" lg="4" className="mb-4">
            <ProfileStatuses />
          </Colxx>
          <Colxx lg="4" md="6" className="mb-4">
            <Logs />
          </Colxx>
          <Colxx lg="4" md="6" className="mb-4">
            <Tickets />
          </Colxx>
        </Row>
      </Fragment>
    );
  }
}
export default injectIntl(DefaultDashboard);
