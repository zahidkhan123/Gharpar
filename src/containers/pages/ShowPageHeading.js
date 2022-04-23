import React, { Component } from "react";
import { Row, Button } from "reactstrap";
import { injectIntl } from "react-intl";

import { Colxx, Separator } from "../../components/common/CustomBootstrap";
import Breadcrumb from "../navs/Breadcrumb";
import IntlMessages from "../../helpers/IntlMessages";

class ShowPageHeading extends Component {
  constructor(props) {
    super();
    this.state = {
      dropdownSplitOpen: false,
      displayOptionsIsOpen: false,
    };
  }

  toggleDisplayOptions = () => {
    this.setState((prevState) => ({
      displayOptionsIsOpen: !prevState.displayOptionsIsOpen,
    }));
  };
  toggleSplit = () => {
    this.setState((prevState) => ({
      dropdownSplitOpen: !prevState.dropdownSplitOpen,
    }));
  };

  render() {
    const { match, toggleModal, heading } = this.props;

    return (
      <Row>
        <Colxx xxs="12">
          <div className="mb-2">
            <h1>
              <IntlMessages id={heading} />
            </h1>

            <div className="text-zero top-right-button-container">
              {/* <Button
                color="primary"
                size="lg"
                className="top-right-button"
                onClick={toggleModal}>
                <IntlMessages id="pages.add-new" />
                Add Service
              </Button> */}
              <Button
                color="primary"
                size="lg"
                className="top-right-button ml-1"
                onClick={toggleModal}
              >
                Add Category
                {/* <IntlMessages id="pages.add-new" /> */}
              </Button>
              {"  "}
            </div>
            <Breadcrumb match={match} />
          </div>
          <Separator className="mb-5" />
        </Colxx>
      </Row>
    );
  }
}

export default injectIntl(ShowPageHeading);
