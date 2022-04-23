import React, { Component } from "react";
import { Card, CardBody, Button, Row, Label } from "reactstrap";
import { Link } from "react-router-dom";
import { Colxx } from "../../../components/common/CustomBootstrap";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import axios from "axios";
import { trackPromise } from "react-promise-tracker";

class UserShow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
    };
    this.fetch_user = this.fetch_user.bind(this);
  }

  async componentDidMount() {
    let user = await this.fetch_user();

    this.setState({
      user: user,
    });
  }

  fetch_user = async () => {
    let user = {};
    const { match } = this.props;

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/users/" + match.params.id + ".json",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          user = response.data;
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

    return user;
  };

  capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  approveStatus = async (event, user) => {
    await trackPromise(
      axios({
        method: "put",
        url: servicePath + "/api/v2/users/" + user.id + ".json",
        data: "",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          user = response.data;
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

    return user;
  };

  render() {
    const { user } = this.state;
    if (Object.keys(user).length === 0) {
      return <></>;
    } else {
      return (
        <div>
          <Row>
            <Colxx md="12">
              <Link to={`/app/technicians/edit/${user.id}`}>
                <Button className="btn-success mr-2 user-show-btns">
                  {" "}
                  Edit{" "}
                </Button>
              </Link>
              {/* <Button className="btn-success mr-2 user-show-btns"> Block </Button> */}
            </Colxx>
          </Row>
          <Row className="mt-3">
            <Colxx md="12">
              <Card>
                <CardBody>
                  <Row>
                    <Colxx md="2">
                      {user.profile_picture !== null &&
                      user.profile_picture.length > 0 ? (
                        <img
                          alt="Client"
                          src={user.profile_picture}
                          className="user-img"
                        />
                      ) : (
                        <img
                          alt="Client"
                          src="/assets/img/profile-pic-l.jpg"
                          className="user-img"
                        />
                      )}
                    </Colxx>
                    <Colxx md="4" className="user-show-border">
                      <Row>
                        <Colxx md="12">
                          <h3>
                            {user.first_name} {user.last_name}
                          </h3>
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx md="5">
                          <Label>
                            <b>Phone:</b>
                          </Label>
                          <br />
                          <Label>
                            <b>CNIC:</b>
                          </Label>
                          <br />
                          <Label>
                            <b>Date of Birth:</b>
                          </Label>
                          <br />
                          <Label>
                            <b>Gender:</b>
                          </Label>
                        </Colxx>
                        <Colxx md="7">
                          <Label className="ml-3">{user.phone}</Label>
                          <br />
                          <Label className="ml-3">{user.cnic}</Label>
                          <br />
                          <Label className="ml-3">{user.age_range}</Label>
                          <br />
                          <Label className="ml-3">{user.gender}</Label>
                        </Colxx>
                      </Row>
                      <Row>
                        {user.approved_status === "Pending" ? (
                          <>
                            <Button
                              className="btn-success mr-2 user-show-btns"
                              color="success"
                              onClick={(event) =>
                                this.approveStatus(event, user)
                              }
                            >
                              {" "}
                              Approve{" "}
                            </Button>
                            <Button className="btn-success mr-2 user-show-btns">
                              {" "}
                              Reject{" "}
                            </Button>
                          </>
                        ) : user.approved_status === "Confirmed" ? (
                          <Button
                            className="btn-success mr-2 user-show-btns"
                            color="primary"
                          >
                            {" "}
                            Disable{" "}
                          </Button>
                        ) : (
                          <></>
                        )}
                      </Row>
                    </Colxx>
                    <Colxx md="4" className="user-show-border">
                      <Row>
                        <Colxx md="5">
                          <Label>
                            <b>Address:</b>
                          </Label>
                          <br />
                          <Label>
                            <b>Membership Id:</b>
                          </Label>
                        </Colxx>
                        <Colxx md="7">
                          <Label className="ml-3">
                            {user.addresses[0] !== undefined &&
                            user.addresses[0].address_1.lenght > 0 ? (
                              <>{user.addresses[0].address_1}</>
                            ) : (
                              <></>
                            )}
                          </Label>
                          <br />
                          <Label className="ml-3">
                            {user.user_details.membership_code}
                          </Label>
                        </Colxx>
                      </Row>
                    </Colxx>
                    <Colxx md="2">
                      <Label>
                        <b>Status:</b>
                      </Label>
                      <br />
                      {user.approved_status !== null ? (
                        <>
                          {user.approved_status === "Pending" ? (
                            <h4>
                              <span
                                class="badge badge-secondary"
                                color="danger"
                              >
                                Pending
                              </span>
                            </h4>
                          ) : user.approved_status === "Confirmed" ? (
                            <h4>
                              <span
                                class="badge badge-secondary"
                                color="success"
                              >
                                Approved
                              </span>
                            </h4>
                          ) : (
                            <></>
                          )}
                        </>
                      ) : (
                        <Label> Guest User </Label>
                      )}
                    </Colxx>
                  </Row>
                </CardBody>
              </Card>
            </Colxx>
          </Row>
          <Row></Row>
        </div>
      );
    }
  }
}

export default React.memo(UserShow);
