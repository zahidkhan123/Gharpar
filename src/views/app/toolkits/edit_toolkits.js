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
      toolkit_Obj: [],
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
    let toolkit_Obj = await this.get_toolkit(match.params.id);

    this.setState({
      toolkit_Obj: toolkit_Obj,
    });
  }

  update_toolkit = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);

    await trackPromise(
      axios({
        method: "put",
        url:
          servicePath +
          "/api/inventory/toolkits/" +
          this.state.toolkit_Obj.id +
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
            "Toolkit Updated Successfully",
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

  get_toolkit = async (toolkit_id) => {
    let toolkit_Obj = null;

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/inventory/toolkits/" + toolkit_id + ".json",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          toolkit_Obj = response.data;
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
    return toolkit_Obj;
  };

  render() {
    const { toolkit_Obj } = this.state;
    return (
      <Colxx xxs="12" lg="6" className="m-auto">
        <Card>
          <CardBody>
            <form onSubmit={this.update_toolkit}>
              <ModalHeader>Edit Product Category</ModalHeader>

              <ModalBody>
                <Label className="mt-4">Title</Label>
                <Input
                  className="form-control"
                  type="text"
                  name="toolkit[toolkit_name]"
                  defaultValue={toolkit_Obj.toolkit_name}
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

export default EditSetting;
