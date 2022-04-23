import React from "react";
import {
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Card,
  CardBody,
  Label,
} from "reactstrap";
import IntlMessages from "../../../helpers/IntlMessages";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { Colxx } from "../../../components/common/CustomBootstrap";
import axios from "axios";
import { trackPromise } from "react-promise-tracker";

class EditSetting extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      role: [
        // { label: "Super Admin", value: "Super_admin" },
        // { label: "Admin", value: "Admin" },
        { label: "CSR", value: "CSR" },
      ],
      settingObj: {},
      cities: [],
      all_cities_json: [],
      areas: [],
      city_areas_json: [],
      default_selected_city_json: null,
      default_selected_area_json: null,
    };
  }

  async componentDidMount() {
    const { match } = this.props;
    let settingObj = await this.get_setting(match.params.id);

    this.setState({
      settingObj: settingObj,
    });
  }

  update_setting = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);

    await trackPromise(
      axios({
        method: "put",
        url:
          servicePath +
          "/api/v2/settings/" +
          this.state.settingObj.id +
          ".json",
        data: formData,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "Seeting Updated Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          this.props.history.push("/app/settings/list");
        } else {
          console.log(response);
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

  get_setting = async (setting_id) => {
    let settingObj = null;

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/settings/" + setting_id + ".json",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          settingObj = response.data;
        } else {
          console.log(response);
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
    return settingObj;
  };

  render() {
    const { settingObj } = this.state;

    if (Object.keys(settingObj).length === 0) {
      return <></>;
    } else {
      const { settingObj } = this.state;
      return (
        <Colxx xxs="12" lg="6" className="m-auto">
          <Card>
            <CardBody>
              <form onSubmit={this.update_setting}>
                <ModalHeader>Edit Setting</ModalHeader>

                <ModalBody>
                  <Label className="mt-4">City</Label>
                  <Input
                    className="form-control"
                    type="text"
                    defaultValue={settingObj.city.city_name}
                    disabled
                  />

                  <Label className="mt-4">Start Time *</Label>
                  <Input
                    className="form-control"
                    name="setting[start_time]"
                    type="time"
                    defaultValue={settingObj.start_time}
                    // defaultValue="09:00"
                    required
                  />

                  <Label className="mt-4">End Time *</Label>
                  <Input
                    className="form-control"
                    name="setting[end_time]"
                    type="time"
                    defaultValue={settingObj.end_time}
                    required
                  />

                  <Label className="mt-4">Min Order Price *</Label>
                  <Input
                    className="form-control"
                    name="setting[min_order_price]"
                    type="number"
                    min="0"
                    defaultValue={settingObj.min_order_price}
                  />
                </ModalBody>

                {/* {this.render_address_details()} */}

                <ModalFooter>
                  <Button
                    color="secondary"
                    outline
                    type="button"
                    onClick={this.props.history.goBack}
                  >
                    <IntlMessages id="pages.cancel" />
                  </Button>
                  <Button color="primary" type="submit">
                    <IntlMessages id="pages.submit" />
                  </Button>
                </ModalFooter>
              </form>
            </CardBody>
          </Card>
        </Colxx>
      );
    }
  }
}

export default EditSetting;
