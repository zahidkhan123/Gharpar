import React, { Component } from "react";
import {
  Row,
  Button,
  ButtonDropdown,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  CustomInput,
  Collapse
} from "reactstrap";
import { injectIntl } from "react-intl";
import { Link } from 'react-router-dom';
import { Colxx, Separator } from "../../components/common/CustomBootstrap";
import Breadcrumb from "../navs/Breadcrumb";
import IntlMessages from "../../helpers/IntlMessages";

import {
  DataListIcon,
  ThumbListIcon,
  ImageListIcon
} from "../../components/svg";
class ServicesPageHeading extends Component {
  constructor(props) {
    super();
    this.state = {
      dropdownSplitOpen: false,
      displayOptionsIsOpen: false
    };
  }

  toggleDisplayOptions = () => {
    this.setState(prevState => ({
      displayOptionsIsOpen: !prevState.displayOptionsIsOpen
    }));
  };
  toggleSplit =()=> {
    this.setState(prevState => ({
      dropdownSplitOpen: !prevState.dropdownSplitOpen
    }));
  }

  render() {
    const { messages } = this.props.intl;
    const {
      match,
      link_component,
      heading
    } = this.props;

    const { displayOptionsIsOpen, dropdownSplitOpen } = this.state;
    return (
      <Row>
        <Colxx xxs="12">
          <div className="mb-2">
            <h1>
              <IntlMessages id={heading} />
            </h1>

            <div className="text-zero top-right-button-container">
              <Link to={link_component}>
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                >
                  <IntlMessages id="pages.add-new" />
                </Button>
              </Link>
            </div>
            <Breadcrumb match={match} />
          </div>
          <Separator className="mb-5" />
        </Colxx>
      </Row>
    );
  }
}

export default injectIntl(ServicesPageHeading);
