import React, { Component } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Table,
  Button,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Label,
  ModalFooter,
} from "reactstrap";
import { NavLink, Link } from "react-router-dom";
import { Colxx } from "../../../components/common/CustomBootstrap";
import { servicePath } from "../../../constants/defaultValues";
import { check_permission } from "../../../helpers/Utils";
import { NotificationManager } from "../../../components/common/react-notifications";
import Select from "react-select";
import axios from "axios";
import moment from "moment";
import { getImage } from "../../../helpers/Utils";
import "../clients/clients.css";
import Pagination from "reactive-pagination";
import "reactive-pagination/dist/index.css";
import BeautyStars from "beauty-stars";
import { trackPromise } from "react-promise-tracker";

class UserShow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      order_jobs: [],
      currentPage: 1,
      activePage: 1,
      order_jobs_count: 0,
      totalPage: 1,
      toggle_technician_status_change_modal: false,
    };
    this.fetch_user = this.fetch_user.bind(this);
    this.fetch_orders = this.fetch_orders.bind(this);
  }

  async componentDidMount() {
    let user = await this.fetch_user();
    let order_jobs = await this.fetch_orders(1);

    this.setState({
      user: user,
      order_jobs: order_jobs,
    });
  }

  fetch_user = async () => {
    let user = {};
    const { match } = this.props;

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/technicians/" + match.params.id + ".json",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
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

  fetch_orders = async (pageNum) => {
    let order_jobs = {};
    const { match } = this.props;
    let self = this;
    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/orders/technician_orders.json?technician_id=" +
          match.params.id +
          "&page=" +
          pageNum,
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          order_jobs = response.data.order_jobs;
          self.setState({
            order_jobs_count: response.data.paging_data.total_records,
            activePage: pageNum,
          });
        } else {
          console.log(response);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });

    return order_jobs;
  };
  update_technician_status = async (event) => {
    event.preventDefault();
    let status = event.target.elements["tech_status"].value;
    const { user } = this.state;
    let self = this;

    await trackPromise(
      axios({
        method: "put",
        url: servicePath + "/api/v2/technicians/" + user.id + ".json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
        data: {
          user: {
            technician_status: status,
          },
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          self.setState({
            user: response.data,
            toggle_technician_status_change_modal: !self.state
              .toggle_technician_status_change_modal,
          });

          NotificationManager.success(
            "Technician Status updated successfully",
            "",
            3000,
            null,
            null,
            "filled"
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
  };

  capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  toggle_technician_status_change_modal = async (event) => {
    let result = await check_permission("technicians/update", "");
    if (result) {
      this.setState({
        toggle_technician_status_change_modal: !this.state
          .toggle_technician_status_change_modal,
      });
    }
  };

  render_change_order_technician_status_modal = () => {
    let technician_status_change_modal_html = (
      <>
        <Modal
          size="lg"
          isOpen={this.state.toggle_technician_status_change_modal}
          toggle={this.toggle_technician_status_change_modal}
        >
          <form onSubmit={this.update_technician_status}>
            <ModalHeader toggle={this.toggle_technician_status_change_modal}>
              Change Technician Status
            </ModalHeader>

            <ModalBody>
              <Select
                className="react-select"
                classNamePrefix="react-select"
                name="tech_status"
                onChange={(event) => this.set_technician_status(event)}
                defaultValue={[
                  {
                    label: "Beginner(In Training)",
                    value: "Beginner(In Training)",
                    key: 0,
                  },
                ]}
                options={[
                  {
                    label: "Beginner(In Training)",
                    value: "Beginner(In Training)",
                    key: 0,
                  },
                  {
                    label: "Intermediate(In Training)",
                    value: "Intermediate(In Training)",
                    key: 1,
                  },
                  { label: "Active", value: "Active", key: 2 },
                  { label: "On leaves", value: "On leaves", key: 3 },
                  { label: "Suspended", value: "Suspended", key: 4 },
                  { label: "Terminated", value: "Terminated", key: 5 },
                  { label: "Resigned", value: "Resigned", key: 6 },
                  {
                    label: "Missing in Action",
                    value: "Missing in action",
                    key: 7,
                  },
                  { label: "Contract Ended", value: "Contract ended", key: 8 },
                ]}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit">
                {" "}
                Submit{" "}
              </Button>
              <Button
                color="secondary"
                onClick={this.toggle_technician_status_change_modal}
              >
                {" "}
                Cancel{" "}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </>
    );

    return technician_status_change_modal_html;
  };

  set_technician_status = (event) => {
    let { user } = this.state;
    user.technician_status = event.value;

    this.setState({
      user: user,
    });
  };

  handlePageChange = async (pageNum) => {
    let order_jobs = await this.fetch_orders(pageNum);
    this.setState({
      order_jobs: order_jobs,
    });
  };

  render_orders_data = () => {
    const { order_jobs, activePage, order_jobs_count } = this.state;
    if (Object.keys(order_jobs).length === 0) {
      return <></>;
    } else {
      return (
        <Row className="mt-2">
          <Colxx mb="12">
            <Card className="mb-4">
              <CardBody>
                <CardTitle>Orders</CardTitle>

                <Table striped>
                  <thead>
                    <tr>
                      <th>#</th>

                      <th style={{ textAlign: "center" }}>Order Id</th>
                      <th style={{ textAlign: "center" }}>Job Id</th>
                      <th style={{ textAlign: "center" }}>Client Name</th>
                      <th style={{ textAlign: "center" }}>Service</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                      <th style={{ textAlign: "center" }}>Date</th>
                      <th style={{ textAlign: "center" }}>Discounts</th>
                      <th style={{ textAlign: "center" }}>Travel Charges</th>
                      <th style={{ textAlign: "center" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order_jobs.map((order, index) => {
                      return (
                        <tr>
                          <th scope="row">{index + 1}</th>
                          <NavLink
                            to={`/app/orders/show/${order.order_id}`}
                            className="w-40 w-sm-100"
                          >
                            <td>{order.order_id}</td>
                          </NavLink>
                          <td>{order.job_code}</td>
                          <td>
                            {order.client.first_name} {order.client.last_name}
                          </td>
                          <td width="100px">
                            <span className="services-div">
                              {order.order_services.map((single_service) => {
                                return (
                                  <span>{single_service.service_title}</span>
                                );
                              })}
                            </span>
                          </td>
                          <td>{order.job_status}</td>
                          <td>{order.order_date}</td>
                          <td>{order.job_discount}</td>
                          <td>{order.job_travel_charges}</td>
                          <td>{order.job_total_amount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                <Pagination
                  activePage={activePage}
                  itemsCountPerPage={20}
                  totalItemsCount={order_jobs_count}
                  delimeter={5}
                  onChange={this.handlePageChange}
                  styling="rounded_primary"
                />
              </CardBody>
            </Card>
          </Colxx>
        </Row>
      );
    }
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
              <Link
                // to={`/app/technicians/edit/${user.id}`}
                onClick={() =>
                  check_permission(
                    "technicians/update",
                    `/app/technicians/edit/${user.id}`
                  )
                }
              >
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
                      {getImage(user, "show")}
                      <strong
                        className="d-block bg-light text-dark text-center rounded pt-1 mt-5 btn-technician-status"
                        style={{ paddingBottom: "2px", cursor: "pointer" }}
                        user-id={user.id}
                        onClick={async (event) =>
                          this.toggle_technician_status_change_modal(event)
                        }
                      >
                        {user.technician_status}
                      </strong>
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
                            <b>Created: </b>
                          </Label>
                        </Colxx>
                        <Colxx md="7">
                          <Label className="ml-3">{user.created_at}</Label>
                        </Colxx>
                      </Row>

                      <Row>
                        <Colxx md="5">
                          <Label>
                            <b>Phone: </b>
                          </Label>
                        </Colxx>
                        <Colxx md="7">
                          <Label className="ml-3">{user.phone}</Label>
                        </Colxx>
                      </Row>

                      <Row>
                        <Colxx md="5">
                          <Label>
                            <b>CNIC: </b>
                          </Label>
                        </Colxx>
                        <Colxx md="7">
                          <Label className="ml-3">{user.cnic}</Label>
                        </Colxx>
                      </Row>

                      <Row>
                        <Colxx md="5">
                          <Label>
                            <b>Religion: </b>
                          </Label>
                        </Colxx>
                        <Colxx md="7">
                          <Label className="ml-3">{user.religion}</Label>
                        </Colxx>
                      </Row>

                      <Row>
                        <Colxx md="5">
                          <Label>
                            <b>Preffered Gender: </b>
                          </Label>
                        </Colxx>
                        <Colxx md="7">
                          <Label className="ml-3">
                            {user.preffered_gender}
                          </Label>
                        </Colxx>
                      </Row>

                      <Row>
                        <Colxx md="5">
                          <Label>
                            <b>Technician Code: </b>
                          </Label>
                        </Colxx>
                        <Colxx md="7">
                          <Label className="ml-3">{user.membership_code}</Label>
                        </Colxx>
                      </Row>

                      <Row>
                        <Colxx md="5">
                          <Label>
                            <b>Contract from: </b>
                          </Label>
                        </Colxx>
                        <Colxx md="7">
                          <Label className="ml-3">
                            {moment(user.contract_from?.split("T")[0]).format(
                              "MMMM Do YYYY"
                            )}
                          </Label>
                        </Colxx>
                      </Row>

                      <Row>
                        <Colxx md="5">
                          <Label>
                            <b>Contract to: </b>
                          </Label>
                        </Colxx>
                        <Colxx md="7">
                          <Label className="ml-3">
                            {moment(user.contract_to?.split("T")[0]).format(
                              "MMMM Do YYYY"
                            )}
                          </Label>
                        </Colxx>
                      </Row>

                      <Row>
                        <Colxx md="5">
                          <Label>
                            <b>Rating: </b>
                          </Label>
                        </Colxx>
                        <Colxx md="7">
                          <BeautyStars
                            // count={5}
                            // onChange={ratingChanged}
                            value={user.ratings}
                            size={14}
                            activeColor="#ffd700"
                            edit={false}
                            gap="5px"
                          />
                        </Colxx>
                      </Row>
                    </Colxx>
                    <Colxx md="3" className="user-show-border">
                      <Label>
                        <b>Working Days:</b>
                      </Label>
                      <br />
                      {user.technician_working_days.map((value, index) => {
                        return (
                          <>
                            <Label>{value.working_day}:</Label>
                            <Label className="ml-1">
                              {value.start_time} - {value.end_time}
                            </Label>
                            <br />
                          </>
                        );
                      })}
                    </Colxx>

                    <Colxx md="3">
                      <Label>
                        <b>Services:</b>
                      </Label>
                      <br />
                      <ul className="technician-services">
                        {user.technician_services.map((value, index) => {
                          return (
                            <>
                              <li>
                                {/* <Label> { value.service["service_title"] } </Label> */}
                                <Label> {value.service_title} </Label>
                              </li>
                            </>
                          );
                        })}
                      </ul>
                    </Colxx>
                  </Row>
                </CardBody>
              </Card>
            </Colxx>
          </Row>
          <Row></Row>
          {this.render_orders_data()}
          {this.render_change_order_technician_status_modal()}
        </div>
      );
    }
  }
}

export default React.memo(UserShow);
