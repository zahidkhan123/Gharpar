import React, { Component } from "react";

import {
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Label,
  Input,
  CustomInput,
  InputGroup,
  InputGroupAddon,
} from "reactstrap";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import Select from "react-select";
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
    };
  }

  async componentDidMount() {
    let banner = await this.get_banner(this.props.match.params.id);

    this.setState({
      banner: banner,
    });
  }

  get_banner = async (banner_id) => {
    let banner = [];
    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/global_banners/" + banner_id + ".json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          banner = response.data;
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
    return banner;
  };

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

  updateBanner = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);
    if (event.target.elements["global_banner[banner]"].files.length > 0) {
      let banner = event.target.elements["global_banner[banner]"].files[0];
      formData.append("global_banner[banner]", banner, banner.name);
    }
    let self = this;

    await trackPromise(
      axios({
        method: "put",
        url:
          servicePath +
          "/api/v2/global_banners/" +
          this.props.match.params.id +
          ".json",
        data: formData,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "Banner Updated Successfully",
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
    const { banner, areas_json } = this.state;
    let self = this;

    return (
      <div>
        {banner !== undefined ? (
          <>
            {this.settings_heading()}
            <Row className="mb-3">
              <Colxx xxs="12">
                <form onSubmit={this.updateBanner} id="order-filter">
                  <Row>
                    <Colxx md="3"></Colxx>
                    <Colxx md="6">
                      <Label className="mt-2">Title*</Label>
                      <Input
                        className="form-control"
                        name="global_banner[title]"
                        required
                        defaultValue={banner.title}
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
                        defaultValue={banner.banner_url}
                      />
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
          </>
        ) : (
          <></>
        )}
      </div>
    );
  }
}
export default DataListPages;
