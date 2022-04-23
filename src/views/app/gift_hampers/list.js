import React, { Component } from "react";

import { Row, Button, Table, Label } from "reactstrap";
import Select from "react-select";
import CustomSelectInput from "../../../components/common/CustomSelectInput";

import { ContextMenuTrigger } from "react-contextmenu";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { check_permission } from "../../../helpers/Utils";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";
import Pagination from "reactive-pagination";
import "reactive-pagination/dist/index.css";

function collect(props) {
  return { data: props.data };
}

const apiUrl = servicePath + "/api/v2/gift_hampers.json";

class DataListPages extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");

    let city_ids_gifts = sessionStorage.getItem("city_ids_gifts");
    if (city_ids_gifts === null) {
      city_ids_gifts = [];
    } else {
      city_ids_gifts = JSON.parse(city_ids_gifts);
    }

    this.state = {
      displayMode: "list",

      selectedPageSize: 10,

      selectedOrderOption: { column: "title", label: "Product Name" },
      dropdownSplitOpen: false,
      modalOpen: false,
      currentPage: 1,
      totalItemCount: 0,
      totalPage: 1,
      search: "",
      selectedItems: [],
      lastChecked: null,
      isLoading: false,
      newCityName: "",

      userAction: "new",
      cityToEdit: "",

      deleteConfirmationModal: false,
      cityToDelete: "",

      areaAction: "areaModalOpen",
      areaModalOpen: false,
      targetCity: "",
      selected_cities: [],
      active_page: 1,
      select_cities_value: city_ids_gifts,
    };
  }

  componentDidMount() {
    let cities = JSON.parse(localStorage.getItem("cities"));
    let cities_json = this.cities_json(cities);
    this.setState({
      cities: cities,
      cities_json: cities_json,
    });
    this.dataListRender(1);
  }

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

  dataListRender(page) {
    const { select_cities_value } = this.state;
    let self = this;
    let url;
    let city_ids = select_cities_value.map((single_city) => single_city.value);

    if (this.state.search !== "") {
      url =
        servicePath +
        "/api/v2/cities.json?default_role=admin&search_data=" +
        this.state.search;
    } else {
      url = apiUrl + "?page=" + page;
    }
    if (city_ids.length) {
      url = apiUrl + "?page=" + page + "&city_ids=" + city_ids;
    }
    trackPromise(
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    ).then((response) => {
      if (response.data.gift_hampers.length > 0) {
        self.setState({
          selectedItems: response.data.gift_hampers,
          totalItemCount: response.data.paging_data.total_records,
          active_page: page,
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
        // this.props.history.push("/app/cities/list");
      }
    });
  }

  activateGiftHamper = async (event, gift_id, status) => {
    let self = this;
    const { active_page } = this.state;
    await trackPromise(
      axios.get(
        servicePath + "/api/v2/gift_hampers/" + gift_id + "/change_status.json",
        {
          headers: {
            "Content-Type": "application/json",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
            "IS-ACCESSIBLE": true,
          },
        }
      )
    )
      .then((response) => {
        if (response.status === 200) {
          NotificationManager.success(
            "Updated Successfully",
            "",
            5000,
            () => {
              alert("callback");
            },
            null,
            "filled"
          );
          self.dataListRender(active_page);
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

  handlePageChange = async (pageNum) => {
    await this.dataListRender(pageNum);
  };

  render_single_row = (selectedItems) => {
    let self = this;
    let setting_html = [];
    selectedItems.forEach(function (single_gift) {
      setting_html.push(
        <tr>
          <td style={{ textAlign: "center" }}>{single_gift.id}</td>
          <td style={{ textAlign: "center" }}>{single_gift.city_name}</td>
          <td>{single_gift.content}</td>
          <td style={{ textAlign: "center" }}>
            {single_gift.gift_hamper_usage_count} / {single_gift.gift_hampers}
          </td>
          <td>
            <Link to={`usage_list/${single_gift.id}`}>
              <Button size="sm" className="btn-warning">
                {" "}
                Details{" "}
              </Button>
            </Link>
          </td>
          {single_gift.gift_hamper_usage_count === single_gift.gift_hampers ? (
            <></>
          ) : (
            <>
              <td>
                {single_gift.is_active ? (
                  <>
                    <Link to={`edit/${single_gift.id}`}>
                      <Button size="sm" className="btn-success mr-2">
                        {" "}
                        Edit{" "}
                      </Button>
                    </Link>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={(event) =>
                        self.activateGiftHamper(event, single_gift.id, false)
                      }
                      className="ml-3"
                    >
                      {" "}
                      Deactivate{" "}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to={`edit/${single_gift.id}`}>
                      <Button size="sm" className="btn-success mr-2">
                        {" "}
                        Edit{" "}
                      </Button>
                    </Link>
                    <Button
                      color="success"
                      size="sm"
                      onClick={(event) =>
                        self.activateGiftHamper(event, single_gift.id, true)
                      }
                      className="ml-3"
                    >
                      {" "}
                      Activate{" "}
                    </Button>
                  </>
                )}
              </td>
            </>
          )}
        </tr>
      );
    });
    return setting_html;
  };

  filter_data = async (event) => {
    event.preventDefault();
    const { selected_cities, active_page, select_cities_value } = this.state;
    let self = this;
    let url = "";
    let city_ids = select_cities_value.map((single_city) => single_city.value);
    if (city_ids.length) {
      url = apiUrl + "?page=" + active_page + "&city_ids=" + city_ids;
    } else {
      url = apiUrl + "?page=" + active_page;
    }
    trackPromise(
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    ).then((response) => {
      if (response.data.gift_hampers.length > 0) {
        self.setState({
          selectedItems: response.data.gift_hampers,
          totalItemCount: response.data.paging_data.total_records,
          active_page: 1,
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
        // this.props.history.push("/app/cities/list");
      }
    });
  };

  handle_city_change = (city) => {
    // const { selected_cities } = this.state;
    // let self = this;
    // this.state.selected_cities = [];
    // event.map((val) => {
    //   this.setState({
    //     selected_cities: [...selected_cities, val.value],
    //   });
    // });
    sessionStorage.setItem("city_ids_gifts", JSON.stringify(city));
    this.setState({
      select_cities_value: city,
    });
  };

  clear_form = async (event) => {
    sessionStorage.removeItem("city_ids_gifts");

    this.state.select_cities_value = [];
    window.location.reload();
  };

  settings_heading = () => {
    const { cities_json, select_cities_value } = this.state;
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>Gift Hampers</h1>
              <Link
                // to="create_setting"
                onClick={() =>
                  check_permission(
                    "gift_hampers/create",
                    `/app/gift_hampers/create_gift`
                  )
                }
              >
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}
                >
                  New Gift
                </Button>
              </Link>
            </div>
          </Colxx>
        </Row>

        <form onSubmit={this.filter_data}>
          <Row className="mb-3">
            <Colxx xxs="3">
              <Label className="mt-3">Select City</Label>
              <Select
                components={{ Input: CustomSelectInput }}
                // name="gift_hamper[city_id]"
                isMulti
                className="react-select"
                classNamePrefix="react-select"
                value={select_cities_value}
                onChange={this.handle_city_change}
                options={cities_json}
              />
            </Colxx>
            <Colxx xxs="1">
              <Button color="primary" size="sm" type="submit" className="mt-5">
                Submit
              </Button>
            </Colxx>
            <Colxx xxs="1">
              <Button
                className="mt-5"
                size="sm"
                color="danger"
                onClick={(event) => {
                  this.clear_form(event);
                }}
              >
                Clear
              </Button>
            </Colxx>
          </Row>
        </form>

        <Separator className="mb-2" />
      </>
    );
    return heading;
  };

  render() {
    const { selectedItems, totalItemCount, active_page } = this.state;

    return (
      <div>
        {this.settings_heading()}
        {selectedItems.length ? (
          <>
            <Row>
              <Colxx md="12">
                <Table striped>
                  <thead className="text-center">
                    <th>Id</th>
                    <th>City</th>
                    <th>Content</th>
                    <th>Usage</th>
                    <th>Actions</th>
                    <th></th>
                  </thead>
                  <tbody>{this.render_single_row(selectedItems)}</tbody>
                </Table>
                <Pagination
                  activePage={active_page}
                  itemsCountPerPage={20}
                  totalItemsCount={totalItemCount}
                  delimeter={5}
                  onChange={this.handlePageChange}
                  styling="rounded_primary"
                />
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
