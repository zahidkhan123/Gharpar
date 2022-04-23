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

class EditNotification extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      smsTemplateObj: {},
    };
  }

  async componentDidMount() {
    const { match } = this.props;
    let smsTemplateObj = await this.get_sms_template(match.params.id);

    this.setState({
      smsTemplateObj: smsTemplateObj,
    });
  }

  update_sms_template = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);

    await trackPromise(
      axios({
        method: "put",
        url:
          servicePath +
          "/api/v2/sms_templates/" +
          this.state.smsTemplateObj.id +
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
            "SMS Template Updated Successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );
          this.props.history.push("/app/sms_templates/list");
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

  get_sms_template = async (sms_template_id) => {
    let smsTemplateObj = null;

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/sms_templates/" + sms_template_id + ".json",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          smsTemplateObj = response.data;
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
    return smsTemplateObj;
  };

  render() {
    const { smsTemplateObj } = this.state;

    if (Object.keys(smsTemplateObj).length === 0) {
      return <></>;
    } else {
      const { smsTemplateObj } = this.state;
      return (
        <Colxx xxs="12" lg="6" className="m-auto">
          <Card>
            <CardBody>
              <form onSubmit={this.update_sms_template}>
                <ModalHeader>Edit Notification</ModalHeader>

                <ModalBody>
                  <Label className="mt-4">Subject</Label>
                  <Input
                    className="form-control"
                    type="text"
                    defaultValue={smsTemplateObj.sms_type}
                    disabled
                  />

                  <Label className="mt-4">Content</Label>
                  <Input
                    className="form-control"
                    name="sms_template[content]"
                    type="textarea"
                    style={{ height: "200px" }}
                    defaultValue={smsTemplateObj.content}
                  />
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
}

export default EditNotification;
