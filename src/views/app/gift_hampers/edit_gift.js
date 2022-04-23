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
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
    let start_date = moment(settingObj.start_datetime);
    let end_date = moment(settingObj.end_datetime);
    this.setState({
      settingObj: settingObj,
      startDateTime: start_date,
      endDateTime: end_date,
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
          "/api/v2/gift_hampers/" +
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
            "Gift Hamper Updated Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          this.props.history.push("/app/gift_hampers/list");
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
        url: servicePath + "/api/v2/gift_hampers/" + setting_id + ".json",
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

  handleChangeDateTime = (date) => {
    this.setState({
      startDateTime: date,
    });
  };

  handleChangeEndDateTime = (date) => {
    this.setState({
      endDateTime: date,
    });
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
                    defaultValue={settingObj.city_name}
                    disabled
                  />

                  <Label className="mt-4">Content *</Label>
                  <Input
                    className="form-control"
                    name="gift_hamper[content]"
                    type="textarea"
                    defaultValue={settingObj.content}
                    required
                  />

                  <Label className="mt-4">Gift Hampers *</Label>
                  <Input
                    className="form-control"
                    name="gift_hamper[gift_hampers]"
                    type="number"
                    defaultValue={settingObj.gift_hampers}
                    min={settingObj.gift_hamper_usage_count}
                    required
                  />
                  {/* <Label className="mt-4">Usage Limit *</Label>
                  <Input
                    className="form-control"
                    name="gift_hamper[gift_hamper_usage_count]"
                    type="number"
                    defaultValue={settingObj.gift_hamper_usage_count}
                    required
                  /> */}

                  {/* <Label className="mt-4">Start Time *</Label>
                  <DatePicker
                    className="mt-2"
                    selected={this.state.startDateTime}
                    onChange={(event) => this.handleChangeDateTime(event)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={1}
                    dateFormat="LLL"
                    timeCaption="Time"
                    defaultValue={settingObj.start_datetime}
                    name="gift_hamper_setting[start_datetime]"
                  />

                  <Label className="mt-4">End Time *</Label>
                  <DatePicker
                    className="mt-2"
                    selected={this.state.endDateTime || this.state.endDateTime}
                    onChange={this.handleChangeEndDateTime}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={1}
                    dateFormat="LLL"
                    timeCaption="Time"
                    defaultValue={settingObj.start_datetime}
                    name="gift_hamper_setting[end_datetime]"
                  /> */}
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
