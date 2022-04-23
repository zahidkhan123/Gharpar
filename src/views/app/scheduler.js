import React, { Component, Fragment } from "react";
import { Row, Label, Button } from "reactstrap";
import { Colxx } from "../../components/common/CustomBootstrap";
import { servicePath } from "../../constants/defaultValues";
import axios from "axios";
import { NotificationManager } from "../../components/common/react-notifications";
import "./scheduler.css";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { trackPromise } from "react-promise-tracker";
import SlotBorder from "../../../src/assets/images/slot-border.png";

export default class Scheduler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current_date:
        new Date().getFullYear() +
        "-" +
        (new Date().getMonth() + 1) +
        "-" +
        new Date().getDate(),
      calendarDate: moment(new Date()),
      calender: {
        heading: "Technicians",
        jobs: [],
        time_slots: [
          "09:00 AM",
          "10:00 AM",
          "11:00 AM",
          "12:00 PM",
          "01:00 PM",
          "02:00 PM",
          "03:00 PM",
          "04:00 PM",
          "05:00 PM",
          "06:00 PM",
          "07:00 PM",
          "08:00 PM",
          "09:00 PM",
          "10:00 PM",
          "11:00 PM",
        ],
      },
      cities: [],
      cities_json: [],
      current_city: "",
      current_service_category: [],
      default_city: "",
      default_service_category: [],
    };
  }

  componentDidMount = async () => {
    const { current_date } = this.state;
    let service_categories = await this.get_service_categories();
    let service_categories_dropdown_data =
      this.service_categories_dropdown_json(service_categories);
    let jobs = await this.get_resource_jobs(current_date);
    let cities = JSON.parse(localStorage.getItem("cities"));
    let cities_dropdown_data = this.cities_dropdown_json(cities);
    let self = this;
    document
      .getElementById("scheduler-section")
      .addEventListener("scroll", self.handleScroll);
    document
      .getElementById("scheduler-header")
      .addEventListener("scroll", self.handleTimeSlotsScroll);

    this.setState({
      calender: { ...this.state.calender, jobs: jobs },
      cities: cities,
      cities_json: cities_dropdown_data,
      service_categories_json: service_categories_dropdown_data,
    });
  };

  handleTimeSlotsScroll = (e) => {
    console.log(e.target.scrollLeft);
    let sLeft = e.target.scrollLeft;
    document.getElementById("scheduler-section").scrollLeft = sLeft;
  };

  handleScroll = (e) => {
    console.log(e.target.scrollLeft);
    let sLeft = e.target.scrollLeft;
    document.getElementById("scheduler-header").scrollLeft = sLeft;
  };

  cities_dropdown_json = (all_cities) => {
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

  service_categories_dropdown_json = (all_service_categories) => {
    let cities_dropdown_data = [];

    all_service_categories.forEach(function (currentValue) {
      if (!currentValue.is_deal) {
        cities_dropdown_data.push({
          label: currentValue.service_category_title,
          value: currentValue.id,
          key: currentValue.id,
        });
      }
    });
    return cities_dropdown_data;
  };

  handleChangeStart = async (date) => {
    let curr_date = date;
    curr_date = new Date(curr_date);

    curr_date =
      curr_date.getFullYear() +
      "-" +
      (curr_date.getMonth() + 1) +
      "-" +
      curr_date.getDate();

    let jobs = await this.get_resource_jobs(curr_date);

    this.setState({
      current_date: curr_date,
      calendarDate: date,
      calender: { ...this.state.calender, jobs: jobs },
    });
  };

  get_service_categories = async () => {
    let all_service_categories = [];

    await axios({
      method: "get",
      url: servicePath + "/api/v2/service_categories.json?is_deal=false",
      headers: {
        "Content-Type": "multipart/form-data",
        "AUTH-TOKEN": localStorage.getItem("auth_token"),
        "IS-ACCESSIBLE": true,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          all_service_categories = response.data.service_categories;
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

    return all_service_categories;
  };

  get_resource_jobs = async (curr_date) => {
    const { current_city, current_service_category } = this.state;
    let jobs = [];
    let url =
      servicePath +
      "/api/v2/order_jobs/scheduler.json?current_date=" +
      curr_date;

    if (current_city !== undefined && current_city !== "") {
      url += "&city_id=" + parseInt(current_city);
    }
    let category_ids = current_service_category.map(
      (single_category) => single_category.value
    );

    if (category_ids.length) {
      url += "&category_ids=" + category_ids;
    }

    await trackPromise(
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          jobs = response.data;
        } else {
          console.log(response);
        }
      })
      .catch((error) => {
        NotificationManager.error(
          error.response.data.message,
          "",
          3000,
          () => {
            alert("callback");
          },
          null,
          "filled"
        );
        console.log("error", error);
      });

    return jobs;
  };

  update_prev_date = async () => {
    const { current_date } = this.state;
    let curr_date = current_date;
    let calender_date = "";
    curr_date = new Date(curr_date);
    curr_date = new Date(curr_date.setDate(curr_date.getDate() - 1));
    calender_date = moment(curr_date);
    curr_date =
      curr_date.getFullYear() +
      "-" +
      (curr_date.getMonth() + 1) +
      "-" +
      curr_date.getDate();

    let jobs = await this.get_resource_jobs(curr_date);

    this.setState({
      current_date: curr_date,
      calendarDate: calender_date,
      calender: { ...this.state.calender, jobs: jobs },
    });
  };

  update_next_date = async () => {
    const { current_date } = this.state;
    let curr_date = current_date;
    let calender_date = "";
    curr_date = new Date(curr_date);
    curr_date = new Date(curr_date.setDate(curr_date.getDate() + 1));
    calender_date = moment(curr_date);
    curr_date =
      curr_date.getFullYear() +
      "-" +
      (curr_date.getMonth() + 1) +
      "-" +
      curr_date.getDate();

    let jobs = await this.get_resource_jobs(curr_date);

    this.setState({
      current_date: curr_date,
      calendarDate: calender_date,
      calender: { ...this.state.calender, jobs: jobs },
    });
  };

  render_calender_header_item = () => {
    const { calender } = this.state;
    let technicians_li_html = [];

    calender.time_slots.forEach((single_slot) => {
      technicians_li_html.push(
        <>
          <li>
            <div className="main-text">
              <span className="time-label"> {single_slot}</span>
            </div>
            <div className="time-slots">
              {/* <span>00 - 15</span>
              <span>16 - 30</span>
              <span>31 - 45</span>
              <span>46 - 00</span> */}
              <span>{single_slot.split(":")[0]}:15</span>
              <span>{single_slot.split(":")[0]}:30</span>
              <span>{single_slot.split(":")[0]}:45</span>
              <span>{parseInt(single_slot.split(":")[0]) + 1}:00</span>
            </div>
          </li>
        </>
      );
    });

    return technicians_li_html;
  };

  render_calender_header = () => {
    let calender_header = (
      <>
        <header>
          <ul id="scheduler-header">{this.render_calender_header_item()}</ul>
        </header>
      </>
    );

    return calender_header;
  };

  calculate_job_width = (single_job) => {
    let start_time = single_job.start_time;
    let end_time = single_job.end_time;

    let single_job_start_hour = parseInt(start_time.split(":")[0]);
    let single_job_start_minute = parseInt(start_time.split(":")[1]);

    let temporary_job_start_dateTime = new Date();
    temporary_job_start_dateTime.setHours(single_job_start_hour);
    temporary_job_start_dateTime.setMinutes(single_job_start_minute);
    temporary_job_start_dateTime.setSeconds(0);

    let single_job_end_hour = parseInt(end_time.split(":")[0]);
    let single_job_end_minute = parseInt(end_time.split(":")[1]);

    let temporary_job_end_dateTime = new Date();
    temporary_job_end_dateTime.setHours(single_job_end_hour);
    temporary_job_end_dateTime.setMinutes(single_job_end_minute);
    temporary_job_end_dateTime.setSeconds(0);

    let difference = Math.abs(
      temporary_job_end_dateTime - temporary_job_start_dateTime
    );
    let minutes_difference = Math.floor(difference / 1000 / 60);

    // For 1 minute, we are covering 3 pixels visually
    let job_pixels = minutes_difference * 4.66;

    return job_pixels;
  };

  calculate_job_offset = (single_job) => {
    // Get Calender start time details
    let calender_start_hour = 9;
    let calender_start_minute = 0;

    let temporary_calender_start_dateTime = new Date();
    temporary_calender_start_dateTime.setHours(calender_start_hour);
    temporary_calender_start_dateTime.setMinutes(calender_start_minute);
    temporary_calender_start_dateTime.setSeconds(0);

    // Get job Start Time Details
    let start_time = single_job.start_time;

    let single_job_start_hour = parseInt(start_time.split(":")[0]);
    let single_job_start_minute = parseInt(start_time.split(":")[1]);

    let temporary_job_start_dateTime = new Date();
    temporary_job_start_dateTime.setHours(single_job_start_hour);
    temporary_job_start_dateTime.setMinutes(single_job_start_minute);
    temporary_job_start_dateTime.setSeconds(0);

    let difference = Math.abs(
      temporary_calender_start_dateTime - temporary_job_start_dateTime
    );
    let minutes_difference = Math.floor(difference / 1000 / 60);

    // For 1 minute, we are covering 3 pixels visually
    let job_offset_pixels = minutes_difference * 4.66;

    return job_offset_pixels;
  };

  get_job_color = (single_job) => {
    let color = "#EC6A5E";

    if (single_job.status === "Assignment") {
      color = "#EC6A5E";
    } else if (single_job.status === "Complete") {
      color = "purple";
    } else if (single_job.status === "Confirmed") {
      color = "green";
    }

    return color;
  };

  convert_time_24_hour_format = (single_job) => {
    let curr_date = new Date();
    let start_time = null;
    let end_time = null;

    // Start time conversion to 24 hour format
    let start_time_hour = parseInt(single_job.start_time.split(":")[0]);
    let start_time_min = parseInt(single_job.start_time.split(":")[1]);
    curr_date.setHours(start_time_hour);
    curr_date.setMinutes(start_time_min);
    curr_date.setSeconds(0);
    start_time = moment(curr_date).format("LT");

    // End time conversion to 24 hour format
    let end_time_hour = parseInt(single_job.end_time.split(":")[0]);
    let end_time_min = parseInt(single_job.end_time.split(":")[1]);
    curr_date.setHours(end_time_hour);
    curr_date.setMinutes(end_time_min);
    curr_date.setSeconds(0);
    end_time = moment(curr_date).format("LT");

    return [start_time, end_time];
  };

  render_single_resource_jobs = (single_resource) => {
    let resource_job_rows = [];
    let self = this;

    single_resource.jobs.forEach((single_job) => {
      if (
        single_job.status !== "Suggestion" &&
        single_job.status !== "Declined"
      ) {
        // Calculate width of job
        let job_width = self.calculate_job_width(single_job);
        // Calculate offset of job
        let job_offset_width = self.calculate_job_offset(single_job);
        // Set Job Color
        let job_color = self.get_job_color(single_job);
        // Convert to 24 hour format
        let job_time_24_format = self.convert_time_24_hour_format(single_job);
        resource_job_rows.push(
          <>
            <a
              href={"/app/orders/show/" + single_job.order_id}
              target="_blank"
              className="time-entry"
              style={{
                width: parseInt(job_width) + "px",
                left: parseInt(job_offset_width) + "px",
                background: `${job_color} url(${SlotBorder})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                cursor: "pointer",
              }}
            >
              <p style={{ margin: "0" }}>
                {" "}
                Order #{single_job.order_id}, {single_job.area}{" "}
              </p>
              <p style={{ margin: "0" }}> Job #{single_job.job_code} </p>
              <p style={{ margin: "0" }}> Status: {single_job.status} </p>
              <p style={{ margin: "0" }}>
                {" "}
                <b>
                  {" "}
                  Time: {job_time_24_format[0]} : {job_time_24_format[1]}{" "}
                </b>{" "}
              </p>
            </a>
          </>
        );
      }
    });

    return resource_job_rows;
  };

  render_calender_rows = () => {
    const { calender } = this.state;
    let schedular_rows = [];
    let self = this;

    calender.jobs.forEach((single_resource) => {
      schedular_rows.push(
        <>
          <li>{self.render_single_resource_jobs(single_resource)}</li>
        </>
      );
    });

    return schedular_rows;
  };

  render_calender_main_content = () => {
    let calender_all_rows = (
      <>
        <ul className="room-timeline">{this.render_calender_rows()}</ul>
      </>
    );

    return calender_all_rows;
  };

  render_calender_technicians = () => {
    const { calender } = this.state;
    let technicians_li_html = [];

    calender.jobs.forEach((single_resource) => {
      technicians_li_html.push(
        <>
          <li>
            <strong className="technician-name" style={{ display: "block" }}>
              {single_resource.first_name} {single_resource.last_name}
            </strong>
            <span className="gp-id"> ({single_resource.membership_code}) </span>
          </li>
        </>
      );
    });

    return technicians_li_html;
  };

  render_calender = () => {
    let calender_html = (
      <>
        {this.render_calender_header()}
        <div id="gharpar-schedular">
          <aside>
            <ul> {this.render_calender_technicians()} </ul>
          </aside>

          <section id="scheduler-section">
            {this.render_calender_main_content()}
          </section>
        </div>
      </>
    );
    return calender_html;
  };

  set_city = (event) => {
    this.setState({
      current_city: event.value,
      default_city: event,
    });
  };

  set_service_category = (event) => {
    this.setState({
      current_service_category: event,
      default_service_category: event,
    });
  };

  filterData = async () => {
    const { current_date } = this.state;
    let jobs = await this.get_resource_jobs(current_date);

    this.setState({
      calender: { ...this.state.calender, jobs: jobs },
    });
  };

  clearFilter = async () => {
    const { current_date } = this.state;
    let date_today =
      new Date().getFullYear() +
      "-" +
      (new Date().getMonth() + 1) +
      "-" +
      new Date().getDate();
    this.state.current_city = "";
    this.state.current_service_category = [];
    this.state.default_city = "";
    this.state.default_service_category = [];
    this.state.current_date = date_today;
    this.state.calendarDate = moment(new Date());
    let jobs = await this.get_resource_jobs(date_today);

    this.setState({
      calender: { ...this.state.calender, jobs: jobs },
    });
  };

  render() {
    const {
      current_date,
      cities_json,
      service_categories_json,
      default_city,
      default_service_category,
    } = this.state;
    let current_date_format = moment(new Date(current_date)).format(
      "MMM DD, YYYY"
    );
    return (
      <Fragment>
        {/* <Row className="mb-5">
          <Colxx md="3">
            <h2>Scheduler</h2>
          </Colxx>
          <Colxx md="3">
            <Label>City</Label>
            <Select
              className="react-select"
              classNamePrefix="react-select"
              onChange={async (event) => {
                this.set_city(event);
              }}
              options={cities_json}
            />
          </Colxx>
          <Colxx md="3">
            <Label>Service Category</Label>
            <Select
              className="react-select"
              classNamePrefix="react-select"
              onChange={async (event) => {
                this.set_city(event);
              }}
              options={cities_json}
            />
          </Colxx>
        </Row> */}
        <div className="row" style={{ marginBottom: "20px" }}>
          <div className="col-3" style={{ fontSize: "20px" }}>
            Scheduler{" "}
          </div>
          <div
            className="col-3 mt-3"
            style={{
              display: "flex",
              alignItems: "center",
              // justifyContent: "center",
              fontSize: "26px",
            }}
          >
            <div
              className="glyph"
              onClick={this.update_prev_date}
              style={{
                background: "white",
                border: "1px solid black",
                borderRadius: "50%",
                padding: "5px",
                marginRight: "10px",
              }}
            >
              <div className={"glyph-icon simple-icon-arrow-left"}></div>
            </div>
            <div>
              {/* <Label className="mt-4">{current_date_format}</Label> */}
              <DatePicker
                style={{ fontSize: "30px" }}
                selected={this.state.calendarDate}
                onChange={this.handleChangeStart}
                dateFormat="DD MMMM, YYYY"
                required
              />
            </div>
            <div
              className="glyph"
              onClick={this.update_next_date}
              style={{
                background: "white",
                border: "1px solid black",
                borderRadius: "50%",
                padding: "5px",
                marginLeft: "10px",
              }}
            >
              <div className={"glyph-icon simple-icon-arrow-right"}></div>
            </div>
          </div>
          <div className="col-2">
            <Label>Cities</Label>
            <Select
              className="react-select"
              classNamePrefix="react-select"
              value={default_city}
              onChange={async (event) => {
                this.set_city(event);
              }}
              options={cities_json}
            />
          </div>
          <div className="col-2">
            <Label>Service Categories</Label>
            <Select
              className="react-select"
              classNamePrefix="react-select"
              isMulti
              value={default_service_category}
              onChange={async (event) => {
                this.set_service_category(event);
              }}
              options={service_categories_json}
            />
          </div>
          <div className="col-1 text-right">
            <Button
              size="sm"
              className="mt-4"
              color="success"
              onClick={(event) => this.filterData(event)}
            >
              Submit
            </Button>
          </div>
          <div className="col-1 text-left">
            <Button
              size="sm"
              className="mt-4"
              onClick={(event) => this.clearFilter(event)}
            >
              Clear
            </Button>
          </div>
        </div>
        {this.render_calender()}
      </Fragment>
    );
  }
}
