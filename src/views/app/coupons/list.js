import React, { Component } from "react";
import {
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Card,
  CardBody,
  Table,
  Label,
  Input,
} from "reactstrap";
import axios from "axios";
import { NavLink, Link } from "react-router-dom";

import { servicePath } from "../../../constants/defaultValues";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { NotificationManager } from "../../../components/common/react-notifications";
import Pagination from "reactive-pagination";
import "reactive-pagination/dist/index.css";
import { check_permission } from "../../../helpers/Utils";
import { trackPromise } from "react-promise-tracker";

class DataListPages extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");

    this.state = {
      displayMode: "list",

      selectedPageSize: 10,
      orderOptions: [
        { column: "title", label: "Product Name" },
        { column: "category", label: "Category" },
        { column: "status", label: "Status" },
      ],
      pageSizes: [10, 20, 30, 50, 100],

      categories: [
        { label: "Cakes", value: "Cakes", key: 0 },
        { label: "Cupcakes", value: "Cupcakes", key: 1 },
        { label: "Desserts", value: "Desserts", key: 2 },
      ],

      selectedOrderOption: { column: "title", label: "Product Name" },
      dropdownSplitOpen: false,
      modalOpen: false,
      currentPage: 1,
      activePage: 1,
      coupons_count: 0,
      totalItemCount: 0,
      totalPage: 1,
      search: "",
      selectedItems: [],
      lastChecked: null,
      isLoading: false,
      newDealTitle: "",
      userAction: "new",
      DealToEdit: "",
      deleteConfirmationModal: false,
      DealToDelete: "",
    };
  }

  componentDidMount() {
    this.dataListRender(1);
  }

  dataListRender(pageNum) {
    let url = servicePath + "/api/v2/coupons.json?page=" + pageNum;

    trackPromise(
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    ).then((response) => {
      if (response.status === 200 && response.data.coupons.length > 0) {
        this.setState({
          selectedItems: response.data.coupons,
          coupons_count: response.data.paging_data.total_records,
          activePage: pageNum,
          totalItemCount: response.data.length,
        });
      } else {
        NotificationManager.error(
          "Record not found",
          "",
          3000,
          null,
          null,
          "filled"
        );
        this.props.history.push("/app/coupons/list");
      }
    });
  }

  get_coupon = async (event) => {
    event.preventDefault();
    let value = event.target.elements["search_text"].value;
    let url = servicePath + "/api/v2/coupons.json?search_text=" + value;

    trackPromise(
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    ).then((response) => {
      if (response.status === 200 && response.data.coupons.length > 0) {
        this.setState({
          selectedItems: response.data.coupons,
          coupons_count: response.data.paging_data.total_records,
          activePage: 1,
          totalItemCount: response.data.length,
        });
      } else {
        NotificationManager.error(
          "Record not found",
          "",
          3000,
          null,
          null,
          "filled"
        );
        this.props.history.push("/app/coupons/list");
      }
    });
  };

  toggleDeleteConfirmationModal = (event, deal) => {
    if (this.state.deleteConfirmationModal === false) {
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
        dealToDelete: deal.id,
      });
    } else {
      // if delete confirmed then, first call delete function for service category
      if (event.target.classList.contains("delete-confirmed")) {
        this.deleteDeal();
      }
      this.setState({
        deleteConfirmationModal: !this.state.deleteConfirmationModal,
        dealToDelete: "",
      });
    }
  };

  deleteConfirmation = (event, deal) => {
    return (
      <Modal
        isOpen={this.state.deleteConfirmationModal}
        size="sm"
        toggle={this.toggleDeleteConfirmationModal}
      >
        <ModalHeader toggle={this.toggleSmall}>
          Are you sure you want to delete service category ?
        </ModalHeader>
        <ModalBody>
          <Button
            size="sm"
            onClick={(event) => this.toggleDeleteConfirmationModal(event)}
            className="btn-success mr-2 delete-confirmed"
          >
            {" "}
            Yes{" "}
          </Button>
          <Button
            size="sm"
            onClick={(event) => this.toggleDeleteConfirmationModal(event)}
            className="btn-success"
          >
            {" "}
            Cancel{" "}
          </Button>
        </ModalBody>
      </Modal>
    );
  };

  active_coupon = async (event, coupon_id, status) => {
    let self = this;
    event.preventDefault();
    await trackPromise(
      axios({
        method: "put",
        url: servicePath + "/api/v2/coupons/" + coupon_id + ".json",
        data: {
          coupon: {
            is_active_admin: status,
          },
        },
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          if (status) {
            NotificationManager.success(
              "Coupon Activated successfully",
              "",
              3000,
              null,
              null,
              "filled"
            );
          } else {
            NotificationManager.success(
              "Coupon Deactivated successfully",
              "",
              3000,
              null,
              null,
              "filled"
            );
          }
          self.dataListRender(1);
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

  render_single_coupon_row = (selectedItems) => {
    let deal_html = [];
    let self = this;
    selectedItems.map((coupon) => {
      deal_html.push(
        <>
          <tr>
            <td>
              <NavLink
                to={`/app/coupons/show/${coupon.id}`}
                className="w-40 w-sm-100"
              >
                <p className="list-item-heading mb-1 truncate">
                  {coupon.coupon_title}
                </p>
              </NavLink>
            </td>
            <td>{coupon.coupon_code}</td>
            <td>{coupon.discount_type}</td>
            <td>{coupon.discount_value}</td>
            <td>{coupon.start_datetime}</td>
            <td>{coupon.end_datetime}</td>
            <td>
              {coupon.coupon_status === "Current" ? (
                <>{coupon.is_active ? <>Active</> : <>Deactive</>}</>
              ) : (
                <>{coupon.coupon_status}</>
              )}
            </td>
            <td style={{ display: "flex" }}>
              {coupon.is_default ? (
                <></>
              ) : (
                <>
                  {coupon.coupon_status === "Current" ||
                  coupon.coupon_status === "Scheduled" ? (
                    <>
                      <Link
                        onClick={() =>
                          check_permission(
                            "coupons/update",
                            `edit_coupon/${coupon.id}`
                          )
                        }
                      >
                        <Button className="btn-success mr-2"> Edit </Button>
                      </Link>
                      {coupon.coupon_status === "Current" &&
                      coupon.is_active ? (
                        <>
                          <Link
                            onClick={(event) =>
                              self.active_coupon(event, coupon.id, false)
                            }
                          >
                            <Button className="btn-success mr-2">
                              {" "}
                              Deactive{" "}
                            </Button>
                          </Link>
                        </>
                      ) : coupon.coupon_status === "Current" &&
                        coupon.is_active === false ? (
                        <>
                          <Link
                            onClick={(event) =>
                              self.active_coupon(event, coupon.id, true)
                            }
                          >
                            <Button
                              className="btn-success mr-2"
                              color="success"
                            >
                              {" "}
                              Active{" "}
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <></>
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                </>
              )}
            </td>
          </tr>
        </>
      );
      return coupon;
    });

    return deal_html;
  };
  coupon_heading = () => {
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>Coupons</h1>
              <Link
                // to="create_setting"
                onClick={() =>
                  check_permission("coupons/create", "/app/coupons/new_coupon")
                }
              >
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}
                >
                  New Coupon
                </Button>
              </Link>
            </div>
          </Colxx>
        </Row>
        <Separator className="mb-2" />
      </>
    );
    return heading;
  };

  reset_form = () => {
    window.location.reload();
  };

  search_coupon = () => {
    let self = this;
    let search_coupon = <></>;
    search_coupon = (
      <>
        <Row className="mb-3 mt-3">
          <Colxx xxs="12">
            <form onSubmit={this.get_coupon} id="order-filter">
              <Row>
                <Colxx xxs="1">
                  <Label className="mt-2">
                    <strong>Search</strong>
                  </Label>
                </Colxx>
                <Colxx xxs="3">
                  <Input
                    className="form-control"
                    name="search_text"
                    required
                    placeholder="Enter Code or Title"
                  />
                </Colxx>
                <Colxx xxs="1">
                  <Button color="primary" size="sm" type="submit">
                    Search
                  </Button>
                </Colxx>
                <Colxx xxs="1">
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => self.reset_form()}
                  >
                    Clear
                  </Button>
                </Colxx>
              </Row>
            </form>
          </Colxx>
        </Row>
        <Separator className="mb-2" />
      </>
    );
    return search_coupon;
  };

  handlePageChange = async (pageNum) => {
    await this.dataListRender(pageNum);

    // this.setState({
    //   response_status: true,
    //   activePage: pageNum,
    //   orders_data: new_orders_data,
    // });
  };

  render() {
    const { selectedItems, coupons_count, activePage } = this.state;
    let self = this;

    return (
      <div>
        {this.deleteConfirmation()}
        {this.coupon_heading()}
        {this.search_coupon()}
        <Colxx xxs="12">
          <Card className="mb-4">
            <CardBody>
              <Table>
                <thead>
                  <tr>
                    <th> Title </th>
                    <th> Code </th>
                    <th> Type </th>
                    <th> Value </th>
                    <th> Start Date</th>
                    <th> End Date</th>
                    <th> Status</th>
                    <th> Actions </th>
                  </tr>
                </thead>
                <tbody>{self.render_single_coupon_row(selectedItems)}</tbody>
              </Table>
              <Pagination
                activePage={activePage}
                itemsCountPerPage={20}
                totalItemsCount={coupons_count}
                delimeter={5}
                onChange={this.handlePageChange}
                styling="rounded_primary"
              />
            </CardBody>
          </Card>
        </Colxx>
      </div>
    );
  }
}
export default DataListPages;
