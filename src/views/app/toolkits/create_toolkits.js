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

class NewSetting extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      settingObj: {},
      cities: [],
      all_cities_json: [],
      areas: [],
      product_categories: [],
      city_areas_json: [],
      default_selected_city_json: null,
      default_selected_area_json: null,
    };
  }

  create_toolkit = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/inventory/toolkits.json",
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
            "Toolkit Created Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          this.props.history.push("/app/toolkits/list");
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
  handleCheckChange = (event) => {
    if (event.target.checked) {
      event.target.parentElement.nextElementSibling.value = "true";
    } else {
      event.target.parentElement.nextElementSibling.value = "false";
    }
  };

  render() {
    return (
      <Colxx xxs="12" lg="6" className="m-auto">
        <Card>
          <CardBody>
            <form onSubmit={this.create_toolkit}>
              <ModalHeader>Add Toolkit</ModalHeader>

              <ModalBody>
                <Label className="mt-4">Title *</Label>
                <Input
                  className="form-control"
                  name="toolkit[toolkit_name]"
                  type="text"
                  defaultValue=""
                  required
                />
                {/* <CustomInput
                  className="mt-2"
                  type="checkbox"
                  label="Toolkit"
                  defaultChecked={false}
                  onChange={(event) => self.handleCheckChange(event)}
                /> */}
                <Input hidden name="toolkit[is_toolkit]" defaultValue="false" />
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
