import React, { Component } from "react";

import {
  Row,
  Label,
  Input,
  CustomInput,
  InputGroup,
  InputGroupAddon,
} from "reactstrap";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import axios from "axios";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";

class DataListPages extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");

    this.state = {
      deleteConfirmationModal: false,
      areas_json: [],
    };
  }

  async componentDidMount() {}

  settings_heading = () => {
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>Global Banner</h1>
            </div>
          </Colxx>
        </Row>
        <Separator className="mb-2" />
      </>
    );
    return heading;
  };

  create_global_banner = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);
    if (event.target.elements["global_banner[banner]"].files.length > 0) {
      let banner = event.target.elements["global_banner[banner]"].files[0];
      formData.append("global_banner[banner]", banner, banner.name);
    }
    let self = this;

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/global_banners.json",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "Banner Created successfully",
            "",
            5000,
            () => {
              alert("callback");
            },
            null,
            "filled"
          );
          self.props.history.push("/app/global_banner/list");
        }
      })
      .catch((error) => {
        NotificationManager.error(
          error.response.data.message,
          "",
          5000,
          () => {
            alert("callback");
          },
          null,
          "filled"
        );
        console.log("error", error);
      });
  };

  render() {
    return (
      <div>
        {this.settings_heading()}
        <Row className="mb-3">
          <Colxx xxs="12">
            <form onSubmit={this.create_global_banner} id="order-filter">
              <Row>
                <Colxx md="3"></Colxx>
                <Colxx md="6">
                  <Label className="mt-2">Title*</Label>
                  <Input
                    className="form-control"
                    name="global_banner[title]"
                    required
                  />
                  <Label className="mt-2">Banner*</Label>
                  <InputGroup className="mt-3">
                    <InputGroupAddon addonType="prepend">
                      Upload
                    </InputGroupAddon>
                    <CustomInput
                      type="file"
                      name="global_banner[banner]"
                      required
                    />
                  </InputGroup>
                  <Label className="mt-2">URL*</Label>
                  <Input
                    className="form-control"
                    name="global_banner[banner_url]"
                    required
                  />
                  g{" "}
                  <Input
                    color="primary"
                    size="sm"
                    type="submit"
                    className="mt-4"
                  >
                    Submit
                  </Input>
                </Colxx>
              </Row>
            </form>
          </Colxx>
        </Row>
      </div>
    );
  }
}
export default DataListPages;
