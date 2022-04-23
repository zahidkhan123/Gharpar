import React, { Component } from "react";

import {
  Row,
  Button,
  Card,
  CardBody,
  Table,
  Label,
  Badge,
  Input,
} from "reactstrap";
import "./style.css";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import Select from "react-select";
import { Colxx, Separator } from "../../../components/common/CustomBootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { Tabs, DateRangePicker, Popover } from "element-react";
import { servicePath } from "../../../constants/defaultValues";
import AddNewAreaModal from "../../../containers/pages/AddNewAreaModal";
import { NotificationManager } from "../../../components/common/react-notifications";
import EditRatingOrder from "./edit_ratings";
import SubmitComplaint from "./complaint";
// import Pagination from './pagination_test'
import Pagination from "reactive-pagination";
import "reactive-pagination/dist/index.css";
import { check_permission } from "../../../helpers/Utils";
import { trackPromise } from "react-promise-tracker";

class DataListPages extends Component {
  constructor(props) {
    super(props);
    this.mouseTrap = require("mousetrap");

    let technician_ids = sessionStorage.getItem("technician_ids");
    if (technician_ids === null) {
      technician_ids = [];
    } else {
      technician_ids = JSON.parse(technician_ids);
    }

    let city_ids = sessionStorage.getItem("rating_city_ids");
    if (city_ids === null) {
      city_ids = [];
    } else {
      city_ids = JSON.parse(city_ids);
    }

    let rating_ids = sessionStorage.getItem("rating_ids");
    if (rating_ids === null) {
      rating_ids = [];
    } else {
      rating_ids = JSON.parse(rating_ids);
    }
    let search_type = sessionStorage.getItem("search_type");
    if (search_type === null) {
      search_type = [{ label: "Feedback Date", value: "rated_at" }];
    } else {
      search_type = JSON.parse(search_type);
    }

    let rated_date = sessionStorage.getItem("rated_date");
    if (rated_date === null) {
      rated_date = "";
    }

    this.state = {
      displayMode: "list",

      selectedPageSize: 10,

      selectedOrderOption: { column: "title", label: "Product Name" },
      dropdownSplitOpen: false,
      modalOpen: false,
      complaintModalOpen: false,
      currentPage: 1,
      activePage: 1,
      order_jobs_count: 0,
      totalPage: 1,
      search: "",
      order_jobs: [],
      rating_value: [],
      unrated_orders: [],
      unrated_orders_count: 0,
      select_technician_ids: technician_ids,
      select_rating_ids: rating_ids,
      select_city_ids: city_ids,
      lastChecked: null,
      isLoading: false,
      newCityName: "",
      activeTab: "Rated Jobs",
      userAction: "new",
      orderToEdit: [],
      jobComplaint: [],
      all_technicians: [],
      technicians_dropdown: [],
      complaintCategories: [],
      pagination: "jobs",
      deleteConfirmationModal: false,
      cityToDelete: "",
      is_filters: true,
      areaAction: "areaModalOpen",
      areaModalOpen: false,
      targetCity: "",
      follow_up: "",
      value2: "",
      loader: false,
      search_type: search_type,
      order_job_complaint: {},
      ratings: [
        {
          label: "1",
          value: "1",
          key: 1,
        },
        {
          label: "2",
          value: "2",
          key: 2,
        },
        {
          label: "3",
          value: "3",
          key: 3,
        },
        {
          label: "4",
          value: "4",
          key: 4,
        },
        {
          label: "5",
          value: "5",
          key: 5,
        },
      ],
    };
    this.rating_seen = this.rating_seen.bind(this);
    this.updateRating = this.updateRating.bind(this);
    this.addFollowUp = this.addFollowUp.bind(this);
    this.addComplaint = this.addComplaint.bind(this);
    this.set_follow_up = this.set_follow_up.bind(this);
    this.ratingChanged = this.ratingChanged.bind(this);
    this.setDiscountPrice = this.setDiscountPrice.bind(this);
    this.jobRatingChanged = this.jobRatingChanged.bind(this);
  }

  async componentDidMount() {
    await this.dataListRender(1);
    let all_technicians = await this.get_all_technicians();
    let all_cities = JSON.parse(localStorage.getItem("cities"));
    let technicians_dropdown = this.technicians_dropdown(all_technicians);
    let cities_dropdown = this.cities_dropdown(all_cities);

    this.setState({
      all_technicians: all_technicians,
      technicians_dropdown: technicians_dropdown,
      all_cities: all_cities,
      cities_dropdown: cities_dropdown,
    });
  }

  get_all_technicians = async () => {
    let all_technicians = [];

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/technicians/get_technicians_for_filters.json?default_role=Technician",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          all_technicians = response.data.users;
        } else {
          console.log(response);
        }
      })
      .catch((error) => {
        NotificationManager.error(
          error.response.data.message,
          "",
          5000,
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });
    return all_technicians;
  };

  technicians_dropdown = (all_technicians) => {
    let technicians_dropdown = [];

    all_technicians.forEach(function (currentValue) {
      let name_code =
        currentValue.first_name +
        " " +
        currentValue.last_name +
        " (" +
        currentValue.technician_code +
        ")";
      technicians_dropdown.push({
        label: name_code,
        value: currentValue.id,
        key: currentValue.id,
      });
    });

    return technicians_dropdown;
  };

  get_all_cities = async () => {
    let all_cities = [];

    await axios({
      method: "get",
      url: servicePath + "/api/v2/cities.json",
      headers: {
        "Content-Type": "multipart/form-data",
        "AUTH-TOKEN": localStorage.getItem("auth_token"),
        "IS-ACCESSIBLE": true,
      },
    })
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
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });

    return all_cities;
  };

  get_all_complaint_categories = async () => {
    let all_complain_categories = [];

    await axios({
      method: "get",
      url: servicePath + "/api/v2/complaint_categories.json",
      headers: {
        "Content-Type": "application/json",
        "AUTH-TOKEN": localStorage.getItem("auth_token"),
        "IS-ACCESSIBLE": true,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          all_complain_categories = response.data.complaint_categories;
        } else {
          console.log(response);
        }
      })
      .catch((error) => {
        NotificationManager.error(
          error.response.data.message,
          "",
          5000,
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });

    return all_complain_categories;
  };

  cities_dropdown = (all_cities) => {
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

  toggleModal = async (event, order) => {
    event.preventDefault();
    let result = await check_permission("orders/order_feedback", "");
    if (result) {
      if (this.state.modalOpen === true) {
        // Modal current state is true before chaning. It means we are going to close it
        this.setState({
          modalOpen: !this.state.modalOpen,
          // orderToEdit: order,
          follow_up: "",
          rating_value: [],
        });
      } else {
        this.setState({
          modalOpen: !this.state.modalOpen,
          orderToEdit: order,
          follow_up: "",
          rating_value: [],
        });
      }
    }
  };

  toggleModalComplaint = async (event, order_job) => {
    event.preventDefault();
    let jobComplaint = order_job;
    let complaintCategories = await this.get_all_complaint_categories();
    let complaint_categories_dropdown =
      this.complaint_categories_dropdown(complaintCategories);
    let result = await check_permission(
      "order_job_complaints/save_complaint",
      ""
    );
    if (result) {
      if (this.state.complaintModalOpen === true) {
        // Modal current state is true before chaning. It means we are going to close it
        this.setState({
          complaintModalOpen: !this.state.complaintModalOpen,
          // orderToEdit: order,
        });
      } else {
        if (jobComplaint.order_job_complaint !== undefined) {
          this.setState({
            order_job_complaint: {
              id: jobComplaint.order_job_complaint.id,
              discount: jobComplaint.order_job_complaint.discount,
              penalty: jobComplaint.order_job_complaint.penalty,
              tat: jobComplaint.order_job_complaint.tat,
              complaint_level: jobComplaint.order_job_complaint.complaint_level,
              rating: jobComplaint.order_job_complaint.rating,
              default_category: [
                {
                  label:
                    jobComplaint.order_job_complaint.complaint_category_title,
                  value: jobComplaint.order_job_complaint.complaint_category_id,
                },
              ],
              default_sub_category: [
                {
                  label:
                    jobComplaint.order_job_complaint
                      .complaint_category_reason_title,
                  value:
                    jobComplaint.order_job_complaint
                      .complaint_category_reason_id,
                },
              ],
              default_follow_up: [
                {
                  label: jobComplaint.order_job_complaint.csr_follow_up,
                  value: jobComplaint.order_job_complaint.csr_follow_up,
                },
              ],
              default_status: [
                {
                  label: jobComplaint.order_job_complaint.status,
                  value: jobComplaint.order_job_complaint.status,
                },
              ],
              default_csr_comment: jobComplaint.order_job_complaint.csr_comment,
              default_tm_comment: jobComplaint.order_job_complaint.tm_comment,
              default_beautician_comment:
                jobComplaint.order_job_complaint.beautician_comment,
              default_escalate: jobComplaint.order_job_complaint.escalate_to_tm,
            },
            complaintModalOpen: !this.state.complaintModalOpen,
            jobComplaint: order_job,
            complaintCategories: complaintCategories,
            complaintCategoriesData: complaint_categories_dropdown,
          });
        } else {
          this.setState({
            order_job_complaint: {
              id: "",
              discount: 0,
              penalty: 0,
              tat: "",
              complaint_level: "",
              rating: jobComplaint.job_rating,
              default_category: [],
              default_sub_category: [],
              default_follow_up: [],
              default_status: [],
              default_csr_comment: "",
              default_escalate: false,
            },
            complaintModalOpen: !this.state.complaintModalOpen,
            jobComplaint: order_job,
            complaintCategories: complaintCategories,
            complaintCategoriesData: complaint_categories_dropdown,
          });
        }
      }
    }
  };

  complaint_categories_dropdown = (all_complaint_categories) => {
    let complaint_categories_dropdown = [];

    all_complaint_categories.forEach(function (currentValue) {
      complaint_categories_dropdown.push({
        label: currentValue.title,
        value: currentValue.id,
        key: currentValue.id,
      });
    });

    return complaint_categories_dropdown;
  };

  onSearchKey = (e) => {
    if (e.key === "Enter") {
      this.setState(
        {
          search: e.target.value.toLowerCase(),
        },
        () => this.dataListRender()
      );
    }
  };

  addComplaint = async (event, order_id) => {
    event.preventDefault();
    let formData = new FormData(event.target);
    let self = this;

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/order_job_complaints/save_complaint.json",
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
          self.setState({
            complaintModalOpen: false,
          });

          NotificationManager.success(
            "Complaint Submitted successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );

          self.dataListRender(1);
          // self.get_unrated_orders(1);
          // self.props.history.push("/app/cities/list");
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

  addFollowUp = async (event, order_id) => {
    event.preventDefault();
    let formData = new FormData(event.target);
    let self = this;

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/follow_ups.json",
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
          self.setState({
            modalOpen: false,
            follow_up: "",
            rating_value: [],
          });

          NotificationManager.success(
            "Follow ups has been added successfully",
            "",
            3000,
            null,
            null,
            "filled"
          );

          // self.dataListRender(1);
          self.get_unrated_orders(1);
          // self.props.history.push("/app/cities/list");
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

  set_follow_up = (event, follow_up) => {
    this.setState({
      follow_up: follow_up,
    });
  };

  updateRating = async (event, order_id) => {
    event.preventDefault();
    let self = this;
    let added_all_ratings = true;
    let rating_value =
      event.target.elements["order[order_jobs_attributes][][job_rating]"];
    if (rating_value.length > 0) {
      rating_value.forEach((single_rating) => {
        if (single_rating.value === "") {
          added_all_ratings = false;
        }
      });
    }

    if (added_all_ratings) {
      let formData = new FormData(event.target);

      await trackPromise(
        axios({
          method: "post",
          url:
            servicePath +
            "/api/v2/orders/ " +
            order_id +
            "/order_feedback.json",
          data: formData,
          headers: {
            "Content-Type": "application/json",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
          },
        })
      )
        .then((response) => {
          if (response.status === 200) {
            self.setState({
              modalOpen: false,
              activeTab: "Unrated Orders",
              rating_value: [],
            });

            NotificationManager.success(
              "Ratings has been added successfully",
              "",
              3000,
              null,
              null,
              "filled"
            );
            // document.getElementsByName("Rated Jobs")[0].click();
            // self.dataListRender(1);
            self.get_unrated_orders(1);
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
    } else {
      NotificationManager.error(
        "Please Rate all the Technicians",
        "",
        5000,
        () => {
          alert("callback");
        },
        null,
        "filled"
      );
    }
  };

  setDiscountPrice = (sub_category) => {
    this.setState((prevState) => ({
      order_job_complaint: {
        ...prevState.order_job_complaint,
        discount: sub_category.discount,
        penalty: sub_category.penalty,
        tat: sub_category.tat,
        complaint_level: sub_category.complaint_level,
      },
    }));
  };

  jobRatingChanged = (newRating, job) => {
    this.setState({
      rating_value: [...this.state.rating_value, { newRating, job }],
    });
  };

  ratingChanged = (newRating) => {
    this.setState((prevState) => ({
      order_job_complaint: {
        ...prevState.order_job_complaint,
        rating: newRating,
      },
    }));
  };

  csv_export_data = async () => {
    const {
      value2,
      select_technician_ids,
      select_rating_ids,
      select_city_ids,
      search_type,
    } = this.state;

    let date = value2;
    if (date === null) {
      date = "";
    } else {
      sessionStorage.setItem("rated_date", date);
    }

    let technician_ids = select_technician_ids.map(
      (technician) => technician.value
    );

    let city_ids = select_city_ids.map((city) => city.value);

    let rating_ids = select_rating_ids.map((rating) => rating.value);

    let url = servicePath + "/api/v2/csv_reports/ratings.csv?";

    if (technician_ids.length) {
      url += "&technician_ids=" + technician_ids;
    }
    if (rating_ids.length) {
      url += "&job_ratings=" + rating_ids;
    }
    if (city_ids.length) {
      url += "&city_ids=" + city_ids;
    }
    if (date !== "") {
      url += "&search_date=" + date;
    }
    if (search_type !== undefined && search_type !== "") {
      if (search_type.length !== undefined && search_type.length) {
        url += "&search_type=" + search_type[0].value;
      } else {
        url += "&search_type=" + search_type.value;
      }
    }

    window.open(url, "_blank");
  };

  dataListRender = async (pageNum, order_id) => {
    const {
      value2,
      select_technician_ids,
      select_rating_ids,
      select_city_ids,
      search_type,
    } = this.state;

    let self = this;
    let date = value2;
    if (date === null) {
      date = "";
    } else {
      sessionStorage.setItem("rated_date", date);
    }

    let technician_ids = select_technician_ids.map(
      (technician) => technician.value
    );

    let city_ids = select_city_ids.map((city) => city.value);

    let rating_ids = select_rating_ids.map((rating) => rating.value);

    let url = servicePath + "/api/v2/reports/ratings.json?page=" + pageNum;

    if (technician_ids.length) {
      url += "&technician_ids=" + technician_ids;
    }
    if (rating_ids.length) {
      url += "&job_ratings=" + rating_ids;
    }
    if (city_ids.length) {
      url += "&city_ids=" + city_ids;
    }
    if (date !== "") {
      url += "&search_date=" + date;
    }
    if (search_type !== undefined && search_type !== "") {
      if (search_type.length !== undefined && search_type.length) {
        url += "&search_type=" + search_type[0].value;
      } else {
        url += "&search_type=" + search_type.value;
      }
    }
    if (order_id !== undefined && order_id !== "") {
      url += "&order_id=" + order_id;
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
    ).then((response) => {
      if (response.data.order_jobs.length > 0) {
        self.setState({
          order_jobs: response.data.order_jobs,
          order_jobs_count: response.data.paging_data.total_records,
          activePage: pageNum,
          pagination: "jobs",
          is_filters: true,
          loader: false,
        });
      } else {
        self.setState({
          order_jobs: response.data.order_jobs,
          order_jobs_count: response.data.paging_data.total_records,
          activePage: pageNum,
          pagination: "jobs",
          is_filters: true,
          loader: false,
        });
        NotificationManager.error(
          "Record not found",
          "",
          3000,
          null,
          null,
          "filled"
        );
      }
    });
  };

  renderEditRatingModal = (city, event) => {
    const { modalOpen, orderToEdit, follow_up, rating_value } = this.state;

    const toggleModal = this.toggleModal;
    const updateRating = this.updateRating;
    const addFollowUp = this.addFollowUp;
    const set_follow_up = this.set_follow_up;
    const jobRatingChanged = this.jobRatingChanged;

    return (
      <EditRatingOrder
        modalOpen={modalOpen}
        updateRating={updateRating}
        addFollowUp={addFollowUp}
        toggleModal={toggleModal}
        orderToEdit={orderToEdit}
        follow_up={follow_up}
        set_follow_up={set_follow_up}
        jobRatingChanged={jobRatingChanged}
        rating_value={rating_value}
      />
    );
  };

  renderSubmitComplaintModal = (city, event) => {
    const {
      complaintModalOpen,
      jobComplaint,
      complaintCategories,
      complaintCategoriesData,
      order_job_complaint,
    } = this.state;

    const toggleModalComplaint = this.toggleModalComplaint;
    const updateRating = this.updateRating;
    const setDiscountPrice = this.setDiscountPrice;
    const addComplaint = this.addComplaint;
    const set_follow_up = this.set_follow_up;
    const ratingChanged = this.ratingChanged;

    return (
      <SubmitComplaint
        complaintModalOpen={complaintModalOpen}
        // updateRating={updateRating}
        addComplaint={addComplaint}
        toggleModalComplaint={toggleModalComplaint}
        jobComplaint={jobComplaint}
        complaintCategories={complaintCategories}
        complaintCategoriesData={complaintCategoriesData}
        orderJobComplaint={order_job_complaint}
        setDiscountPrice={setDiscountPrice}
        ratingChanged={ratingChanged}
        // rating_value={rating_value}
      />
    );
  };

  renderAreaModal = (event) => {
    const { areaAction, areaModalOpen, targetCity } = this.state;

    const toggleModalArea = this.toggleModalArea;

    if (areaModalOpen) {
      return (
        <AddNewAreaModal
          areaModalOpen={areaModalOpen}
          toggleModalArea={toggleModalArea}
          targetCity={targetCity}
          areaAction={areaAction}
        />
      );
    }
  };

  rating_seen = async (event, order_job_id) => {
    const { activePage } = this.state;
    let self = this;
    let success = false;
    let result = await check_permission("order_jobs/order_job_seen", "");
    if (result) {
      await trackPromise(
        axios.get(
          servicePath +
            "/api/v2/order_jobs/" +
            order_job_id +
            "/order_job_seen.json",
          {
            headers: {
              "Content-Type": "application/json",
              "AUTH-TOKEN": localStorage.getItem("auth_token"),
            },
          }
        )
      )
        .then((response) => {
          if (response.status === 200) {
            success = true;
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
    }

    if (success) {
      await self.dataListRender(activePage);
    }
  };

  get_unrated_orders = async (pageNum, order_id) => {
    const { value2, select_city_ids } = this.state;

    let self = this;
    let date = value2;
    if (date === null) {
      date = "";
    } else {
      sessionStorage.setItem("rated_date", date);
    }

    let city_ids = select_city_ids.map((city) => city.value);

    let url =
      servicePath + "/api/v2/orders/orders_feedback.json?page=" + pageNum;

    if (city_ids.length) {
      url += "&city_ids=" + city_ids;
    }
    if (date !== "") {
      url += "&order_date=" + date;
    }
    if (order_id !== undefined && order_id !== "") {
      url += "&order_id=" + order_id;
    }

    await trackPromise(
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          if (
            response.data.orders !== undefined &&
            response.data.orders.length > 0
          ) {
            self.setState({
              unrated_orders: response.data.orders,
              unrated_orders_count: response.data.paging_data.total_records,
              activePage: pageNum,
              pagination: "orders",
              is_filters: false,
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
          }
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
    const { pagination } = this.state;
    if (pagination === "jobs") {
      await this.dataListRender(pageNum);
    } else {
      await this.get_unrated_orders(pageNum);
    }

    // this.setState({
    //   response_status: true,
    //   activePage: pageNum,
    //   orders_data: new_orders_data,
    // });
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { activeTab } = this.state;
    let order_id = "";
    // if (event.target.elements["search_type"] !== undefined) {
    //   search_type = event.target.elements["search_type"].value;
    // }
    if (event.target.elements["order_id"] !== undefined) {
      order_id = event.target.elements["order_id"].value;
    }
    if (activeTab === "Rated Jobs") {
      await this.dataListRender(1, order_id);
    } else {
      await this.get_unrated_orders(1, order_id);
    }
  };

  get_order_by_status = async (event, status) => {
    // event.preventDefault();
    let self = this;

    sessionStorage.removeItem("technician_ids");
    sessionStorage.removeItem("rating_ids");
    sessionStorage.removeItem("rated_date");
    sessionStorage.removeItem("rated_city_ids");
    this.state.select_technician_ids = [];
    this.state.select_rating_ids = [];
    this.state.select_city_ids = [];
    this.state.value2 = "";

    this.setState({
      activeTab: status,
    });
    if (status === "Rated Jobs") {
      await self.dataListRender(1);
    } else {
      await self.get_unrated_orders(1);
    }
  };

  clear_form = async (event) => {
    // const { response_status } = this.state;
    sessionStorage.removeItem("technician_ids");
    sessionStorage.removeItem("rating_ids");
    sessionStorage.removeItem("rated_date");
    sessionStorage.removeItem("rated_city_ids");
    sessionStorage.removeItem("search_type");
    this.state.search_type = [];
    this.state.select_technician_ids = [];
    this.state.select_rating_ids = [];
    this.state.select_city_ids = [];
    this.state.value2 = "";
    await this.dataListRender(1);
  };

  set_comment = (job) => {
    let comment_html = [];
    comment_html = <>{job.comments}</>;
    return comment_html;
  };

  render_job_services = (job) => {
    let services_html = [];
    if (
      job.order_job_services !== undefined &&
      job.order_job_services.length > 0
    ) {
      job.order_job_services.forEach((service, index) => {
        services_html.push(
          <>
            <Row>
              <Colxx md="2">{index + 1}</Colxx>
              <Colxx md="10">
                {service.service_title}
                {" ("}
                {service.unit_count}
                {")"}
              </Colxx>
            </Row>
          </>
        );
      });
    }
    return services_html;
  };

  render_rated_jobs = (order_jobs) => {
    let setting_html = [];
    let self = this;
    order_jobs.forEach((order_job) => {
      setting_html.push(
        <>
          <tr>
            <td>
              <Link to={`/app/orders/show/${order_job.order_id}`}>
                {order_job.job_code}
              </Link>
            </td>
            <td>
              <strong>
                {order_job.client.first_name} {order_job.client.last_name}
              </strong>
              <br />
              <Badge color="warning">{order_job.client.membership_code}</Badge>
            </td>
            <td>
              {order_job.order_date} {order_job.order_time}
            </td>
            <td>
              <strong>
                {order_job.technician.first_name}{" "}
                {order_job.technician.last_name}
              </strong>
              <br />
              <Badge color="warning">
                {order_job.technician.membership_code}
              </Badge>
            </td>
            <td>
              <Popover
                placement="bottom"
                title="Services:"
                width="500"
                trigger="click"
                content={self.render_job_services(order_job)}
              >
                <u>
                  <a style={{ color: "blue" }}>Services</a>
                </u>
                {/* <Button className="btn-sm">Read Comments</Button> */}
              </Popover>
            </td>
            <td>
              {/* <BeautyStars
                // count={5}
                // onChange={ratingChanged}
                value={order_job.job_rating}
                size={14}
                activeColor="#ffd700"
                edit={false}
                gap="5px"
              /> */}
              {order_job.job_rating}
            </td>
            <td>
              {order_job.comments !== null && order_job.comments.length ? (
                <>
                  <Popover
                    placement="bottom"
                    title="Comment:"
                    width="500"
                    trigger="click"
                    content={self.set_comment(order_job)}
                  >
                    <u>
                      <a style={{ color: "blue" }}>Comment</a>
                    </u>
                    {/* <Button className="btn-sm">Read Comments</Button> */}
                  </Popover>
                </>
              ) : (
                <></>
              )}
            </td>
            <td>{order_job.city_name}</td>
            <td>{order_job.rated_at}</td>
            <td>
              {order_job.is_feedback_given_by_csr === true ? (
                <>CSR</>
              ) : (
                <>Client</>
              )}
            </td>
            <td>
              {order_job.is_seen ? (
                <>
                  {/* <Button
                    size="sm"
                    disabled
                    color="success"
                    className="btn-success mr-2">
                    {" "}
                    Seen{" "}
                  </Button> */}
                  <label className="cont">
                    <input
                      type="checkbox"
                      checked="checked"
                      disabled="disabled"
                    />
                    <span className="checkmark"></span>
                  </label>
                </>
              ) : (
                <>
                  {/* <Button
                    size="sm"
                    onClick={(event) => self.rating_seen(event, order_job.id)}
                    className="btn-danger mr-2">
                    {" "}
                    Not Seen{" "}
                  </Button> */}
                  <label className="cont">
                    <input
                      type="checkbox"
                      onClick={(event) => self.rating_seen(event, order_job.id)}
                    />
                    <span className="checkmark"></span>
                  </label>
                </>
              )}
            </td>
            <td>
              {order_job.job_rating <= 3 ? (
                <>
                  <Button
                    size="sm"
                    onClick={(event) =>
                      self.toggleModalComplaint(event, order_job)
                    }
                  >
                    Complaint
                  </Button>
                </>
              ) : (
                <></>
              )}
            </td>
          </tr>
        </>
      );
    });
    return setting_html;
  };

  render_unrated_orders = (selectedItems) => {
    let setting_html = [];
    let self = this;
    selectedItems.forEach(function (single_order) {
      setting_html.push(
        <>
          <tr>
            <td>
              <Link to={`/app/orders/show/${single_order.id}`}>
                {single_order.id}
              </Link>
            </td>
            <td>
              <strong>
                {single_order.client.first_name} {single_order.client.last_name}
              </strong>
              <br />
              <Badge color="warning">
                {single_order.client.membership_code}
              </Badge>
            </td>
            <td>
              {single_order.order_date}
              {" , "}
              {single_order.order_time}
            </td>
            <td>{single_order.address.city.city_name}</td>
            <td>{single_order.client.phone}</td>
            <td>{single_order.follow_ups.length}</td>
            {/* <td>{order_job.comments}</td> */}
            {/* <td>{order_job.rated_at}</td> */}
            <td>
              <Button
                size="sm"
                color="success"
                onClick={(event) => self.toggleModal(event, single_order)}
                className="btn-success mr-2"
              >
                {" "}
                Edit{" "}
              </Button>
            </td>
          </tr>
        </>
      );
    });
    return setting_html;
  };

  settings_heading = () => {
    let heading = <></>;
    heading = (
      <>
        <Row>
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>Ratings</h1>
              {/* <Link to="create_setting">
                <Button
                  color="primary"
                  size="lg"
                  className="top-right-button"
                  style={{ float: "right" }}>
                  New Setting
                </Button>
              </Link> */}
            </div>
          </Colxx>
        </Row>
        <Separator className="mb-2" />
      </>
    );
    return heading;
  };

  set_selected_technician = (technician) => {
    sessionStorage.setItem("technician_ids", JSON.stringify(technician));
    this.setState({
      select_technician_ids: technician,
    });
  };

  set_selected_city = (city) => {
    sessionStorage.setItem("rating_city_ids", JSON.stringify(city));
    this.setState({
      select_city_ids: city,
    });
  };

  set_selected_rating = (rating) => {
    sessionStorage.setItem("rating_ids", JSON.stringify(rating));
    this.setState({
      select_rating_ids: rating,
    });
  };

  set_search_type = (type) => {
    sessionStorage.setItem("search_type", JSON.stringify(type));
    this.setState({
      search_type: type,
    });
  };

  render() {
    const {
      order_jobs,
      activePage,
      order_jobs_count,
      value2,
      ratings,
      technicians_dropdown,
      unrated_orders_count,
      unrated_orders,
      activeTab,
      select_technician_ids,
      select_rating_ids,
      cities_dropdown,
      select_city_ids,
      search_type,
    } = this.state;
    // if (Object.keys(order_jobs).length === 0) {
    //   return <>{/* <div className="loading" /> */}</>;
    // } else {

    return (
      <div>
        {/* {loader ? (
          <>
            <div className="loading" />
          </>
        ) : (
          <></>
        )} */}
        {this.settings_heading()}
        {activeTab === "Rated Jobs" ? (
          <>
            <Row>
              <Colxx xxs="12">
                {/* <form onSubmit={this.filterOrders} id="order-filter"> */}
                <form onSubmit={this.handleSubmit} id="order-filter">
                  <Row>
                    {/* <Colxx xxs="1">
                      <Label className="mt-2">
                        <strong>Filters</strong>
                      </Label>
                    </Colxx> */}
                    <Colxx xxs="2">
                      <Select
                        components={{ Input: CustomSelectInput }}
                        className="react-select"
                        classNamePrefix="react-select"
                        name="search_type"
                        defaultValue={search_type}
                        onChange={this.set_search_type}
                        options={[
                          { label: "Feedback Date", value: "rated_at" },
                          { label: "Order Date", value: "order_date" },
                        ]}
                      />
                    </Colxx>
                    <Colxx xxs="3">
                      <div className="source">
                        <div className="block">
                          <DateRangePicker
                            value={value2}
                            placeholder="Pick a range"
                            align="right"
                            name="from_date"
                            ref={(e) => (this.daterangepicker2 = e)}
                            onChange={(date) => {
                              console.debug("DateRangePicker2 changed: ", date);
                              this.setState({ value2: date });
                            }}
                            shortcuts={[
                              {
                                text: "Last week",
                                onClick: () => {
                                  const end = new Date();
                                  const start = new Date();
                                  start.setTime(
                                    start.getTime() - 3600 * 1000 * 24 * 7
                                  );

                                  this.setState({ value2: [start, end] });
                                  this.daterangepicker2.togglePickerVisible();
                                },
                              },
                              {
                                text: "Last month",
                                onClick: () => {
                                  const end = new Date();
                                  const start = new Date();
                                  start.setTime(
                                    start.getTime() - 3600 * 1000 * 24 * 30
                                  );

                                  this.setState({ value2: [start, end] });
                                  this.daterangepicker2.togglePickerVisible();
                                },
                              },
                              {
                                text: "Last 3 months",
                                onClick: () => {
                                  const end = new Date();
                                  const start = new Date();
                                  start.setTime(
                                    start.getTime() - 3600 * 1000 * 24 * 90
                                  );
                                  this.setState({ value2: [start, end] });
                                  this.daterangepicker2.togglePickerVisible();
                                },
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </Colxx>
                    <Colxx xxs="2">
                      <Select
                        components={{ Input: CustomSelectInput }}
                        isMulti
                        className="react-select"
                        classNamePrefix="react-select"
                        placeholder="Technician"
                        name="technician_ids"
                        value={select_technician_ids}
                        onChange={this.set_selected_technician}
                        options={technicians_dropdown}
                      />
                    </Colxx>
                    <Colxx xxs="2">
                      <Select
                        components={{ Input: CustomSelectInput }}
                        isMulti
                        className="react-select"
                        classNamePrefix="react-select"
                        placeholder="City"
                        name="city_ids"
                        value={select_city_ids}
                        onChange={this.set_selected_city}
                        options={cities_dropdown}
                      />
                    </Colxx>
                    <Colxx xxs="2">
                      <Select
                        components={{ Input: CustomSelectInput }}
                        isMulti
                        className="react-select"
                        classNamePrefix="react-select"
                        placeholder="Rating"
                        name="ratings"
                        value={select_rating_ids}
                        onChange={this.set_selected_rating}
                        options={ratings}
                      />
                    </Colxx>
                    <Colxx xxs="2" className="mt-2">
                      <Input
                        className="form-control"
                        name="order_id"
                        placeholder="Order No."
                      />
                    </Colxx>
                    {/* {this.render_status_filter()} */}
                    <Colxx xxs="1" className="mt-2">
                      <Button color="primary" size="sm" type="submit">
                        Submit
                      </Button>
                    </Colxx>
                    <Colxx xxs="1" className="mt-2">
                      <Button
                        size="sm"
                        color="danger"
                        onClick={(event) => {
                          this.clear_form(event);
                        }}
                      >
                        Clear
                      </Button>
                    </Colxx>
                    <Colxx md="8" className="text-right">
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => this.csv_export_data()}
                      >
                        Export CSV
                      </Button>
                    </Colxx>
                  </Row>
                </form>
              </Colxx>
            </Row>
          </>
        ) : (
          <>
            <Row>
              <Colxx xxs="12">
                {/* <form onSubmit={this.filterOrders} id="order-filter"> */}
                <form onSubmit={this.handleSubmit} id="order-filter">
                  <Row>
                    <Colxx xxs="1">
                      <Label className="mt-2">
                        <strong>Filters</strong>
                      </Label>
                    </Colxx>
                    <Colxx xxs="3">
                      <div className="source">
                        <div className="block">
                          <DateRangePicker
                            value={value2}
                            placeholder="Pick a range"
                            align="right"
                            name="from_date"
                            ref={(e) => (this.daterangepicker2 = e)}
                            onChange={(date) => {
                              console.debug("DateRangePicker2 changed: ", date);
                              this.setState({ value2: date });
                            }}
                            shortcuts={[
                              {
                                text: "Last week",
                                onClick: () => {
                                  const end = new Date();
                                  const start = new Date();
                                  start.setTime(
                                    start.getTime() - 3600 * 1000 * 24 * 7
                                  );

                                  this.setState({ value2: [start, end] });
                                  this.daterangepicker2.togglePickerVisible();
                                },
                              },
                              {
                                text: "Last month",
                                onClick: () => {
                                  const end = new Date();
                                  const start = new Date();
                                  start.setTime(
                                    start.getTime() - 3600 * 1000 * 24 * 30
                                  );

                                  this.setState({ value2: [start, end] });
                                  this.daterangepicker2.togglePickerVisible();
                                },
                              },
                              {
                                text: "Last 3 months",
                                onClick: () => {
                                  const end = new Date();
                                  const start = new Date();
                                  start.setTime(
                                    start.getTime() - 3600 * 1000 * 24 * 90
                                  );
                                  this.setState({ value2: [start, end] });
                                  this.daterangepicker2.togglePickerVisible();
                                },
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </Colxx>
                    <Colxx xxs="2">
                      <Select
                        components={{ Input: CustomSelectInput }}
                        isMulti
                        className="react-select"
                        classNamePrefix="react-select"
                        placeholder="City"
                        name="city_ids"
                        value={select_city_ids}
                        onChange={this.set_selected_city}
                        options={cities_dropdown}
                      />
                    </Colxx>
                    <Colxx xxs="2">
                      <Input
                        className="form-control"
                        name="order_id"
                        placeholder="Order No."
                      />
                    </Colxx>
                    {/* {this.render_status_filter()} */}
                    <Colxx xxs="1">
                      <Button color="primary" size="sm" type="submit">
                        Submit
                      </Button>
                    </Colxx>
                    <Colxx xxs="1">
                      <Button
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
              </Colxx>
            </Row>
          </>
        )}
        <Colxx xxs="12">
          <Tabs
            activeName="Rated Jobs"
            onTabClick={(tab) => {
              this.get_order_by_status(tab, tab.props.name);
            }}
          >
            <Tabs.Pane
              label={"Rated Jobs(" + order_jobs_count + ")"}
              name="Rated Jobs"
            >
              <Card className="mb-4">
                <CardBody>
                  <Table>
                    <thead>
                      <tr>
                        <th> Job No. </th>
                        <th> Client Name </th>
                        <th> Order Date </th>
                        <th> Technician Name</th>
                        <th> Services </th>
                        <th> Rating </th>
                        <th> Comments </th>
                        <th> City </th>
                        <th> Feedback Date</th>
                        <th> Given By</th>
                        <th> Seen </th>
                      </tr>
                    </thead>
                    <tbody>{this.render_rated_jobs(order_jobs)}</tbody>
                  </Table>
                  {order_jobs.length > 0 ? (
                    <>
                      <Pagination
                        activePage={activePage}
                        itemsCountPerPage={20}
                        totalItemsCount={order_jobs_count}
                        delimeter={5}
                        onChange={this.handlePageChange}
                        styling="rounded_primary"
                      />
                    </>
                  ) : (
                    <></>
                  )}
                </CardBody>
              </Card>
            </Tabs.Pane>
            <Tabs.Pane
              label={"Unrated Orders(" + unrated_orders_count + ")"}
              name="Unrated Orders"
            >
              <Card className="mb-4">
                <CardBody>
                  <Table>
                    <thead>
                      <tr>
                        <th> Order No. </th>
                        <th> Client Name </th>
                        <th> Order Date </th>
                        <th> City </th>
                        <th> Phone </th>
                        <th> Follow Up </th>
                        <th> Action </th>
                      </tr>
                    </thead>
                    <tbody>{this.render_unrated_orders(unrated_orders)}</tbody>
                  </Table>
                  {unrated_orders.length > 0 ? (
                    <>
                      <Pagination
                        activePage={activePage}
                        itemsCountPerPage={20}
                        totalItemsCount={unrated_orders_count}
                        delimeter={5}
                        onChange={this.handlePageChange}
                        styling="rounded_primary"
                      />
                    </>
                  ) : (
                    <></>
                  )}
                </CardBody>
              </Card>
            </Tabs.Pane>
          </Tabs>
        </Colxx>
        {this.renderEditRatingModal()}
        {this.renderSubmitComplaintModal()}
      </div>
    );
  }
}
export default DataListPages;
