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
import Select from "react-select";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import IntlMessages from "../../../helpers/IntlMessages";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { Colxx } from "../../../components/common/CustomBootstrap";
import axios from "axios";
import { trackPromise } from "react-promise-tracker";

class NewSetting extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
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
    let cities = JSON.parse(localStorage.getItem("cities"));
    let cities_json = this.cities_json(cities);
    this.setState({
      cities: cities,
      cities_json: cities_json,
    });
  }

  get_all_cities = async () => {
    let all_cities = [];

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/cities.json?is_setting_added=false",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          all_cities = response.data.sort(
            (a, b) => parseInt(a.id) - parseInt(b.id)
          );
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

    return all_cities;
  };

  cities_json = (all_cities) => {
    let cities_dropdown_data = [];

    all_cities.forEach(function (currentValue) {
      cities_dropdown_data.push({
        label: currentValue.city_name,
        value: currentValue.id,
        key: currentValue.id,
      });
    });
    return cities_dropdown_data;
  };

  create_setting = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/gift_hampers.json",
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
            "Gift Hamper Created Successfully",
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

  render() {
    const { cities_json } = this.state;
    return (
      <Colxx xxs="12" lg="6" className="m-auto">
        <Card>
          <CardBody>
            <form onSubmit={this.create_setting}>
              <ModalHeader>Add Gift Hamper</ModalHeader>

              <ModalBody>
                <Label className="mt-3">Select City *</Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  name="gift_hamper[city_id]"
                  className="react-select"
                  classNamePrefix="react-select"
                  // onChange={this.handle_city_change}
                  options={cities_json}
                />

                <Label className="mt-4">Content *</Label>
                <Input
                  className="form-control"
                  name="gift_hamper[content]"
                  type="textarea"
                />

                <Label className="mt-4">Gift Hampers *</Label>
                <Input
                  className="form-control"
                  name="gift_hamper[gift_hampers]"
                  type="number"
                  required
                />
                {/* <Label className="mt-4">Usage Limit *</Label>
                <Input
                  className="form-control"
                  name="gift_hamper[gift_hamper_usage_count]"
                  type="number"
                  required
                /> */}
              </ModalBody>
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

export default NewSetting;
