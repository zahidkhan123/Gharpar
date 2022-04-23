import React, { Component } from "react";
import _ from "lodash";
import update from "immutability-helper";
import {
  Row,
  Card,
  CardBody,
  Table,
  Button,
  Modal,
  Alert,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Badge,
  CustomInput,
  Collapse,
} from "reactstrap";
import { ContextMenuTrigger } from "react-contextmenu";
import { Colxx } from "../../../components/common/CustomBootstrap";
import Select from "react-select";
import axios from "axios";
import { Link } from "react-router-dom";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import moment from "moment";

import { Tabs, Popover } from "element-react";
import OrderCalculation from "./order_calculation";
import OrderHeader from "./order_header";
import "./start.css";
import { connect_socket } from "../../../helpers/Utils";
import { check_permission } from "../../../helpers/Utils";
import { trackPromise } from "react-promise-tracker";
import GiftBoxsmall from "../../../assets/images/gift_order_show.png";

export default class Start extends Component {
  constructor(props) {
    super(props);
    this.state = {
      order_data: [],
      order_jobs: [],
      order_billing: {},
      modal_edit_job: false,
      toggleLarge: false,
      toggle_new_job_modal: false,
      toggle_new_coupon_modal: false,
      toggle_comments_modal: false,
      toggle_add_penalty: false,
      toggle_add_discount: false,
      toggle_add_penalty_order: false,
      toggle_change_travel_charges: false,
      is_update_csr_comment: false,
      service_categories: [],
      service_category: {},
      sub_categories: [],
      data_found: "",
      technician_services: [],
      services: [],
      order_job_to_edit: {},
      job_service_id: "",
      order_job_to_penalty: {},
      all_technicians: [],
      technicians_dropdown: [],
      jobs_dropdown_data: [],
      toggle_addons_modal: false,
      technician_id_for_discount: 0,
      current_service: 0,
      discount_type_value: "",
      current_service_addons: [],
      discount_reasons: [],
      single_reason_html: [],
      single_reason: [],
      order_discounts: [],
      order_discounts_list: [],
      change_technician: [],
      activeTab: "Active Jobs",
      is_super_edit: false,
      order_discount_json: [],
      is_public_to_technician: false,
      discount_categories: [
        { label: "Professionalism", value: "Professionalism", key: 0 },
        { label: "Timeliness", value: "Timeliness", key: 1 },
        { label: "Hygiene", value: "Hygiene", key: 2 },
        { label: "Equipment Missing", value: "Equipment-Missing", key: 3 },
        { label: "Poor Service", value: "Poor-Service", key: 4 },
        { label: "Injury", value: "Injury", key: 5 },
        { label: "Quality Control", value: "Quality-Control", key: 6 },
      ],
      categories_values_json: [],
      new_job: {
        order_id: this.props.match.params.id,
        technician_id: "",
        order_job_services_attributes: [],
      },
      edit_job: {},
      is_client_verified: false,
      empty_suggestions: false,
      last_comment: "",
      show_job_edit_warning: false,
      toggle_job_status_change_modal: false,
      toggle_job_technician_change_modal: false,
      toggle_change_service_technician: false,
      job_alternative_technicians: [],
      order_lock_status: null,
      show_order_cancel_confirm_modal: false,
      cancel_reason: {},
      accordion: [false],
      inactive_jobs: [],
      search_services: [],
      all_comments: [],
    };
  }

  toggleAccordion = (tab) => {
    const prevState = this.state.accordion;
    const state = prevState.map((x, index) => (tab === index ? !x : false));
    this.setState({
      accordion: state,
    });
  };

  check_order_lock = () => {
    const { match } = this.props;

    axios({
      method: "get",
      url:
        servicePath +
        "/api/v2/orders/" +
        match.params.id +
        "/order_page_maintain.json",
      headers: {
        "Content-Type": "application/json",
        "AUTH-TOKEN": localStorage.getItem("auth_token"),
        "IS-ACCESSIBLE": true,
      },
    })
      .then((response) => {
        // Response
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  componentWillUnmount() {
    if (localStorage.getItem("user_default_role") === "CSR") {
      clearInterval(this.order_lock_status);
    }
  }

  async componentDidMount() {
    if (localStorage.getItem("user_default_role") === "CSR") {
      // Check locking every 30 seconds
      this.order_lock_status = setInterval(
        () => this.check_order_lock(),
        30000
      );
    }

    let order_tags = await this.get_all_order_tags();

    let order_data = await this.fetch_order();

    if (Object.keys(order_data).length) {
      let client = order_data.client;
      let client_verfied = false;
      let empty_suggestions = false;
      let order_jobs = [];
      let inactive_jobs = [];
      let order_discounts_list = [];
      let order_billing = order_data.order_billing;

      if (
        client.is_cnic_verified === false ||
        client.is_cnic_verified === "false" ||
        client.approved_status !== "Approved"
      ) {
        client_verfied = false;
      } else {
        client_verfied = true;
      }

      if (order_data.order_jobs.length || order_data.inactive_jobs.length) {
        order_jobs = order_data.order_jobs;
      } else {
        order_jobs = await this.fetch_order_jobs();
        if (order_jobs.length === 0) {
          // Suggestions not found
          empty_suggestions = true;
        }
      }
      if (order_data.inactive_jobs.length) {
        inactive_jobs = order_data.inactive_jobs;
      }

      if (
        order_data.order_discounts !== undefined &&
        order_data.order_discounts.length
      ) {
        order_discounts_list = order_data.order_discounts;
      }

      let jobs_dropdown_data = this.job_dropdown_data(order_jobs);
      connect_socket("OrderChannel", order_data.id);

      const cancel_reasons = await this.fetch_cancel_reasons();

      this.setState({
        is_client_verified: client_verfied,
        order_data: order_data,
        order_jobs: order_jobs,
        order_billing: order_billing,
        jobs_dropdown_data: jobs_dropdown_data,
        empty_suggestions: empty_suggestions,
        inactive_jobs: inactive_jobs,
        order_discounts_list: order_discounts_list,
        order_tags: order_tags,
        cancel_reasons: cancel_reasons,
        csr_comment: order_data.csr_comment,
        current_tag: {
          id: order_data.tag_id,
          tag_name: order_data.tag_name,
        },
      });
    }
  }

  handleCheckChange = (event) => {
    if (event.target.checked) {
      event.target.parentElement.nextElementSibling.value = "true";
    } else {
      event.target.parentElement.nextElementSibling.value = "false";
    }
  };

  get_all_order_tags = async () => {
    let all_tags = [];

    await axios({
      method: "get",
      url: servicePath + "/api/v2/tags.json",
      headers: {
        "Content-Type": "multipart/form-data",
        "AUTH-TOKEN": localStorage.getItem("auth_token"),
        "IS-ACCESSIBLE": true,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          all_tags = response.data.tags;
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

    return all_tags;
  };

  job_dropdown_data = (order_jobs) => {
    let job_dropdown_data = [];
    if (order_jobs.length) {
      order_jobs.forEach(function (currentValue) {
        job_dropdown_data.push({
          label: currentValue.job_code,
          value: currentValue.id,
          key: currentValue.id,
        });
      });
    }

    return job_dropdown_data;
  };

  get_job_technician = (job) => {
    const { order_jobs } = this.state;
    let self = this;
    order_jobs.forEach(function (currentValue) {
      if (job === currentValue.id) {
        self.setState({
          technician_id_for_discount: currentValue.technician.id,
        });
      }
    });
  };

  toggle_new_job_modal = async () => {
    let result = await check_permission("order_jobs/create", "");
    if (result) {
      let all_technicians = await this.get_all_technicians();
      let technicians_dropdown = this.technicians_dropdown(all_technicians);
      this.setState({
        all_technicians: all_technicians,
        technicians_dropdown: technicians_dropdown,
        toggle_new_job_modal: !this.state.toggle_new_job_modal,
        technician_services: [],
        search_services: [],
        new_job: {
          order_id: this.props.match.params.id,
          technician_id: "",
          order_job_services_attributes: [],
        },
      });
    }
  };

  toggle_new_coupon_modal = async () => {
    this.setState({
      toggle_new_coupon_modal: !this.state.toggle_new_coupon_modal,
    });
  };

  toggle_comments_modal = async () => {
    let all_comments = await this.get_all_comments();
    this.setState({
      toggle_comments_modal: !this.state.toggle_comments_modal,
      all_comments: all_comments,
    });
    var objDiv = document.getElementById("comment_body");
    objDiv.scrollTop = objDiv.scrollHeight;
  };

  close_comments_modal = () => {
    this.setState({
      toggle_comments_modal: !this.state.toggle_comments_modal,
    });
  };

  close_toggle_add_penalty_order = async (event) => {
    this.setState({
      discount_type_value: "",
      single_reason: [],
      toggle_add_penalty_order: !this.state.toggle_add_penalty_order,
    });
  };

  toggle_add_penalty_order = async (event) => {
    let result = await check_permission("order_discounts/create", "");
    if (result) {
      let order_discounts = await this.get_order_discounts();
      let order_discount_json = this.order_discount_json(order_discounts);
      this.setState({
        order_discounts: order_discounts,
        order_discount_json: order_discount_json,
        discount_type_value: "",
        toggle_add_penalty_order: !this.state.toggle_add_penalty_order,
      });
    }
  };

  toggle_tags_modal = async (event, order) => {
    // if (order.id !== undefined) {
    //   let tag_name = document
    //     .getElementById(`${order.id}`)
    //     .getAttribute("tag_name");
    //   let tag_id = parseInt(
    //     document.getElementById(`${order.id}`).getAttribute("tag_id")
    //   );
    //   if (this.state.toggle_tags_modal === false) {
    let result = await check_permission("tags/apply_tag", "");
    if (result) {
      this.setState({
        toggle_tags_modal: !this.state.toggle_tags_modal,
      });
    }
  };

  toggle_close_tag_modal = () => {
    this.setState({
      toggle_tags_modal: !this.state.toggle_tags_modal,
    });
  };

  toggle_change_travel_charges = async () => {
    let result = await check_permission("orders/change_travel_charges", "");
    if (result) {
      this.setState({
        toggle_change_travel_charges: !this.state.toggle_change_travel_charges,
      });
    }
  };

  get_all_comments = async () => {
    let all_comments = [];
    const { order_data } = this.state;

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath + "/api/v2/order_messages.json?order_id=" + order_data.id,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          all_comments = response.data.order_messages;
          // if (response.data.order_messages.length > 5) {
          //   var objDiv = document.getElementById("comment_body");
          //   objDiv.scrollTop = objDiv.scrollHeight;
          // }
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
    return all_comments;
  };

  handleTagChange = async (event, tag_name, tag_id) => {
    // let success = false;
    const { order_data } = this.state;
    let tempOrder = order_data;
    let order = {};
    await axios({
      method: "post",
      url: servicePath + "/api/v2/tags/apply_tag.json",
      data: {
        order_id: order_data.id,
        tag_id: tag_id,
      },
      headers: {
        // "Content-Type": "multipart/form-data",
        "AUTH-TOKEN": localStorage.getItem("auth_token"),
        "IS-ACCESSIBLE": true,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          order = tempOrder;
          order.tag_id = tag_id;
          order.tag_name = tag_name;
          this.setState({
            order_data: tempOrder,
            current_tag: {
              id: tag_id,
              tag_name: tag_name,
            },
          });
          NotificationManager.success(
            "Tag updated Successfully",
            "",
            5000,
            () => {},
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
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });
    // event.target.checked = success;
  };

  removeTag = async (event, order_id) => {
    const { order_data } = this.state;
    let result = await check_permission("tags/remove_tag", "");
    let tempOrder = order_data;
    let order = {};
    if (result) {
      await trackPromise(
        axios({
          method: "delete",
          url:
            servicePath + "/api/v2/tags/remove_tag.json?order_id=" + order_id,
          headers: {
            // "Content-Type": "multipart/form-data",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
            "IS-ACCESSIBLE": true,
          },
        })
      )
        .then((response) => {
          if (response.status === 200) {
            order = tempOrder;
            order.tag_id = "";
            order.tag_name = "";
            this.setState({
              order_data: tempOrder,
              current_tag: {
                id: "",
                tag_name: "",
              },
            });
            // document.getElementById(`${order_id}`).innerHTML = "";
            NotificationManager.success(
              "Tag removed Successfully",
              "",
              5000,
              () => {},
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
            () => {},
            null,
            "filled"
          );
          console.log("error", error);
        });
    }
  };

  get_order_discounts = async () => {
    let category_list = [];

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/order_discounts/reasons.json?category_title=Order",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          category_list = response.data;
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
    return category_list;
  };

  order_discount_json = (order_discounts) => {
    let dropdown_json = [];
    order_discounts.forEach((single_discount) => {
      dropdown_json.push({
        label: single_discount.title,
        value: single_discount.id,
        key: single_discount.id,
      });
    });
    return dropdown_json;
  };

  toggle_add_penalty = async (event, job_id) => {
    let order_job = await this.get_order_job(job_id);
    this.setState({
      order_job_to_penalty: order_job,
      discount_type_value: "",
      toggle_add_penalty: !this.state.toggle_add_penalty,
    });
  };

  close_toggle_add_penalty = async () => {
    this.setState({
      discount_type_value: "",
      single_reason: [],
      toggle_add_penalty: !this.state.toggle_add_penalty,
    });
  };

  toggle_add_discount = async () => {
    this.setState({
      toggle_add_discount: !this.state.toggle_add_discount,
    });
  };

  toggle_change_service_technician = () => {
    this.setState({
      toggle_change_service_technician:
        !this.state.toggle_change_service_technician,
    });
  };

  close_toggle_add_discount = async () => {
    this.setState({
      toggle_add_discount: !this.state.toggle_add_discount,
    });
  };

  toggle_addons_modal = () => {
    this.setState({
      toggle_addons_modal: !this.state.toggle_addons_modal,
    });
  };

  toggleEditJobModal = async (event, job_id) => {
    let { modal_edit_job } = this.state;
    let result = await check_permission("order_jobs/update", "");
    if (result) {
      if (modal_edit_job === true) {
        // It means modal is already open. Close it and reset order_job_to_edit state
        this.setState({
          order_job_to_edit: {},
          modal_edit_job: !this.state.modal_edit_job,
        });
      } else {
        // Modal is closed at the moment. We are here to open it.
        let order_job = await this.get_order_job(job_id);
        order_job.order_job_services_attributes = order_job.order_job_services;

        if (
          order_job.order_job_services_attributes !== undefined &&
          order_job.order_job_services_attributes.length
        ) {
          order_job.order_job_services_attributes.forEach(
            (single_order_job_service, index) => {
              order_job.order_job_services_attributes[
                index
              ].order_job_service_addons_attributes =
                order_job.order_job_services_attributes[
                  index
                ].order_job_service_addons;
            }
          );
        }

        let technician_services = await this.get_technician_services(
          order_job.technician_id,
          "toggleLarge",
          job_id
        );
        // let service_categories = await this.get_all_service_categories();

        this.setState({
          order_job_to_edit: order_job,
          // service_categories: service_categories,
          technician_services: technician_services,
          modal_edit_job: !this.state.modal_edit_job,
          search_services: [],
        });
      }
    }
  };

  toggleLarge = async (event, job, tech_id) => {
    let technician_services = await this.get_technician_services(
      tech_id,
      "toggleLarge"
    );
    let service_categories = await this.get_all_service_categories();

    this.setState({
      service_categories: service_categories,
      technician_services: technician_services,
      toggleLarge: !this.state.toggleLarge,
    });
  };

  closetoggleLarge = () => {
    this.setState((prevState) => ({
      toggleLarge: !prevState.toggleLarge,
    }));
  };

  get_all_technicians = async () => {
    const { order_data } = this.state;
    let all_technicians = [];

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/orders/" +
          order_data.id +
          "/order_technicians.json?default_role=Technician&technician_status=Active",
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

  get_curr_job_possible_technicians = async (job_id) => {
    let technicians_list = [];

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/order_jobs/" +
          job_id +
          "/order_job_technicians.json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          technicians_list = response.data;
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

    return technicians_list;
  };

  technicians_dropdown = (all_technicians) => {
    let technicians_dropdown = [];

    all_technicians.forEach(function (currentValue) {
      let name_code =
        currentValue.first_name +
        " " +
        currentValue.last_name +
        " (" +
        currentValue.membership_code +
        ")";
      technicians_dropdown.push({
        label: name_code,
        value: currentValue.id,
        key: currentValue.id,
      });
    });

    return technicians_dropdown;
  };

  get_order_job = async (job_id) => {
    let order_job = [];

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/order_jobs/" + job_id + ".json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          order_job = response.data;
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

    return order_job;
  };

  get_technician_services = async (tech_id, calling_function, job_id) => {
    const { order_data } = this.state;
    let technician_services = [];
    let city_id = order_data.address.city_id;
    let gender = order_data.client.gender;

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/services/technician_services.json?technician_id=" +
          tech_id +
          "&city_id=" +
          city_id +
          "&gender=" +
          gender +
          "&get_addons=true&order_job_id=" +
          job_id,

        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          technician_services = response.data;
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

    if (calling_function === "new_job_modal_body") {
      this.setState({
        new_job: {
          order_id: this.props.match.params.id,
          technician_id: parseInt(tech_id),
          order_job_services_attributes: [],
        },
        technician_services: technician_services,
      });
    } else if (calling_function === "toggleLarge") {
      return technician_services;
    } else {
      return technician_services;
    }
  };

  get_all_service_categories = async () => {
    let service_categories = [];
    const { order_data } = this.state;
    let city_id = order_data.address.city_id;
    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/service_categories.json?city_id=" + city_id,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          service_categories = response.data;
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

    return service_categories;
  };

  fetch_order_jobs = async () => {
    let order_jobs = {};
    const { match } = this.props;

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/orders/" +
          match.params.id +
          "/suggestions.json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          order_jobs = response.data;
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

    return order_jobs;
  };

  create_penalty = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);
    let self = this;
    let success = false;

    if (
      event.target.elements["order_discount[reason_id]"] !== undefined &&
      event.target.elements["order_discount[reason_id]"].value === ""
    ) {
      // success remains false
      NotificationManager.error(
        "Please select reason",
        "",
        5000,
        () => {},
        null,
        "filled"
      );
      success = false;
    } else if (
      event.target.elements["order_discount[discount_value]"] !== undefined &&
      event.target.elements["order_discount[discount_value]"].value === "0"
    ) {
      // success remains false
      NotificationManager.error(
        "Please select discount percentage",
        "",
        5000,
        () => {},
        null,
        "filled"
      );
      success = false;
    } else {
      await trackPromise(
        axios({
          method: "post",
          url: servicePath + "/api/v2/order_discounts.json",
          headers: {
            "Content-Type": "application/json",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
          },
          data: formData,
        })
      )
        .then((response) => {
          if (response.status === 200) {
            if (response.data.order_job_id !== null) {
              self.setState({
                toggle_add_penalty: !this.state.toggle_add_penalty,
                single_reason: [],
              });
            } else {
              self.setState({
                toggle_add_penalty_order: !this.state.toggle_add_penalty_order,
                single_reason: [],
              });
            }
            self.setState({
              discount_type_value: "",
            });
            success = true;
            NotificationManager.success(
              "Successfully added",
              "",
              5000,
              () => {},
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
            () => {},
            null,
            "filled"
          );
          console.log("error", error);
        });
    }
    if (success === true) {
      let order_jobs = [];
      let order_billing = {};
      let order_data = await this.fetch_order();
      if (order_data.order_jobs.length) {
        order_jobs = order_data.order_jobs;
        order_billing = order_data.order_billing;
      } else {
        order_jobs = await this.fetch_order_jobs();
      }
      this.setState({
        order_data: order_data,
        order_billing: order_billing,
        order_jobs: order_jobs,
        inactive_jobs: order_data.inactive_jobs,
        order_discounts_list: order_data.order_discounts,
      });
    }
  };

  fetch_order = async () => {
    let order = {};
    let self = this;
    const { match } = this.props;

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/orders/" +
          match.params.id +
          ".json?default_role=admin",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          order = response.data;
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

        if (error.response.data.message === "Order is not accessible") {
          self.props.history.push("/app/orders/list");
        }
        console.log("error", error);
      });

    return order;
  };

  getFullName = () => {
    const { firstName, lastName } = this.state.order.client;
    return _.upperFirst(firstName) + " " + _.upperFirst(lastName);
  };

  handleAddMoreService = () => {
    console.log("Service Added");
  };

  handleJobServiceDelete = (job, service) => {
    this.setState((prevState) => {
      const idx = prevState.order_jobs[job].order_job_services.indexOf(service);
      return {
        order_jobs: update(prevState.order_jobs, {
          order_jobs: {
            [job]: {
              order_job_services: { $splice: [[idx, 1]] },
            },
          },
        }),
      };
    });
  };

  render_services_data = (job) => {
    const { technician_services } = this.state;

    if (Object.keys(technician_services).length === 0) {
      return <> </>;
    } else {
      return <>{this.render_services(technician_services, job)}</>;
    }
  };

  capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  create_comment = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);
    const { all_comments } = this.state;
    let self = this;
    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/order_messages.json",
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
            all_comments: [...all_comments, response.data],
            last_comment: "",
          });
          var objDiv = document.getElementById("comment_body");
          objDiv.scrollTop = objDiv.scrollHeight;
        }
      })
      .catch((error) => {
        // NotificationManager.error(
        //   error.response.data.message,
        //   "",
        //   5000,
        //   () => {},
        //   null,
        //   "filled"
        // );
      });
  };

  render_services = (technician_services, job) => {
    let services_html = (
      <>
        <Colxx xxs="12">
          <Card
            className="mt-4"
            style={{ overflowY: "scroll", height: "56vh" }}
          >
            <CardBody>
              <Table>
                <thead>
                  <tr>
                    <th> #</th>
                    <th> Title</th>
                    <th> Duration</th>
                    <th> Price</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {this.render_service_table_row(technician_services, job)}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Colxx>
      </>
    );
    return services_html;
  };

  get_service = async (service_id) => {
    let service = {};

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/services/" + service_id + ".json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          service = response.data;
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
    return service;
  };

  render_addon_table_row = (service_addons) => {
    let services_addons_rows = [];
    let self = this;
    let addon_length = 0;
    if (service_addons !== undefined && service_addons.length) {
      service_addons.forEach(function (single_addon, index) {
        addon_length = self.fetch_service_addon_count_in_new_job(
          single_addon.service_addon_id,
          single_addon.service_id
        );
        services_addons_rows.push(
          <>
            <tr
              style={
                addon_length > 0
                  ? { backgroundColor: "#ece176" }
                  : { backgroundColor: "transparent" }
              }
            >
              <td>{index + 1}</td>
              <td> {single_addon.addon_title} </td>
              <td> {self.time_convert(single_addon.addon_duration)} </td>
              <td> {single_addon.service_addon_price}</td>
              <td className="text-right">
                <span
                  style={{
                    fontSize: "14px",
                    display: "inline-block",
                    cursor: "pointer",
                  }}
                >
                  <i
                    className="simple-icon-minus"
                    style={{ cursor: "pointer" }}
                    onClick={(event) => self.add_remove_addon_to_job(event)}
                    data-action="remove"
                    data-addon-id={single_addon.service_addon_id}
                    data-service-id={single_addon.service_id}
                  />
                </span>

                <span style={{ fontSize: "18px", margin: "0 5px" }}>
                  {" "}
                  {self.fetch_service_addon_count_in_new_job(
                    single_addon.service_addon_id,
                    single_addon.service_id
                  )}{" "}
                </span>

                <span
                  style={{
                    fontSize: "14px",
                    display: "inline-block",
                  }}
                >
                  <i
                    className="simple-icon-plus"
                    style={{ cursor: "pointer" }}
                    onClick={(event) => self.add_remove_addon_to_job(event)}
                    data-action="add"
                    data-addon-id={single_addon.service_addon_id}
                    data-service-id={single_addon.service_id}
                  />
                </span>
              </td>
            </tr>
          </>
        );
      });
    }

    return services_addons_rows;
  };

  time_convert = (time_in_minutes) => {
    let hours = Math.floor(time_in_minutes / 60);
    let minutes = time_in_minutes % 60;
    let return_time = "";

    if (hours === 0) {
      if (minutes > 0) return_time = minutes + " Minutes";
    } else if (hours > 1) {
      hours = hours + " hrs";
      if (minutes === 0) return_time = hours;
      else if (minutes > 0) return_time = hours + " " + minutes + " Minutes";
    } else if (hours === 1) {
      hours = hours + " hr";
      if (minutes === 0) return_time = hours;
      else if (minutes > 0) return_time = hours + " " + minutes + " Minutes";
    }

    return return_time;
  };

  fetch_service_addon_count_in_new_job = (addon_id, service_id) => {
    const { new_job, order_job_to_edit } = this.state;

    let concerned_job = {};
    let is_new_job = false;

    if (Object.keys(order_job_to_edit).length) {
      concerned_job = order_job_to_edit;
      is_new_job = false;
    } else if (Object.keys(new_job).length) {
      concerned_job = new_job;
      is_new_job = true;
    }

    let addon_count = 0;
    if (
      concerned_job.order_job_services_attributes !== undefined &&
      concerned_job.order_job_services_attributes.length
    ) {
      concerned_job.order_job_services_attributes.forEach(
        (single_job_service) => {
          if (single_job_service.service_id === service_id) {
            if (is_new_job === true) {
              // Service present in new order job
              single_job_service.order_job_service_addons_attributes.filter(
                (single_addon) => {
                  if (single_addon.service_id === addon_id) {
                    addon_count = single_addon.unit_count;
                  }
                  return single_addon;
                }
              );
              return false;
            } else if (is_new_job === false) {
              // Service present in edit job order
              single_job_service.order_job_service_addons_attributes.filter(
                (single_addon) => {
                  if (single_addon.service_addon_id === undefined) {
                    if (single_addon.service_id === addon_id) {
                      addon_count = single_addon.unit_count;
                    }
                  } else {
                    if (single_addon.service_addon_id === addon_id) {
                      addon_count = single_addon.unit_count;
                    }
                  }
                  return single_addon;
                }
              );
              return false;
            }
          }
        }
      );
    }

    return addon_count;
  };

  get_all_categories = async (category) => {
    let all_categories = await this.get_category_values(category);
    let categories_values_json = this.categories_values_json(all_categories);

    this.setState({
      discount_reasons: all_categories,
      categories_values_json: categories_values_json,
    });
  };

  categories_values_json = (all_categories) => {
    let all_categories_json = [];
    all_categories.forEach((category) => {
      all_categories_json.push({
        label: category.title,
        value: category.id,
        key: category.id,
      });
    });
    return all_categories_json;
  };

  get_category_values = async (category) => {
    let category_list = [];

    await trackPromise(
      axios({
        method: "get",
        url:
          servicePath +
          "/api/v2/order_discounts/reasons.json?category_title=" +
          category,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          category_list = response.data;
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
    return category_list;
  };

  change_technician_for_service = async (event) => {
    event.preventDefault();
    const { job_service_id } = this.state;
    let technician_id = event.target.elements["technician_id"].value;

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/order_jobs/switch_job_service.json",
        data: {
          order_job_service_id: job_service_id,
          technician_id: technician_id,
        },
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          window.location.reload();
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
  };

  add_remove_addon_to_job = (event) => {
    let service_id = parseInt(event.target.dataset.serviceId);
    let addon_id = parseInt(event.target.dataset.addonId);
    let { new_job, order_job_to_edit } = this.state;
    let service_obj = {};
    let concerned_job = {};
    let is_new_job = false;

    if (Object.keys(order_job_to_edit).length) {
      concerned_job = order_job_to_edit;
      is_new_job = false;
    } else if (Object.keys(new_job).length) {
      concerned_job = new_job;
      is_new_job = true;
    }

    if (event.target.dataset.action === "remove") {
      // first find service from state
      concerned_job.order_job_services_attributes.forEach((single_obj) => {
        if (single_obj.service_id === service_id) {
          service_obj = single_obj;
          return false;
        }
      });
      if (Object.keys(service_obj).length) {
        // Service is present in state. So, find it's addon now

        concerned_job.order_job_services_attributes.forEach(
          (single_job_service, index) => {
            if (single_job_service.service_id === service_id) {
              let addon_obj = {};
              single_job_service.order_job_service_addons_attributes.forEach(
                (single_obj) => {
                  if (is_new_job === true) {
                    if (single_obj.service_id === addon_id) {
                      addon_obj = single_obj;
                    }
                  } else if (is_new_job === false) {
                    if (single_obj.service_id === addon_id) {
                      addon_obj = single_obj;
                    }
                  }
                }
              );

              if (Object.keys(addon_obj).length) {
                // Addon is found in service
                if (addon_obj.unit_count === 1) {
                  if (is_new_job === true) {
                    // Decrease count to 0 and remove addon

                    // Commenting below code because I believe it is redundant.
                    // Will remove it on 20/May/2020

                    // concerned_job.order_job_services_attributes[index].order_job_service_addons_attributes.filter( (single_job_service_addon, innerIndex) => {
                    //   if (single_job_service_addon.service_id === addon_id) {
                    //     concerned_job.order_job_services_attributes[index].order_job_service_addons_attributes[innerIndex].unit_count = 0;
                    //   }
                    // });

                    single_job_service.order_job_service_addons_attributes.filter(
                      (single_obj) => single_obj.service_id !== addon_id
                    );
                  } else if (is_new_job === false) {
                    concerned_job.order_job_services_attributes[
                      index
                    ].order_job_service_addons_attributes.filter(
                      (single_job_service_addon, innerIndex) => {
                        if (single_job_service_addon.service_id === undefined) {
                          // New Addon in old Service. remove it completey, since, count is going to be 0
                          concerned_job.order_job_services_attributes[
                            index
                          ].order_job_service_addons_attributes.splice(
                            innerIndex,
                            1
                          );
                        } else {
                          if (
                            single_job_service_addon.service_id === addon_id
                          ) {
                            // Old Addon in old Service. Set count to 0. It's removal will be done by API
                            concerned_job.order_job_services_attributes[
                              index
                            ].order_job_service_addons_attributes[
                              innerIndex
                            ].unit_count = 0;
                          }
                        }
                        return single_job_service_addon;
                      }
                    );
                  }
                } else if (addon_obj.unit_count > 1) {
                  // Addon is present in cart for this service. Hence, decrease count

                  // Work pending for new addon in old service. In that case, we will remove instead of setting count to 0

                  concerned_job.order_job_services_attributes[
                    index
                  ].order_job_service_addons_attributes.filter(
                    (single_job_service_addon, innerIndex) => {
                      if (single_job_service_addon.service_id === addon_id) {
                        concerned_job.order_job_services_attributes[
                          index
                        ].order_job_service_addons_attributes[
                          innerIndex
                        ].unit_count -= 1;
                      }
                      return single_job_service_addon;
                    }
                  );
                }
              }
            }
          }
        );
      }
    } else if (event.target.dataset.action === "add") {
      // first find service from state

      concerned_job.order_job_services_attributes.forEach((single_obj) => {
        if (single_obj.service_id === service_id) {
          service_obj = single_obj;
        }
      });

      if (Object.keys(service_obj).length) {
        // Service is present in state. So, find it's addon now

        concerned_job.order_job_services_attributes.forEach(
          (single_job_service, index) => {
            if (single_job_service.service_id === service_id) {
              // if (is_new_job === false) {
              //   // Adding a copy of key value pair because name was different in edit order case
              //   single_job_service.order_job_service_addons_attributes = single_job_service.order_job_service_addons

              //   // After that, performing normal operations for order edit job
              // }

              let addon_obj = {};
              single_job_service.order_job_service_addons_attributes.forEach(
                (single_obj) => {
                  if (is_new_job === true) {
                    if (single_obj.service_id === addon_id) {
                      addon_obj = single_obj;
                    }
                  } else if (is_new_job === false) {
                    if (single_obj.service_id === addon_id) {
                      addon_obj = single_obj;
                    }
                  }
                }
              );

              if (Object.keys(addon_obj).length) {
                // Addon is present in cart for this service. Hence, increase count
                concerned_job.order_job_services_attributes[
                  index
                ].order_job_service_addons_attributes.forEach(
                  (single_job_service_addon, innerIndex) => {
                    if (is_new_job === true) {
                      if (single_job_service_addon.service_id === addon_id) {
                        concerned_job.order_job_services_attributes[
                          index
                        ].order_job_service_addons_attributes[
                          innerIndex
                        ].unit_count += 1;
                      }
                    } else if (is_new_job === false) {
                      if (
                        single_job_service_addon.service_addon_id === undefined
                      ) {
                        if (single_job_service_addon.service_id === addon_id) {
                          concerned_job.order_job_services_attributes[
                            index
                          ].order_job_service_addons_attributes[
                            innerIndex
                          ].unit_count += 1;
                        }
                      } else {
                        if (
                          single_job_service_addon.service_addon_id === addon_id
                        ) {
                          concerned_job.order_job_services_attributes[
                            index
                          ].order_job_service_addons_attributes[
                            innerIndex
                          ].unit_count += 1;
                        }
                      }
                    }
                  }
                );
              } else {
                // Addon is not present in cart for that service. Hence, add it first time
                concerned_job.order_job_services_attributes[
                  index
                ].order_job_service_addons_attributes.push({
                  service_id: addon_id,
                  unit_count: 1,
                });
              }
            }
          }
        );
      } else {
        // This service is not added in cart, hence, cannot add it's addon
      }
    }

    if (is_new_job === true) {
      // Working on new job
      this.setState({
        new_job: concerned_job,
      });
    } else {
      // Working on editing job
      this.setState({
        order_job_to_edit: concerned_job,
      });
    }
  };

  render_addons_list = (service_addons) => {
    let addons_table_html = [];

    addons_table_html.push(
      <>
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Duration</th>
              <th> Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>{this.render_addon_table_row(service_addons)}</tbody>
        </Table>
      </>
    );
    return addons_table_html;
  };

  render_change_service_technician = (job_id, service_id) => {
    const { change_technician } = this.state;
    let addons_modal_html = (
      <>
        <Modal
          size="lg"
          isOpen={this.state.toggle_change_service_technician}
          toggle={this.toggle_change_service_technician}
        >
          <form onSubmit={this.change_technician_for_service}>
            <ModalHeader toggle={this.toggle_change_service_technician}>
              Change Service Technician
            </ModalHeader>
            <ModalBody>
              <input type="hidden" name="order_job_id" value={job_id} />
              <input
                type="hidden"
                name="order_job_service_id"
                value={service_id}
              />
              <Colxx xxs="12">
                <Select
                  className="react-select"
                  classNamePrefix="react-select"
                  name="technician_id"
                  placeholder="Select Technician"
                  options={change_technician}
                />
              </Colxx>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit">
                Submit
              </Button>
              <Button
                color="secondary"
                onClick={this.toggle_change_service_technician}
              >
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </>
    );

    return addons_modal_html;
  };

  render_addons_modal = () => {
    const { current_service_addons } = this.state;
    let addons_modal_html = (
      <>
        <Modal
          size="lg"
          isOpen={this.state.toggle_addons_modal}
          toggle={this.toggle_addons_modal}
        >
          <ModalHeader toggle={this.toggle_addons_modal}>Add Ons</ModalHeader>
          <ModalBody>
            {current_service_addons !== undefined &&
            current_service_addons.length === 0
              ? ""
              : this.render_addons_list(current_service_addons)}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.toggle_addons_modal}>
              Submit
            </Button>
            <Button color="secondary" onClick={this.toggle_addons_modal}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );

    return addons_modal_html;
  };

  render_addons = async (event, service_id) => {
    let service = await this.get_service(service_id);

    this.setState({
      current_service: service,
      current_service_addons: service.service_addons,
      toggle_addons_modal: !this.state.toggle_addons_modal,
    });
  };

  render_service_table_row = (technician_services, job) => {
    let options;
    if (this.state.search_services.length) {
      const searchPattern = new RegExp(
        this.state.search_services.map((term) => `(?=.*${term})`).join(""),
        "i"
      );
      options = technician_services.technician.services.filter((option) =>
        option.service_title.match(searchPattern)
      );
    } else {
      options = technician_services.technician.services;
    }

    let services_rows = [];
    let self = this;
    let new_job = 0;
    let existing_job = 0;
    options.forEach(function (single_service, index) {
      if (job === undefined) {
        new_job = self.fetch_service_count_in_new_job(single_service);
      } else {
        existing_job = self.fetch_service_count_in_edit_job(single_service);
      }
      services_rows.push(
        <>
          <tr
            key={single_service.service_title + index}
            style={
              existing_job || new_job > 0
                ? { backgroundColor: "#ece176" }
                : { backgroundColor: "transparent" }
            }
          >
            <td>{index + 1}</td>
            <td style={{ width: "50%" }}>
              {single_service.is_deal === true ? (
                <>
                  <span>{single_service.service_title}</span>
                  <Badge color="success">Deal</Badge>
                </>
              ) : (
                <>
                  <span>{single_service.service_title}</span>
                </>
              )}

              {single_service.has_addons === true ? (
                <span
                  className="ads-on"
                  onClick={(event) =>
                    self.render_addons(event, single_service.id)
                  }
                  style={{
                    fontSize: "12px",
                    color: "#2fb5f6",
                    paddingLeft: "20px",
                    cursor: "pointer",
                  }}
                >
                  Add-ons
                </span>
              ) : (
                ""
              )}
            </td>

            <td>{self.time_convert(single_service.service_duration)}</td>

            <td>
              {single_service.is_deal === true ? (
                <>
                  <strike>{parseInt(single_service.price)}</strike>{" "}
                  {single_service.discount_price}
                </>
              ) : (
                <>{parseInt(single_service.price)}</>
              )}
            </td>

            <td className="text-right">
              <span
                style={{
                  fontSize: "14px",
                  display: "inline-block",
                }}
              >
                <i
                  className="simple-icon-minus"
                  style={{ cursor: "pointer" }}
                  onClick={(event) => self.add_remove_service_to_job(event)}
                  data-action="remove"
                  data-service-id={single_service.id}
                />
              </span>
              {
                // If job === undefined, we are delaing with new job, else we are editing an old job
                job === undefined ? (
                  <>
                    <span
                      style={{
                        fontSize: "18px",
                        margin: "0 5px",
                      }}
                    >
                      {" "}
                      {self.fetch_service_count_in_new_job(single_service)}{" "}
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      style={{
                        fontSize: "18px",
                        margin: "0 5px",
                      }}
                    >
                      {" "}
                      {self.fetch_service_count_in_edit_job(
                        single_service
                      )}{" "}
                    </span>
                  </>
                )
              }
              <span
                style={{
                  fontSize: "14px",
                  display: "inline-block",
                }}
              >
                <i
                  className="simple-icon-plus"
                  style={{ cursor: "pointer" }}
                  onClick={(event) => self.add_remove_service_to_job(event)}
                  data-action="add"
                  data-service-id={single_service.id}
                />
              </span>
            </td>
          </tr>
        </>
      );
    });

    return services_rows;
  };

  fetch_service_count_in_edit_job = (curr_serv) => {
    const { order_job_to_edit } = this.state;
    let unit_count = 0;

    order_job_to_edit.order_job_services.forEach((single_order_job_service) => {
      if (single_order_job_service.service_id === curr_serv.id) {
        unit_count = single_order_job_service.unit_count;
        return false;
      }
    });

    return unit_count;
  };

  fetch_service_count_in_new_job = (service) => {
    const { new_job } = this.state;
    let service_count = 0;

    new_job.order_job_services_attributes.forEach((single_job_service) => {
      if (single_job_service.service_id === service.id) {
        // Service present in new order jobs
        service_count = single_job_service.unit_count;
        return false;
      }
    });

    return service_count;
  };

  add_remove_service_to_job = (event) => {
    let service_id = parseInt(event.target.dataset.serviceId);
    let { new_job, order_job_to_edit } = this.state;
    let concerned_job = {};
    let is_new_job = false;

    if (Object.keys(order_job_to_edit).length) {
      concerned_job = order_job_to_edit;
      is_new_job = false;
    } else if (Object.keys(new_job).length) {
      concerned_job = new_job;
      is_new_job = true;
    }

    let service_obj = {};

    if (event.target.dataset.action === "remove") {
      // first find service from state
      concerned_job.order_job_services_attributes.forEach((single_obj) => {
        if (single_obj.service_id === service_id) {
          service_obj = single_obj;
          return false;
        }
      });

      // If service found, do following, else nothing
      if (Object.keys(service_obj).length) {
        // Service is present in state. So, decrease by 1

        // Check if service unit_count is 1, If yes, remove service completely and decrease count to 0, else decrease by 1
        if (service_obj.unit_count === 1) {
          // Decrease count to 0 and remove service
          concerned_job.order_job_services_attributes.filter(
            (single_job_service, index) => {
              if (single_job_service.service_id === service_id) {
                if (is_new_job === true) {
                  // It's a new job, so remove service completely from the object
                  concerned_job.order_job_services_attributes.splice(index, 1);
                } else if (is_new_job === false) {
                  // We are editing job, so decrease count to 0 and send to api

                  // Before decreasing count to 0, check if this is new service in old job
                  // If yes, then, remove it from job, otherwise, set count to 0

                  if (single_job_service.id === undefined) {
                    // New Service in old job
                    concerned_job.order_job_services_attributes.splice(
                      index,
                      1
                    );
                  } else {
                    // Old Service in old job
                    single_job_service.unit_count = 0;
                  }
                }
              }
              return single_job_service;
            }
          );
        } else if (service_obj.unit_count > 1) {
          // decrease unit_count by 1
          concerned_job.order_job_services_attributes.filter(
            (single_job_service) => {
              if (single_job_service.service_id === service_id) {
                single_job_service.unit_count -= 1;
              }
              return single_job_service;
            }
          );
        }
      }
    } else if (event.target.dataset.action === "add") {
      // first find service from state
      service_obj = concerned_job.order_job_services_attributes.filter(
        (single_obj) => single_obj.service_id === service_id
      );

      if (Object.keys(service_obj).length) {
        // Service is present in state. So, increase by 1
        concerned_job.order_job_services_attributes.filter(
          (single_job_service) => {
            if (single_job_service.service_id === service_id) {
              single_job_service.unit_count += 1;
            }
            return single_job_service;
          }
        );
      } else {
        // Service not present in state. Add it and set unit_count = 1
        concerned_job.order_job_services_attributes.push({
          service_id: service_id,
          unit_count: 1,
          order_job_service_addons_attributes: [],
        });
      }
    }

    if (is_new_job) {
      // Working on new job
      this.setState({
        new_job: concerned_job,
      });
    } else {
      // Working on editing job
      this.setState({
        order_job_to_edit: concerned_job,
      });
    }
  };

  add_service_to_job = async (event, service, job) => {
    let job_id = job;
    let service_id = service.id;
    const { order_data } = this.state;
    let order_id = order_data.id;
    let self = this;
    let success = false;

    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/order_jobs/add_order_job_service.json",
        data: {
          order_id: order_id,
          order: {
            order_jobs_attributes: [
              {
                id: job_id,
                order_job_services_attributes: [
                  {
                    service_id: service_id,
                    unit_count: 1,
                    order_job_service_addons_attributes: [],
                  },
                ],
              },
            ],
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
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });

    if (success === true) {
      let order_job = await self.get_order_job(job_id);
      let order_data = await this.fetch_order();
      let order_billing = order_data.order_billing;
      self.setState({
        order_job_to_edit: order_job,
        order_data: order_data,
        order_billing: order_billing,
        inactive_jobs: order_data.inactive_jobs,
        order_discounts_list: order_data.order_discounts,
        order_jobs: order_data.order_jobs,
      });
    }
  };

  new_job_modal_body = () => {
    let technicians_dropdown_html = <></>;
    let self = this;
    const { technicians_dropdown } = this.state;
    if (technicians_dropdown.length) {
      technicians_dropdown_html = (
        <>
          <Row>
            <Colxx xxs="5">
              <Label className="mt-3"> Select Technician</Label>
              <Select
                className="react-select"
                classNamePrefix="react-select"
                onChange={(technician) =>
                  this.get_technician_services(
                    technician.value,
                    "new_job_modal_body"
                  )
                }
                options={technicians_dropdown}
              />
            </Colxx>
            <Colxx xxs="5">
              <Label className="mt-3"> Search Service</Label>
              <Input
                type="text"
                placeholder="Search by service name"
                onChange={(e) =>
                  self.setState({
                    search_services: e.target.value.split(" "),
                  })
                }
              />
            </Colxx>
          </Row>
        </>
      );
    }
    return technicians_dropdown_html;
  };

  render_client_image = (client_data) => {
    let image_url = "/assets/img/profile-pic-l.jpg";
    if (client_data.profile_photo_url !== null) {
      image_url = client_data.profile_photo_url;
    } else if (client_data.profile_picture !== null) {
      image_url = client_data.profile_picture;
    }

    return image_url;
  };

  add_coupon = async (event) => {
    event.preventDefault();
    const { order_data } = this.state;
    let coupon_code = event.target.elements["coupon_code"].value;
    let self = this;
    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/coupons/apply_coupon.json",
        data: {
          order_id: order_data.id,
          coupon_code: coupon_code,
        },
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
            "Coupon Applied Successfuly",
            "",
            5000,
            () => {
              alert("callback");
            },
            null,
            "filled"
          );
          self.setState({
            toggle_new_coupon_modal: !self.state.toggle_new_coupon_modal,
          });
          window.location.reload();
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

  render_add_coupon = () => {
    let new_coupon_html = (
      <>
        <Modal
          isOpen={this.state.toggle_new_coupon_modal}
          toggle={this.toggle_new_job_modal}
          wrapClassName="modal-right"
          size="sm"
        >
          <form onSubmit={this.add_coupon}>
            <ModalHeader toggle={this.toggle_new_coupon_modal}>
              Add Coupon
            </ModalHeader>
            <ModalBody>
              <Row>
                <Colxx md="4">
                  <Label>Enter Coupon Code(if any)</Label>
                </Colxx>
                <Colxx md="8">
                  <Input type="text" name="coupon_code" />
                </Colxx>
              </Row>
            </ModalBody>
            <ModalFooter
              className="p-2 pr-3"
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button color="primary" type="submit">
                {" "}
                Submit{" "}
              </Button>
              <Button color="secondary" onClick={this.toggle_new_coupon_modal}>
                {" "}
                Cancel{" "}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </>
    );
    return new_coupon_html;
  };

  render_new_job_modal = () => {
    let new_job_modal_html = (
      <>
        <Modal
          isOpen={this.state.toggle_new_job_modal}
          toggle={this.toggle_new_job_modal}
          wrapClassName="modal-right"
        >
          <ModalHeader toggle={this.toggle_new_job_modal}>
            Add New Job
          </ModalHeader>
          <ModalBody>
            {this.new_job_modal_body()}
            {this.render_services_data()}
          </ModalBody>
          <ModalFooter
            className="p-2 pr-3"
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button color="primary" onClick={this.create_new_job}>
              {" "}
              Submit{" "}
            </Button>
            <Button color="secondary" onClick={this.toggle_new_job_modal}>
              {" "}
              Cancel{" "}
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );

    return new_job_modal_html;
  };

  set_discount_type = (type) => {
    let self = this;
    self.setState({
      discount_type_value: type,
    });
  };

  get_reason_details = (reason) => {
    const { discount_reasons } = this.state;
    let self = this;
    self.setState({
      single_reason: [],
    });
    discount_reasons.forEach((single_reason) => {
      if (single_reason.id === reason) {
        self.setState({
          single_reason: single_reason,
        });
      }
    });
  };

  get_discount_reason = (reason) => {
    const { order_discounts } = this.state;
    let self = this;
    order_discounts.forEach((single_reason) => {
      if (single_reason.id === reason) {
        self.setState({
          single_reason: single_reason,
        });
      }
    });
  };

  render_reason_details = () => {
    let self = this;
    const { single_reason } = this.state;
    let reason_html = [];
    reason_html.push(
      <>
        {single_reason.is_order_free ? (
          <>
            <Label className="mt-3">Next Order will be free</Label>
            <Input
              hidden
              name="order_discount[is_apply_discount]"
              defaultValue="true"
            />
            <Input
              hidden
              name="order_discount[is_apply_penalty]"
              defaultValue="false"
            />
            <Input
              hidden
              name="order_discount[is_scheduled]"
              defaultValue="true"
            />
          </>
        ) : (
          <>
            {single_reason.is_discount_available === true ? (
              <>
                {single_reason.is_service_free === true ? (
                  <>
                    <Label className="mt-3">Service is free</Label>
                  </>
                ) : (
                  <></>
                )}
                <Row className="mt-3">
                  <Colxx md="2" className="mt-3">
                    <CustomInput
                      className="mb-2 mt-2"
                      type="checkbox"
                      label="Apply"
                      defaultChecked={true}
                      onChange={(event) => self.handleCheckChange(event)}
                    />
                    <Input
                      hidden
                      name="order_discount[is_apply_discount]"
                      defaultValue="true"
                    />
                  </Colxx>
                  <Colxx md="4">
                    <Label>Discount Type</Label>
                    <Select
                      className="react-select"
                      classNamePrefix="react-select"
                      // onChange={(type) => this.get_discount_reason(type.value)}
                      defaultValue={[
                        { label: "Percentage", value: "percentage" },
                      ]}
                      name="order_discount[other_percentage_type]"
                      options={[
                        { label: "Percentage", value: "percentage" },
                        { label: "Fixed", value: "fixed" },
                      ]}
                    />
                  </Colxx>
                  <Colxx md="4">
                    <Label>Value</Label>
                    <Input
                      type="number"
                      name="order_discount[discount_value]"
                      defaultValue={single_reason.discount_percentage}
                      min={0}
                    ></Input>
                  </Colxx>
                  <Colxx md="2" className="mt-3">
                    <CustomInput
                      className="mb-2 mt-2"
                      type="checkbox"
                      label="On next Order"
                      defaultChecked={false}
                      onChange={(event) => self.handleCheckChange(event)}
                    />
                    <Input
                      hidden
                      name="order_discount[is_scheduled]"
                      defaultValue="false"
                    />
                  </Colxx>
                </Row>
              </>
            ) : (
              <>
                <Input
                  hidden
                  name="order_discount[is_apply_discount]"
                  defaultValue="false"
                />
              </>
            )}
            {single_reason.is_penalty_available === true ? (
              <>
                <Row className="mt-3">
                  <Colxx md="2">
                    <CustomInput
                      className="mb-2 mt-2"
                      type="checkbox"
                      label="Apply"
                      defaultChecked={true}
                      onChange={(event) => self.handleCheckChange(event)}
                    />
                    <Input
                      hidden
                      name="order_discount[is_apply_penalty]"
                      defaultValue="true"
                    />
                  </Colxx>
                  <Colxx md="2">
                    <Label>Penalty Amount</Label>
                  </Colxx>
                  <Colxx md="4">
                    <Input
                      type="text"
                      name="order_discount[penalty_value]"
                      defaultValue={single_reason.penalty_price}
                    ></Input>
                  </Colxx>
                  <Colxx md="4"></Colxx>
                </Row>
              </>
            ) : (
              <>
                <Input
                  hidden
                  name="order_discount[is_apply_penalty]"
                  defaultValue="false"
                />
              </>
            )}
          </>
        )}
      </>
    );
    return reason_html;
  };

  render_add_penalty_order = () => {
    let add_penalty_modal_html = (
      <>
        <Modal
          isOpen={this.state.toggle_add_penalty_order}
          toggle={this.close_toggle_add_penalty_order}
          wrapClassName="modal-right"
        >
          <ModalHeader toggle={this.close_toggle_add_penalty_order}>
            Add Discount
          </ModalHeader>
          <form onSubmit={this.create_penalty}>
            <ModalBody>{this.add_penalty_order_body()}</ModalBody>
            <ModalFooter
              className="p-2 pr-3"
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button color="primary" type="submit">
                Submit
              </Button>
              <Button
                color="secondary"
                onClick={this.close_toggle_add_penalty_order}
              >
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </>
    );

    return add_penalty_modal_html;
  };

  handleComment = (value) => {
    this.setState({
      last_comment: value,
    });
  };

  render_comments_modal = () => {
    const { order_data, last_comment } = this.state;
    let comments_modal_html = (
      <>
        <Modal
          isOpen={this.state.toggle_comments_modal}
          toggle={this.close_comments_modal}
          // wrapClassName="modal-right"
          style={{ float: "right", marginTop: "10%" }}
        >
          <ModalHeader toggle={this.close_comments_modal}>Messages</ModalHeader>
          <ModalBody
            id="comment_body"
            style={{ height: "400px", width: "500px", overflowY: "scroll" }}
          >
            {this.add_comments_body()}
          </ModalBody>
          <ModalFooter
            style={{
              display: "block",
            }}
          >
            {" "}
            <form onSubmit={this.create_comment}>
              <Row>
                <Colxx sm="12">
                  <textarea
                    style={{
                      width: "85%",
                      borderRadius: "30px",
                      padding: "14px 0px 0px 10px",
                      outline: "none",
                      boxShadow: "none",
                    }}
                    name="message"
                    onChange={(e) => this.handleComment(e.target.value)}
                    required
                    value={last_comment}
                    placeholder="Enter message..."
                  />
                  <input
                    type="text"
                    hidden
                    name="order_id"
                    value={order_data.id}
                  />
                  <Button
                    size="sm"
                    className="ml-1"
                    style={{ marginBottom: "35px", height: "45px" }}
                    type="submit"
                  >
                    Send
                  </Button>
                </Colxx>
              </Row>
            </form>
          </ModalFooter>
        </Modal>
      </>
    );

    return comments_modal_html;
  };

  add_penalty_order_body = () => {
    let technicians_dropdown_html = <></>;
    const { order_data, order_discount_json } = this.state;

    technicians_dropdown_html = (
      <>
        <Input
          className="form-control"
          name="order_discount[order_id]"
          type="number"
          defaultValue={order_data.id}
          hidden
        />
        <Input
          className="form-control"
          name="order_discount[client_id]"
          type="number"
          defaultValue={order_data.client.id}
          hidden
        />
        <Input
          className="form-control"
          name="order_discount[discount_type]"
          type="number"
          defaultValue="Discount"
          hidden
        />
        <Label className="mt-3">Select Reason</Label>
        <Select
          className="react-select mt-2"
          classNamePrefix="react-select"
          onChange={(type) => this.get_discount_reason(type.value)}
          name="order_discount[reason_id]"
          options={order_discount_json}
        />
        {this.render_reason_details()}
      </>
    );
    return technicians_dropdown_html;
  };

  add_comments_body = () => {
    let comments_html = [];
    let first_name = localStorage.getItem("user_first_name");
    let last_name = localStorage.getItem("user_last_name");
    const { all_comments } = this.state;
    all_comments.forEach((single_comment) => {
      comments_html.push(
        <div>
          {single_comment.sent_by === first_name ? (
            <>
              <Row className="mt-2">
                <Colxx md="2"></Colxx>
                <Colxx md="10">
                  <div
                    style={{
                      backgroundColor: "#F4A460",
                      padding: "5px",
                      borderRadius: "10px",
                    }}
                  >
                    {single_comment.message}
                  </div>
                  <span style={{ float: "right" }}>
                    {single_comment.created_at}
                  </span>
                </Colxx>
              </Row>
            </>
          ) : (
            <>
              <Row className="mt-2">
                {/* <Colxx md="1">
                  <img
                    alt="Client"
                    src="/assets/img/avatar.png"
                    style={{ width: "15px", height: "15px" }}
                  />
                </Colxx> */}
                <Colxx md="10">
                  <span>
                    <b>{single_comment.sent_by}</b>
                  </span>
                  <div
                    style={{
                      backgroundColor: "#DCDCDC",
                      padding: "5px",
                      borderRadius: "10px",
                      outline: "none",
                      boxShadow: "none",
                    }}
                  >
                    {single_comment.message}
                  </div>
                  <span style={{ float: "right" }}>
                    {single_comment.created_at}
                  </span>
                </Colxx>
                <Colxx md="2"></Colxx>
              </Row>
            </>
          )}
        </div>
      );
    });
    return comments_html;
  };

  render_add_penalty = () => {
    let add_penalty_modal_html = (
      <>
        <Modal
          isOpen={this.state.toggle_add_penalty}
          toggle={this.toggle_add_penalty}
          wrapClassName="modal-right"
        >
          <ModalHeader toggle={this.close_toggle_add_penalty}>
            Add Penalty/Discount/Waiting Charges
          </ModalHeader>
          <form on onSubmit={this.create_penalty}>
            <ModalBody>{this.add_penalty_body()}</ModalBody>
            <ModalFooter
              className="p-2 pr-3"
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button color="primary" type="submit">
                {" "}
                Submit{" "}
              </Button>
              <Button color="secondary" onClick={this.close_toggle_add_penalty}>
                {" "}
                Cancel{" "}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </>
    );

    return add_penalty_modal_html;
  };

  add_penalty_body = () => {
    let technicians_dropdown_html = <></>;
    const {
      order_data,
      order_job_to_penalty,
      discount_type_value,
      discount_categories,
      categories_values_json,
    } = this.state;
    technicians_dropdown_html = (
      <>
        <Label>Job ({order_job_to_penalty.job_code})</Label>
        <br />

        <Input
          className="form-control"
          name="order_discount[order_id]"
          type="number"
          defaultValue={order_data.id}
          hidden
        />
        <Input
          className="form-control"
          name="order_discount[order_job_id]"
          type="number"
          defaultValue={order_job_to_penalty.id}
          hidden
        />
        <Input
          className="form-control"
          name="order_discount[technician_id]"
          type="number"
          defaultValue={order_job_to_penalty.technician_id}
          hidden
        />
        <Input
          className="form-control"
          name="order_discount[client_id]"
          type="number"
          defaultValue={order_data.client.id}
          hidden
        />
        <Label className="mt-3">Select Type</Label>
        <Select
          className="react-select mt-2"
          classNamePrefix="react-select"
          onChange={(type) => this.set_discount_type(type.value)}
          name="order_discount[discount_type]"
          options={[
            {
              label: "Discount/Penalty",
              value: "Discount",
              key: "discount",
            },
            {
              label: "Waiting Charges",
              value: "Waiting Charges",
              key: "waiting_charges",
            },
          ]}
        />
        {discount_type_value === "Discount" ? (
          <>
            <Label className="mt-3">Select Category</Label>
            <Select
              className="react-select mt-2"
              classNamePrefix="react-select"
              onChange={(type) => this.get_all_categories(type.value)}
              // name="order_discount[discount_type]"
              options={discount_categories}
            />
            <Label className="mt-3">Select Reason</Label>
            <Select
              className="react-select mt-2"
              classNamePrefix="react-select"
              onChange={(type) => this.get_reason_details(type.value)}
              name="order_discount[reason_id]"
              options={categories_values_json}
            />
            {this.render_reason_details()}
          </>
        ) : (
          <></>
        )}

        {discount_type_value === "Waiting Charges" ? (
          <>
            <Label className="mt-2">Amount</Label>
            <Input
              type="number"
              name="order_discount[discount_value]"
              className="mt-2"
              min="0"
            />
          </>
        ) : (
          <></>
        )}

        {/* {discount_type_value === "Discount" ? (
          <>
            <CustomInput
              className="mb-2 mt-2"
              type="checkbox"
              label="On next Order"
              defaultChecked={false}
              onChange={(event) => self.handleCheckChange(event)}
            />
            <Input
              hidden
              name="order_discount[is_scheduled]"
              defaultValue="false"
            />
          </>
        ) : (
          <></>
        )} */}
      </>
    );
    return technicians_dropdown_html;
  };

  delete_job_service = async (job_id) => {
    let success = false;
    const { match } = this.props;

    await trackPromise(
      axios({
        method: "delete",
        url: servicePath + "/api/v2/order_jobs/remove_order_job_service.json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
        data: {
          order_id: match.params.id,
          order_job_id: job_id,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          success = true;
          NotificationManager.success(
            "Job deleted successfully",
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
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });

    if (success) {
      let order_jobs = await this.fetch_order_jobs();
      let order_data = await this.fetch_order();
      let order_billing = order_data.order_billing;
      this.setState({
        order_jobs: order_jobs,
        order_data: order_data,
        inactive_jobs: order_data.inactive_jobs,
        order_discounts_list: order_data.order_discounts,
        order_billing: order_billing,
      });
    }
  };

  create_new_job = async () => {
    const { new_job } = this.state;
    let success = false;

    if (new_job.order_job_services_attributes.length) {
      await trackPromise(
        axios({
          method: "post",
          url: servicePath + "/api/v2/order_jobs.json",
          data: {
            order_id: new_job.order_id,
            order: {
              order_jobs_attributes: [new_job],
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
            success = true;
            NotificationManager.success(
              "Job created successfully",
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
            () => {},
            null,
            "filled"
          );
          console.log("error", error);
        });
    } else {
      NotificationManager.error(
        "No service selected",
        "",
        2000,
        () => {},
        null,
        "filled"
      );
    }

    if (success) {
      let order_data = await this.fetch_order();
      let order_billing = order_data.order_billing;
      this.setState({
        toggle_new_job_modal: !this.state.toggle_new_job_modal,
        technician_services: [],
        order_data: order_data,
        order_jobs: order_data.order_jobs,
        inactive_jobs: order_data.inactive_jobs,
        order_billing: order_billing,
        order_discounts_list: order_data.order_discounts,
        new_job: {
          order_id: this.props.match.params.id,
          technician_id: "",
          order_job_services_attributes: [],
        },
      });
    }
  };

  render_job_services = (job) => {
    const { order_job_to_edit } = this.state;
    let job_services_html = [];

    order_job_to_edit.order_job_services.map((service) => {
      job_services_html.push(
        <Row>
          <Colxx xxs="12" className="mb-3">
            <ContextMenuTrigger id="menu_id" data={job.id}>
              <Card>
                <div className="pl-2 d-flex flex-grow-1 min-width-zero">
                  <div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
                    <p className="list-item-heading mb-1 truncate">
                      {service.service_title}
                    </p>
                  </div>
                  <div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
                    <Button color="danger" className="">
                      {" "}
                      Remove{" "}
                    </Button>
                  </div>
                </div>
              </Card>
            </ContextMenuTrigger>
          </Colxx>
        </Row>
      );
      return service;
    });

    return job_services_html;
  };

  handleEditJob = (event) => {
    let { order_job_to_edit } = this.state;

    if (event.target.name === "order_job[start_time]")
      order_job_to_edit.start_time = event.target.value;
    else if (event.target.name === "order_job[end_time]")
      order_job_to_edit.end_time = event.target.value;

    this.setState({
      order_job_to_edit: order_job_to_edit,
    });
  };

  searchServices = (event) => {};

  render_edit_job_modal = () => {
    let self = this;
    let edit_job_modal = <> </>;
    const { order_job_to_edit } = this.state;

    if (Object.keys(order_job_to_edit).length) {
      let start_time = moment(order_job_to_edit.start_time, ["h:mm A"]).format(
        "HH:mm"
      );
      // let end_time = moment(order_job_to_edit.end_time, ["h:mm A"]).format(
      //   "HH:mm"
      // );

      edit_job_modal = (
        <>
          <Modal
            isOpen={this.state.modal_edit_job}
            toggle={this.toggleEditJobModal}
            wrapClassName="modal-right"
          >
            <ModalHeader toggle={this.toggleEditJobModal}>
              Edit Job ({order_job_to_edit.job_code}) - (
              {order_job_to_edit.job_status})
            </ModalHeader>
            <ModalBody>
              <Row>
                <Colxx xxs="6">
                  <Label for="start_time" className="mt-4">
                    {" "}
                    Start Time{" "}
                  </Label>
                  <Input
                    className="form-control"
                    name="order_job[start_time]"
                    type="time"
                    id="start_time"
                    defaultValue={start_time}
                    onChange={(event) => this.handleEditJob(event)}
                  />
                </Colxx>
                <Colxx xxs="6">
                  <Label className="mt-4"> Search Service</Label>
                  <Input
                    type="text"
                    placeholder="Search by service name"
                    onChange={(e) =>
                      self.setState({
                        search_services: e.target.value.split(" "),
                      })
                    }
                  />
                </Colxx>

                {/* <Colxx xxs="6" className="mb-2">
                  <Label for="end_time" className="mt-4">
                    End Time
                  </Label>
                  <Input
                    className="form-control"
                    name="order_job[end_time]"
                    type="time"
                    id="end_time"
                    defaultValue={end_time}
                    onChange={(event) => this.handleEditJob(event)}
                  />
                </Colxx> */}
                {self.render_services_data(order_job_to_edit)}
              </Row>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={this.toggle_job_warning_modal}>
                {" "}
                Update{" "}
              </Button>
              <Button color="secondary" onClick={this.toggleEditJobModal}>
                {" "}
                Cancel{" "}
              </Button>
            </ModalFooter>
          </Modal>
        </>
      );
    }

    return edit_job_modal;
  };

  toggle_job_warning_modal = () => {
    this.setState({
      show_job_edit_warning: !this.state.show_job_edit_warning,
    });
  };

  prepare_update_job_json = (status, order_job_to_edit) => {
    let job_edit_json = {
      // id: order_job_to_edit.id,
      order_id: order_job_to_edit.order_id,
      status: status,
      // start_time: order_job_to_edit.start_time,
      // end_time: order_job_to_edit.end_time,
      // order_job_services_attributes: []
    };

    job_edit_json.order_job = {
      id: order_job_to_edit.id,
      start_time: order_job_to_edit.start_time,
      end_time: order_job_to_edit.end_time,
      order_job_services_attributes: [],
    };

    order_job_to_edit.order_job_services_attributes.forEach(
      (single_order_job_service) => {
        job_edit_json.order_job.order_job_services_attributes.push({
          id: single_order_job_service.id,
          order_job_id:
            single_order_job_service.order_job_id || order_job_to_edit.id,
          service_id: single_order_job_service.service_id,
          unit_count: single_order_job_service.unit_count,
          order_job_service_addons_attributes:
            single_order_job_service.order_job_service_addons_attributes,
        });
      }
    );

    return job_edit_json;
  };

  update_travel_charges = async (event) => {
    event.preventDefault();
    let data = new FormData(event.target);
    let success = false;
    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/orders/change_travel_charges.json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
        data: data,
      })
    )
      .then((response) => {
        if (response.status === 200) {
          success = true;
          this.setState({
            toggle_change_travel_charges:
              !this.state.toggle_change_travel_charges,
          });
          NotificationManager.success(
            "Travel Charges updated successfully",
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
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });
    if (success === true) {
      let order_jobs = [];
      let order_billing = {};
      let order_data = await this.fetch_order();
      if (order_data.order_jobs.length) {
        order_jobs = order_data.order_jobs;
        order_billing = order_data.order_billing;
      } else {
        order_jobs = await this.fetch_order_jobs();
      }
      this.setState({
        order_data: order_data,
        order_billing: order_billing,
        order_jobs: order_jobs,
        inactive_jobs: order_data.inactive_jobs,
        order_discounts_list: order_data.order_discounts,
      });
    }
  };

  add_csr_comment = async (event) => {
    event.preventDefault();
    let formData = new FormData(event.target);
    let comment = event.target["order[csr_comment]"].value;
    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/orders/update_csr_comment.json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
        data: formData,
      })
    )
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            csr_comment: comment,
            is_update_csr_comment: false,
          });
          NotificationManager.success(
            "CSR Comment added successfully",
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
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });
  };

  update_order_job = async (event) => {
    const { order_job_to_edit } = this.state;
    let status = event.target.dataset.status;
    let job_edit_json = this.prepare_update_job_json(status, order_job_to_edit);

    let success = true;

    await trackPromise(
      axios({
        method: "post",
        url:
          servicePath +
          "/api/v2/order_jobs/" +
          order_job_to_edit.id +
          "/order_job_update.json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
        data: job_edit_json,
      })
    )
      .then((response) => {
        if (response.status === 200) {
          success = true;
          NotificationManager.success(
            "Job updated successfully",
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
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });

    if (success) {
      let order_data = await this.fetch_order();
      let order_billing = order_data.order_billing;
      this.setState({
        order_data: order_data,
        order_billing: order_billing,
        order_jobs: order_data.order_jobs,
        inactive_jobs: order_data.inactive_jobs,
        show_job_edit_warning: false,
        modal_edit_job: false,
        order_job_to_edit: {},
        order_discounts_list: order_data.order_discounts,
      });
    }
  };

  render_job_edit_warning_html = () => {
    let job_edit_warning_html = (
      <>
        <Modal
          isOpen={this.state.show_job_edit_warning}
          size="lg"
          toggle={this.toggle_job_warning_modal}
        >
          <ModalHeader toggle={this.toggle_job_warning_modal}>
            Do you want to re-order schedular or keep same ? <br />
          </ModalHeader>
          <ModalBody>
            <Button
              size="sm"
              onClick={(event) => this.update_order_job(event)}
              data-status="true"
              className="btn-success mr-2"
            >
              {" "}
              Re-Order{" "}
            </Button>
            <Button
              size="sm"
              onClick={(event) => this.update_order_job(event)}
              data-status="false"
              className="btn-success mr-2"
            >
              {" "}
              Keep Same{" "}
            </Button>
            <Button
              size="sm"
              onClick={this.toggle_job_warning_modal}
              className="btn-success"
            >
              {" "}
              Cancel{" "}
            </Button>
          </ModalBody>
        </Modal>
      </>
    );

    return job_edit_warning_html;
  };

  render_job_technician_details = (job) => {
    const { order_data, is_super_edit } = this.state;
    let self = this;
    let job_technician_details_html = (
      <>
        <Colxx xxs="3" className="bg-secondary text-white p-3">
          <strong
            className="d-block bg-light text-dark text-center rounded pt-1 mb-3"
            style={{ paddingBottom: "2px" }}
          >
            {job.job_code}
          </strong>
          <div className="client-image d-block text-center">
            {job.technician.profile_photo_url?.length > 0 ? (
              <img
                src={job.technician.profile_photo_url}
                className="user-img"
                alt="Client"
              />
            ) : (
              <img
                alt="Client"
                src="/assets/img/profile-pic-l.jpg"
                className="user-img"
              />
            )}
          </div>
          <span className="d-block text-center">
            {job.technician.first_name} {job.technician.last_name}
          </span>
          <strong className="d-block text-center">
            ({job.technician.membership_code})
          </strong>
          {order_data.status !== "Rescheduled" ? (
            <>
              {job.job_status === "Cancelled" ||
              job.job_status === "Decline" ||
              job.job_status === "Complete" ||
              order_data.status === "Cancelled" ||
              order_data.status === "Completed" ? (
                is_super_edit ? (
                  <>{this.render_change_job_status_button(job)}</>
                ) : (
                  <>
                    <strong
                      className="d-block bg-light text-dark text-center rounded pt-1 mt-2"
                      style={{ paddingBottom: "2px", cursor: "pointer" }}
                      data-job-id={job.id}
                    >
                      {job.job_status}
                    </strong>
                  </>
                )
              ) : (
                <>{this.render_change_job_status_button(job)}</>
              )}
              {job.job_status === "Cancelled" ||
              job.job_status === "Decline" ||
              job.job_status === "Complete" ||
              job.job_status === "Confirmed" ||
              order_data.status === "Cancelled" ||
              order_data.status === "Completed" ? (
                is_super_edit ? (
                  <>{this.render_change_technician_button(job)}</>
                ) : (
                  ""
                )
              ) : (
                <>{this.render_change_technician_button(job)}</>
              )}
            </>
          ) : (
            <>
              <strong className="d-block text-center">
                ({job.technician.phone})
              </strong>
            </>
          )}
          {job.is_paid ? (
            <>
              <Popover
                placement="right"
                title="Payment Details"
                width="500"
                trigger="click"
                content={self.set_payment_details(job)}
              >
                <Button
                  className="mt-2"
                  color="success"
                  size="sm"
                  style={{ width: "100%" }}
                >
                  Paid
                </Button>
              </Popover>
            </>
          ) : (
            <></>
          )}
        </Colxx>
      </>
    );

    return job_technician_details_html;
  };

  set_payment_details = (job) => {
    let payment_details_html = [];
    payment_details_html = (
      <>
        <tr>
          <td style={{ color: "black" }}>
            {" "}
            <strong>Payment Receipt: </strong>
          </td>
          <td style={{ color: "black", paddingLeft: "15px" }}>
            <a href={job.payment_receipt} target="_blank">
              Click Here
            </a>
          </td>
        </tr>
        <tr>
          <td style={{ color: "black" }}>
            {" "}
            <strong>Comments:</strong>{" "}
          </td>
          <td style={{ color: "black", paddingLeft: "15px" }}>
            {" "}
            {job.payment_comments}{" "}
          </td>
        </tr>
      </>
    );
    return payment_details_html;
  };

  toggle_job_technician_change_modal = async (event) => {
    let { order_job_to_edit, toggle_job_technician_change_modal } = this.state;
    let job_id = parseInt(event.target.dataset.jobId);
    let result = await check_permission("order_jobs/update", "");
    if (result) {
      if (toggle_job_technician_change_modal === true) {
        // It's already open. We are here to close it.
        this.setState({
          order_job_to_edit: {},
          toggle_job_technician_change_modal:
            !this.state.toggle_job_technician_change_modal,
        });
      } else if (toggle_job_technician_change_modal === false) {
        // It's closed, Open it after fetching relevant data
        // order_job_to_edit = await this.get_order_job(job_id);
        let job_alternative_technicians =
          await this.get_curr_job_possible_technicians(job_id);

        this.setState({
          order_job_to_edit: { id: job_id },
          job_alternative_technicians: job_alternative_technicians,
          toggle_job_technician_change_modal:
            !this.state.toggle_job_technician_change_modal,
        });
      }
    }
  };

  toggle_job_status_change_modal = async (event) => {
    let { order_job_to_edit, toggle_job_status_change_modal } = this.state;

    let job_id = parseInt(event.target.dataset.jobId);
    let result = await check_permission("order_jobs/update", "");
    if (result) {
      if (toggle_job_status_change_modal === true) {
        // It's already open. We are here to close it.
        this.setState({
          order_job_to_edit: {},
          toggle_job_status_change_modal:
            !this.state.toggle_job_status_change_modal,
        });
      } else if (toggle_job_status_change_modal === false) {
        // It's closed, Open it after fetching relevant data
        order_job_to_edit = await this.get_order_job(job_id);

        this.setState({
          order_job_to_edit: order_job_to_edit,
          toggle_job_status_change_modal:
            !this.state.toggle_job_status_change_modal,
        });
      }
    }
  };

  prepare_job_alternative_technicians_json = () => {
    const { job_alternative_technicians } = this.state;
    let technicians_json = [];

    // id: 359
    // first_name: "Jeffry"
    // last_name: "Kuvalis"
    // user_details:
    // preferred_gender: "Female"
    // commission: 70
    // contract_to: null
    // contract_from: null
    // membership_code: "GP-20200414359"
    // notes: "Some Notes"
    job_alternative_technicians.forEach((single_technician) => {
      technicians_json.push({
        label:
          single_technician.first_name +
          " " +
          single_technician.last_name +
          " - (" +
          single_technician.membership_code +
          ")",
        value: single_technician.id,
        key: single_technician.id,
      });
    });

    return technicians_json;
  };

  render_change_order_job_technician_modal = () => {
    let job_alternative_technicians_json =
      this.prepare_job_alternative_technicians_json();

    let job_technician_change_modal_html = (
      <>
        <Modal
          size="lg"
          isOpen={this.state.toggle_job_technician_change_modal}
          toggle={this.toggle_job_technician_change_modal}
        >
          <ModalHeader toggle={this.toggle_job_technician_change_modal}>
            Change Job Technician
          </ModalHeader>
          <ModalBody>
            <Select
              className="react-select"
              classNamePrefix="react-select"
              onChange={(technician) =>
                this.set_job_alternative_technician(technician.value)
              }
              options={job_alternative_technicians_json}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.update_job_technician}>
              {" "}
              Submit{" "}
            </Button>
            <Button
              color="secondary"
              onClick={this.toggle_job_technician_change_modal}
            >
              {" "}
              Cancel{" "}
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );

    return job_technician_change_modal_html;
  };

  render_change_order_job_status_modal = () => {
    const { order_job_to_edit } = this.state;
    let job_statuses = [];
    if (order_job_to_edit.job_status === "Suggestion") {
      job_statuses = [
        {
          label: "Assignment",
          value: "Assignment",
          key: 0,
        },
        {
          label: "Confirmed",
          value: "Confirmed",
          key: 1,
        },
      ];
    } else if (order_job_to_edit.job_status === "Assignment") {
      job_statuses = [
        {
          label: "Confirmed",
          value: "Confirmed",
          key: 1,
        },
      ];
    } else if (order_job_to_edit.job_status === "Confirmed") {
      job_statuses = [
        {
          label: "Assignment",
          value: "Assignment",
          key: 0,
        },
        { label: "Complete", value: "Complete", key: 2 },
      ];
    }
    let job_status_change_modal_html = (
      <>
        <Modal
          size="lg"
          isOpen={this.state.toggle_job_status_change_modal}
          toggle={this.toggle_job_status_change_modal}
        >
          <ModalHeader toggle={this.toggle_job_status_change_modal}>
            Change Job Status
          </ModalHeader>
          <ModalBody>
            <Select
              className="react-select"
              classNamePrefix="react-select"
              onChange={(event) => this.set_job_status(event)}
              // defaultValue={ Object.keys(order_job_to_edit).length > 0 ? { label: order_job_to_edit.job_status, value: order_job_to_edit.job_status, key: 0 } : {} }
              options={job_statuses}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.update_job_status}>
              Submit
            </Button>
            <Button
              color="secondary"
              onClick={this.toggle_job_status_change_modal}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );

    return job_status_change_modal_html;
  };

  render_change_travel_charges = () => {
    const { order_data } = this.state;
    let change_travel_charges_modal_html = (
      <>
        <Modal
          size="md"
          isOpen={this.state.toggle_change_travel_charges}
          toggle={this.toggle_change_travel_charges}
        >
          <form onSubmit={this.update_travel_charges}>
            <ModalHeader toggle={this.toggle_change_travel_charges}>
              Change Travel Charges
            </ModalHeader>
            <ModalBody>
              <Label>Travel Charges</Label>
              <Input
                name="travel_charges"
                defaultValue={order_data.order_billing.travel_charges}
              />
              <Input name="id" value={order_data.id} hidden />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit">
                Submit
              </Button>
              <Button
                color="secondary"
                onClick={this.toggle_change_travel_charges}
              >
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </>
    );

    return change_travel_charges_modal_html;
  };

  set_job_alternative_technician = (technician_id) => {
    let { order_job_to_edit } = this.state;
    order_job_to_edit.technician_id = technician_id;

    this.setState({
      order_job_to_edit: order_job_to_edit,
    });
  };

  set_job_status = (event) => {
    let { order_job_to_edit } = this.state;
    order_job_to_edit.job_status = event.value;

    this.setState({
      order_job_to_edit: order_job_to_edit,
    });
  };

  update_job_technician = async () => {
    const { order_job_to_edit } = this.state;
    let success = true;

    await trackPromise(
      axios({
        method: "put",
        url:
          servicePath + "/api/v2/order_jobs/" + order_job_to_edit.id + ".json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
        data: {
          order_job: {
            technician_id: order_job_to_edit.technician_id,
          },
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          success = true;
          NotificationManager.success(
            "Job Technician updated successfully",
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
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });

    if (success) {
      let order_data = await this.fetch_order();

      this.setState({
        order_data: order_data,
        order_jobs: order_data.order_jobs,
        inactive_jobs: order_data.inactive_jobs,
        order_job_to_edit: {},
        toggle_job_technician_change_modal: false,
        order_discounts_list: order_data.order_discounts,
      });
    }
  };

  approveClient = async (event) => {
    const { order_data } = this.state;
    if (order_data.client.cnic === null || order_data.client.cnic === "") {
      NotificationManager.error(
        "Cannot approve client. No CNIC found",
        "",
        5000,
        () => {},
        null,
        "filled"
      );
    } else {
      await trackPromise(
        axios({
          method: "put",
          url: servicePath + "/api/v2/users/" + order_data.client.id + ".json",
          data: {
            user: {
              approved_status: "Approved",
              is_cnic_verified: true,
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
            window.location.reload();
            NotificationManager.success(
              "Approved Successfully",
              "",
              3000,
              null,
              null,
              "filled"
            );
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
  };

  update_job_status = async () => {
    const { order_job_to_edit } = this.state;
    let success = true;

    await trackPromise(
      axios({
        method: "put",
        url:
          servicePath + "/api/v2/order_jobs/" + order_job_to_edit.id + ".json",
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
        data: {
          order_job: {
            job_status: order_job_to_edit.job_status,
          },
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          success = true;
          NotificationManager.success(
            "Job Status updated successfully",
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
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });

    if (success) {
      let order_data = await this.fetch_order();
      let order_billing = order_data.order_billing;
      this.setState({
        order_data: order_data,
        order_billing: order_billing,
        order_jobs: order_data.order_jobs,
        inactive_jobs: order_data.inactive_jobs,
        order_job_to_edit: {},
        toggle_job_status_change_modal: false,
        order_discounts_list: order_data.order_discounts,
      });
    }
  };

  render_job_timings = (job) => {
    const { order_data } = this.state;
    let job_timings_html = (
      <>
        <Colxx xxs="12" className="bg-dark text-white p-2">
          <div className="d-inline-block mr-1">
            <div className="glyph-icon iconsminds-24-hour">
              <strong> Start Time: </strong>
              <span> {job.start_time} </span>
            </div>
          </div>

          <div className="d-inline-block">
            <div className="glyph-icon iconsminds-sand-watch-2">
              <strong> Expected Duration: </strong>
              <span> {job.job_duration} </span>
            </div>
          </div>

          <div
            className="btn-group float-right"
            role="group"
            aria-label="Basic example"
          >
            {order_data.status !== "Rescheduled" ? (
              <>{this.render_job_actions(job)}</>
            ) : (
              <></>
            )}
          </div>
        </Colxx>
      </>
    );

    return job_timings_html;
  };

  render_job_actions = (job) => {
    const { is_super_edit } = this.state;
    let actions_html = <> </>;

    if (job.job_status === "Decline") {
      actions_html = (
        <>
          <Button color="danger" size="sm">
            {" "}
            Declined{" "}
          </Button>
        </>
      );
    } else if (job.job_status === "Cancelled") {
      actions_html = (
        <>
          <Button color="danger" size="sm">
            {" "}
            Cancelled{" "}
          </Button>
        </>
      );
    } else if (is_super_edit) {
      actions_html = (
        <>
          <Button
            type="button"
            style={{ padding: "0 8px" }}
            className="btn btn-secondary btn-sm"
            onClick={(event) => this.toggle_add_penalty(event, job.id)}
          >
            Penalty/Discount
          </Button>
          <Button
            color="primary"
            style={{ padding: "0 8px" }}
            onClick={(event) => this.toggleEditJobModal(event, job.id)}
          >
            Edit
          </Button>
          <Button
            color="danger"
            style={{ padding: "0 8px" }}
            onClick={async (event) =>
              this.delete_order_job(event, job.id, "Decline")
            }
          >
            Decline
          </Button>
          <Button
            color="danger"
            style={{ padding: "0 8px" }}
            onClick={async (event) =>
              this.delete_order_job(event, job.id, "Cancelled")
            }
          >
            Cancel
          </Button>
        </>
      );
    } else if (job.is_paid === true && job.job_status === "Complete") {
      actions_html = <></>;
    } else if (job.job_status === "Complete") {
      actions_html = (
        <>
          <Button
            type="button"
            style={{ padding: "0 8px" }}
            className="btn btn-secondary btn-sm"
            onClick={(event) => this.toggle_add_penalty(event, job.id)}
          >
            Penalty/Discount
          </Button>
          <Button
            color="primary"
            style={{ padding: "0 8px" }}
            onClick={(event) => this.toggleEditJobModal(event, job.id)}
          >
            Edit
          </Button>
        </>
      );
    } else if (job.job_status === "Confirmed") {
      actions_html = (
        <>
          <Button
            type="button"
            style={{ padding: "0 8px" }}
            className="btn btn-secondary btn-sm"
            onClick={(event) => this.toggle_add_penalty(event, job.id)}
          >
            Penalty/Discount
          </Button>
          <Button
            color="primary"
            style={{ padding: "0 8px" }}
            onClick={(event) => this.toggleEditJobModal(event, job.id)}
          >
            Edit
          </Button>
          <Button
            color="danger"
            style={{ padding: "0 8px" }}
            onClick={async (event) =>
              this.delete_order_job(event, job.id, "Decline")
            }
          >
            Decline
          </Button>
          <Button
            color="danger"
            style={{ padding: "0 8px" }}
            onClick={async (event) =>
              this.delete_order_job(event, job.id, "Cancelled")
            }
          >
            Cancel
          </Button>
        </>
      );
    } else {
      actions_html = (
        <>
          <Button
            color="primary"
            style={{ padding: "0 8px" }}
            onClick={(event) => this.toggleEditJobModal(event, job.id)}
          >
            Edit
          </Button>
          <Button
            color="danger"
            style={{ padding: "0 8px" }}
            onClick={async (event) =>
              this.delete_order_job(event, job.id, "Decline")
            }
          >
            Decline
          </Button>
          <Button
            color="danger"
            style={{ padding: "0 8px" }}
            onClick={async (event) =>
              this.delete_order_job(event, job.id, "Cancelled")
            }
          >
            Cancel
          </Button>
        </>
      );
    }

    return actions_html;
  };

  make_public = async (order_id) => {
    let self = this;
    await trackPromise(
      axios({
        method: "post",
        url:
          servicePath +
          "/api/v2/orders/" +
          order_id +
          "/public_to_technician.json",
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
            is_public_to_technician: true,
          });
          NotificationManager.success(
            "Job is now public for technicians",
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
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });
  };

  delete_order_job = async (event, job_id, status) => {
    let result = await check_permission("order_jobs/update", "");
    if (result) {
      let success = false;
      await trackPromise(
        axios({
          method: "put",
          url: servicePath + "/api/v2/order_jobs/" + job_id + ".json",
          headers: {
            "Content-Type": "application/json",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
          },
          data: {
            order_job: {
              job_status: status,
            },
          },
        })
      )
        .then((response) => {
          if (response.status === 200) {
            success = true;
            NotificationManager.success(
              "Job Cancelled successfully",
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
          // NotificationManager.error(
          //   error.response.data.message,
          //   "",
          //   5000,
          //   () => {},
          //   null,
          //   "filled"
          // );
          console.log("error", error);
        });

      if (success) {
        let order_data = await this.fetch_order();
        let order_billing = order_data.order_billing;

        this.setState({
          order_data: order_data,
          order_billing: order_billing,
          order_jobs: order_data.order_jobs,
          inactive_jobs: order_data.inactive_jobs,
          order_discounts_list: order_data.order_discounts,
        });
      }
    }
  };

  delete_order_discount = async (event, order_discount_id, order_id) => {
    let result = await check_permission("order_discounts/remove_discount", "");
    if (result) {
      let success = false;
      await trackPromise(
        axios({
          method: "delete",
          url:
            servicePath +
            "/api/v2/order_discounts/remove_discount.json?id=" +
            order_discount_id +
            "&order_id=" +
            order_id,
          headers: {
            "Content-Type": "application/json",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
          },
        })
      )
        .then((response) => {
          if (response.status === 200) {
            success = true;
            NotificationManager.success(
              "Discount removed successfully",
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
          console.log("error", error);
        });

      if (success) {
        let order_data = await this.fetch_order();
        let order_billing = order_data.order_billing;

        this.setState({
          order_data: order_data,
          order_billing: order_billing,
          order_jobs: order_data.order_jobs,
          inactive_jobs: order_data.inactive_jobs,
          order_discounts_list: order_data.order_discounts,
        });
      }
    }
  };

  list_order_job_service_addons = (job_service) => {
    let job_service_addons_html = [];
    job_service_addons_html.push(
      <>
        {" "}
        <br />{" "}
      </>
    );
    job_service.order_job_service_addons.forEach(function (single_addon) {
      job_service_addons_html.push(
        <>
          <span className="ml-3">
            - {single_addon.addon_title} ({single_addon.unit_count})
          </span>{" "}
          <br />
        </>
      );
    });

    return job_service_addons_html;
  };

  change_service_technician = async (job_id, service_id) => {
    let result = await check_permission("order_jobs/switch_job_service", "");
    if (result) {
      let found_tech = false;
      this.state.job_service_id = "";
      let self = this;
      let service_techicians = [];
      let techicians = [];
      await trackPromise(
        axios({
          method: "post",
          url:
            servicePath + "/api/v2/order_jobs/change_service_technician.json",
          headers: {
            "Content-Type": "application/json",
            "AUTH-TOKEN": localStorage.getItem("auth_token"),
            "IS-ACCESSIBLE": true,
          },
          data: {
            order_job_id: job_id,
            order_job_service_id: service_id,
          },
        })
      )
        .then((response) => {
          if (response.status === 200 && response.data.technicians.length) {
            found_tech = true;
            service_techicians = response.data.technicians;
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

      if (found_tech) {
        techicians = self.prepare_service_technician(service_techicians);
        self.setState({
          change_technician: techicians,
          job_service_id: service_id,
        });
        self.toggle_change_service_technician();
      }
    }
  };

  prepare_service_technician = (technicians) => {
    let technician_dropdown_data = [];
    technicians.forEach(function (currentValue) {
      technician_dropdown_data.push({
        label:
          currentValue.first_name +
          " " +
          currentValue.last_name +
          " (" +
          currentValue.membership_code +
          ")",
        value: currentValue.id,
        key: currentValue.id,
      });
    });

    return technician_dropdown_data;
  };

  render_current_job_services = (job) => {
    const { order_jobs, order_data } = this.state;
    let single_job_services = [];
    let self = this;
    job.order_job_services.forEach((job_service) => {
      single_job_services.push(
        <>
          <tr key={job_service.id}>
            <th scope="row">
              <span>
                {" "}
                - {job_service.service_title}
                {job_service.is_deal === true ? (
                  <>
                    <Badge color="success">Deal</Badge>
                  </>
                ) : (
                  <></>
                )}{" "}
                ({job_service.unit_count}){" "}
                {order_jobs.length > 1 ? (
                  <>
                    {order_data.status === "Pending" &&
                    (job.job_status === "Suggestion" ||
                      job.job_status === "Assignment") ? (
                      <>
                        <Link
                          onClick={() =>
                            self.change_service_technician(
                              job.id,
                              job_service.id
                            )
                          }
                          style={{ color: "blue" }}
                        >
                          <u>Switch</u>
                        </Link>
                      </>
                    ) : (
                      <></>
                    )}
                    {self.render_change_service_technician()}
                  </>
                ) : (
                  <></>
                )}
              </span>
              {job_service.order_job_service_addons.length > 0
                ? self.list_order_job_service_addons(job_service)
                : ""}
            </th>
            <td>
              <span>
                {" "}
                {job_service.free_service_redeemed_discount > 0 ? (
                  <>
                    <strike>
                      {job_service.service_price} x ({job_service.unit_count}) ={" "}
                      {job_service.service_price * job_service.unit_count}
                    </strike>{" "}
                    {job_service.free_service_redeemed_discount ===
                    job_service.service_price * job_service.unit_count ? (
                      <>
                        <Badge color="success">Free</Badge>
                      </>
                    ) : (
                      <>
                        {job_service.service_price * job_service.unit_count -
                          job_service.free_service_redeemed_discount}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {job_service.service_price} x ({job_service.unit_count}) ={" "}
                    {job_service.is_deal === true ? (
                      <>
                        <strike>
                          {job_service.service_price * job_service.unit_count}
                        </strike>{" "}
                        {job_service.discounted_price}
                      </>
                    ) : (
                      <>{job_service.service_price * job_service.unit_count}</>
                    )}
                  </>
                )}
              </span>
              {job_service.order_job_service_addons.length > 0
                ? self.list_order_job_service_addons_prices(job_service)
                : ""}
            </td>
          </tr>
        </>
      );
    });

    return single_job_services;
  };

  list_order_job_service_addons_prices = (job_service) => {
    let job_service_addons_html = [];
    job_service_addons_html.push(
      <>
        {" "}
        <br />{" "}
      </>
    );
    job_service.order_job_service_addons.forEach(function (single_addon) {
      job_service_addons_html.push(
        <>
          {single_addon.unit_price} x ({single_addon.unit_count}) ={" "}
          {single_addon.unit_price * single_addon.unit_count}
          <br />
        </>
      );
    });

    return job_service_addons_html;
  };

  set_discount = (job) => {
    let discount_reson_html = [];
    job.order_job_discounts.forEach((discount, index) => {
      discount_reson_html.push(
        <>
          <Row>
            <Colxx md="2">{index + 1}</Colxx>
            <Colxx md="8">{discount.reason_title}</Colxx>
            <Colxx md="2">{discount.discount_value}</Colxx>
          </Row>
        </>
      );
    });

    return discount_reson_html;
  };

  set_coupon_details = (coupon_details) => {
    let discount_reson_html = [];
    discount_reson_html = (
      <>
        <table class="table table-borderless">
          <thead>
            <tr>
              <th scope="col"> Title</th>
              <th scope="col"> Code</th>
              <th scope="col"> Discount</th>
              <th scope="col"> Redeem</th>
              <th scope="col"> Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{coupon_details.coupon_title}</td>
              <td>{coupon_details.coupon_code}</td>
              <td>
                {coupon_details.discount_type === "percentage" ? (
                  <>
                    {coupon_details.discount} {"%"}
                  </>
                ) : (
                  <>{coupon_details.discount}</>
                )}
              </td>
              <td>
                {coupon_details.self_redeemed}/{coupon_details.usage_user_limit}
              </td>
              <td>{coupon_details.end_datetime}</td>
            </tr>
          </tbody>
        </table>
      </>
    );
    return discount_reson_html;
  };

  set_penalty = (job) => {
    let discount_reson_html = [];
    job.order_job_penalties.forEach((discount, index) => {
      discount_reson_html.push(
        <>
          <Row>
            <Colxx md="2">{index + 1}</Colxx>
            <Colxx md="8">{discount.reason_title}</Colxx>
            <Colxx md="2">{discount.discount_value}</Colxx>
          </Row>
        </>
      );
    });

    return discount_reson_html;
  };

  render_order_jobs = () => {
    let self = this;
    let order_jobs_html = [];
    const { order_jobs } = this.state;
    if (order_jobs.length) {
      order_jobs.forEach((job) => {
        order_jobs_html.push(
          <Card className="mb-3 mt-2" key={job.id}>
            <CardBody style={{ padding: "0px" }}>
              <Row style={{ margin: "0px" }}>
                {self.render_job_technician_details(job)}
                <Colxx xxs="9">
                  <Row>
                    {self.render_job_timings(job)}

                    {/* Render Single Job Services */}
                    <Colxx xxs="9" className="pl-0 pr-0">
                      <Table striped>
                        <tbody>{self.render_current_job_services(job)}</tbody>
                      </Table>
                    </Colxx>

                    {/*  Calculations - begin */}
                    <Colxx xxs="3" className="pl-0 pr-0">
                      <Table>
                        <tbody>
                          <tr>
                            <td>Actual Amount</td>
                            <td className="text-right">
                              {" "}
                              {parseInt(job.job_actual_amount)}{" "}
                            </td>
                          </tr>
                          {job.job_travel_charges > 0 ? (
                            <tr>
                              <td>Travel Charges</td>
                              <td className="text-right">
                                {" "}
                                {parseInt(job.job_travel_charges)}{" "}
                              </td>
                            </tr>
                          ) : (
                            <></>
                          )}
                          {job.deal_discount > 0 ? (
                            <tr>
                              <td>Deal Dicounts</td>
                              <td className="text-right">
                                {" "}
                                {parseInt(job.deal_discount)}{" "}
                              </td>
                            </tr>
                          ) : (
                            <></>
                          )}
                          {job.coupon_discount > 0 ? (
                            <tr>
                              <td>Coupon Dicounts</td>
                              <td className="text-right">
                                {" "}
                                {parseInt(job.coupon_discount)}{" "}
                              </td>
                            </tr>
                          ) : (
                            <></>
                          )}
                          {job.free_service_redeemed_discount > 0 ? (
                            <tr>
                              <td>Free Service Dicounts</td>
                              <td className="text-right">
                                {" "}
                                {parseInt(
                                  job.free_service_redeemed_discount
                                )}{" "}
                              </td>
                            </tr>
                          ) : (
                            <></>
                          )}
                          {job.job_discount > 0 ? (
                            <tr>
                              <td>
                                Discount
                                {/* {job.order_job_discounts.length > 0 ? (
                                  <Popover
                                    placement="bottom"
                                    title="Discount Reasons"
                                    width="500"
                                    trigger="click"
                                    content={self.set_discount(job)}
                                  >
                                    <Button className="btn-sm">D</Button>
                                  </Popover>
                                ) : (
                                  <></>
                                )}
                                {job.order_job_penalties.length > 0 ? (
                                  <Popover
                                    placement="bottom"
                                    title="Penalty Reasons"
                                    width="500"
                                    trigger="click"
                                    content={self.set_penalty(job)}
                                  >
                                    <Button className="btn-sm">P</Button>
                                  </Popover>
                                ) : (
                                  <></>
                                )} */}
                              </td>
                              <td className="text-right">
                                {" "}
                                {parseInt(job.job_discount)}{" "}
                              </td>
                            </tr>
                          ) : (
                            <></>
                          )}
                          {job.waiting_charges > 0 ? (
                            <tr>
                              <td>Waiting Charges</td>
                              <td className="text-right">
                                {" "}
                                {parseInt(job.waiting_charges)}{" "}
                              </td>
                            </tr>
                          ) : (
                            <></>
                          )}
                          <tr>
                            <td>Total</td>
                            <td className="text-right">
                              {parseInt(job.job_amount)}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Colxx>
                    {/* Calculations - ended */}
                  </Row>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        );
      });
    }

    return order_jobs_html;
  };

  render_inactive_jobs = () => {
    let self = this;
    let order_jobs_html = [];
    const { inactive_jobs } = this.state;

    inactive_jobs.forEach((job) => {
      order_jobs_html.push(
        <Card className="mb-3 mt-2" key={job.id}>
          <CardBody style={{ padding: "0px" }}>
            <Row style={{ margin: "0px" }}>
              <Colxx xxs="3" className="bg-secondary text-white p-3">
                <strong
                  className="d-block bg-light text-dark text-center rounded pt-1 mb-3"
                  style={{ paddingBottom: "2px" }}
                >
                  {job.job_code}
                </strong>
                <div className="client-image d-block text-center">
                  {job.technician.profile_photo_url?.length > 0 ? (
                    <img
                      src={job.technician.profile_photo_url}
                      className="user-img"
                      alt="Technician"
                    />
                  ) : (
                    <img
                      alt="Technician"
                      src="/assets/img/profile-pic-l.jpg"
                      className="user-img"
                    />
                  )}
                </div>
                <span className="d-block text-center">
                  {job.technician.first_name} {job.technician.last_name}
                </span>
                <strong className="d-block text-center">
                  ({job.technician.membership_code})
                </strong>
                <strong className="d-block text-center">
                  ({job.technician.phone})
                </strong>
              </Colxx>
              <Colxx xxs="9">
                <Row>
                  <Colxx xxs="12" className="bg-dark text-white p-2">
                    <div className="d-inline-block mr-1">
                      <div className="glyph-icon iconsminds-24-hour">
                        <strong> Start Time: </strong>
                        <span> {job.start_time} </span>
                      </div>
                    </div>

                    <div className="d-inline-block">
                      <div className="glyph-icon iconsminds-sand-watch-2">
                        <strong> Expected Duration: </strong>
                        <span> {job.job_duration} </span>
                      </div>
                    </div>

                    <div
                      className="btn-group float-right"
                      role="group"
                      aria-label="Basic example"
                    >
                      <Button color="danger" size="sm">
                        {" "}
                        {job.job_status}{" "}
                      </Button>
                    </div>
                  </Colxx>

                  {/* Render Single Job Services */}
                  <Colxx xxs="9" className="pl-0 pr-0">
                    <Table striped>
                      <tbody>{self.render_current_job_services(job)}</tbody>
                    </Table>
                  </Colxx>

                  {/*  Calculations - begin */}
                  <Colxx xxs="3" className="pl-0 pr-0">
                    <Table>
                      <tbody>
                        <tr>
                          <td>Actual Amount</td>
                          <td className="text-right">
                            {" "}
                            {parseInt(job.job_actual_amount)}{" "}
                          </td>
                        </tr>
                        {job.job_travel_charges > 0 ? (
                          <tr>
                            <td>Travel Charges</td>
                            <td className="text-right">
                              {" "}
                              {parseInt(job.job_travel_charges)}{" "}
                            </td>
                          </tr>
                        ) : (
                          <></>
                        )}
                        {job.deal_discount > 0 ? (
                          <tr>
                            <td>Deal Dicounts</td>
                            <td className="text-right">
                              {" "}
                              {parseInt(job.deal_discount)}{" "}
                            </td>
                          </tr>
                        ) : (
                          <></>
                        )}
                        {job.job_discount > 0 ? (
                          <tr>
                            <td>
                              Discount
                              {job.order_job_discounts.length > 0 ? (
                                <Popover
                                  placement="bottom"
                                  title="Discount Reasons"
                                  width="500"
                                  trigger="click"
                                  content={self.set_discount(job)}
                                >
                                  <Button className="btn-sm">D</Button>
                                </Popover>
                              ) : (
                                <></>
                              )}
                              {job.order_job_penalties.length > 0 ? (
                                <Popover
                                  placement="bottom"
                                  title="Penalty Reasons"
                                  width="500"
                                  trigger="click"
                                  content={self.set_penalty(job)}
                                >
                                  <Button className="btn-sm">P</Button>
                                </Popover>
                              ) : (
                                <></>
                              )}
                            </td>
                            <td className="text-right">
                              {" "}
                              {parseInt(job.job_discount)}{" "}
                            </td>
                          </tr>
                        ) : (
                          <></>
                        )}
                        {job.waiting_charges > 0 ? (
                          <tr>
                            <td>Waiting Charges</td>
                            <td className="text-right">
                              {" "}
                              {parseInt(job.waiting_charges)}{" "}
                            </td>
                          </tr>
                        ) : (
                          <></>
                        )}
                        <tr>
                          <td>Total</td>
                          <td className="text-right">
                            {parseInt(job.job_amount)}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Colxx>
                  {/* Calculations - ended */}
                </Row>
              </Colxx>
            </Row>
          </CardBody>
        </Card>
      );
    });

    return order_jobs_html;
  };

  render_discounts = () => {
    let self = this;
    let order_discounts_list_html = [];
    const { order_discounts_list, order_data, order_billing } = this.state;
    order_discounts_list_html.push(
      <Table>
        <thead>
          <tr>
            <th>Level</th>
            <th>Discount</th>
            <th>Discount Type</th>
            <th>Discounted Amount</th>
            <th>Reason</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {order_discounts_list.map((order_discount) => {
            return (
              <>
                <tr>
                  <td>
                    {order_discount.order_job_id ? (
                      <>{"Job"}</>
                    ) : (
                      <>{"Order"}</>
                    )}
                  </td>
                  <td>
                    {order_discount.other_percentage_type === "percentage"
                      ? order_discount.other_percentage + "%"
                      : order_discount.other_percentage}
                  </td>
                  <td>{order_discount.discount_type}</td>
                  <td>{parseInt(order_discount.discount_value)}</td>
                  <td>{order_discount.reason_title}</td>
                  <td>
                    <Button
                      color="danger"
                      style={{ padding: "0 8px" }}
                      onClick={async (event) =>
                        this.delete_order_discount(
                          event,
                          order_discount.id,
                          order_discount.order_id
                        )
                      }
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              </>
            );
          })}
          {order_billing.coupon_discount > 0 && (
            <tr>
              <td>Order</td>
              <td>
                {order_data.coupon_details.discount_type === "percentage" ? (
                  <>
                    {order_data.coupon_details.discount} {"%"}
                  </>
                ) : (
                  <>{order_data.coupon_details.discount}</>
                )}
              </td>
              <td>Coupon</td>
              <td>{order_billing.coupon_discount}</td>
              <td></td>
              <td></td>
            </tr>
          )}
          {order_billing.deal_discount > 0 && (
            <tr>
              <td>Order</td>
              <td>{order_billing.deal_discount}</td>
              <td>Deal</td>
              <td>{order_billing.deal_discount}</td>
              <td></td>
              <td></td>
            </tr>
          )}
        </tbody>
      </Table>
    );
    return order_discounts_list_html;
  };

  enable_edit = () => {
    this.setState({
      is_update_csr_comment: true,
    });
  };

  render_sidebar = () => {
    const { order_data, order_billing, csr_comment, is_update_csr_comment } =
      this.state;
    let self = this;
    let sidebar_html = [];
    // if (order_jobs !== undefined && order_jobs.length) {
    sidebar_html = (
      <>
        {/* Sidebar - begin */}
        <Colxx xxs="4">
          <Card className="mb-3">
            <CardBody>
              <h3 className="mb-3">Requested Services</h3>
              <ul>
                {/* {order_jobs.map((single_job) => {
                    return(
                      <> */}
                {order_data.order_services !== undefined &&
                order_data.order_services.length ? (
                  <>
                    {order_data.order_services.map((service, index) => {
                      return (
                        <>
                          <li>
                            <span>
                              {" "}
                              {service.service_title} ({service.unit_count}){" "}
                            </span>
                            <ul>
                              {service.order_service_addons.map(
                                (addon, index) => {
                                  return (
                                    <li>
                                      <span>
                                        {" "}
                                        {addon.service_addon_title} (
                                        {addon.unit_count}){" "}
                                      </span>
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                          </li>
                        </>
                      );
                    })}
                  </>
                ) : (
                  <></>
                )}
                {/* </> */}
                {/* )
                  })} */}
              </ul>
            </CardBody>
          </Card>

          {/* Order Calculation Component */}
          <OrderCalculation calculation={order_billing} />

          <Card className="mt-3">
            <CardBody>
              <h3 className="mb-3">Special Instructions</h3>
              <p>{order_data.special_notes}</p>
            </CardBody>
          </Card>
          <Card className="mt-3">
            <CardBody>
              <h3 className="mb-3">CSR Comment</h3>

              {csr_comment !== null &&
              csr_comment !== undefined &&
              csr_comment !== "" &&
              !is_update_csr_comment ? (
                <>
                  <Row>
                    <Colxx md="9">
                      <p>{csr_comment}</p>
                    </Colxx>
                    <Colxx md="3">
                      <Button
                        color="secondary"
                        className="text-right"
                        size="sm"
                        onClick={() => {
                          self.enable_edit();
                        }}
                      >
                        Edit
                      </Button>
                    </Colxx>
                  </Row>
                </>
              ) : is_update_csr_comment ? (
                <>
                  <form onSubmit={this.add_csr_comment}>
                    <Row>
                      <Colxx md="9">
                        <Input
                          type="textarea"
                          name="order[csr_comment]"
                          defaultValue={csr_comment}
                        />
                        <Input
                          type="text"
                          name="order[id]"
                          hidden
                          value={order_data.id}
                        />
                      </Colxx>
                      <Colxx md="3">
                        <Button
                          color="secondary"
                          className="text-right mt-2"
                          size="sm"
                          type="submit"
                        >
                          Save
                        </Button>
                      </Colxx>
                    </Row>
                  </form>
                </>
              ) : (
                <>
                  <form onSubmit={this.add_csr_comment}>
                    <Row>
                      <Colxx md="9">
                        <Input type="textarea" name="order[csr_comment]" />
                        <Input
                          type="text"
                          name="order[id]"
                          hidden
                          value={order_data.id}
                        />
                      </Colxx>
                      <Colxx md="3">
                        <Button
                          color="secondary"
                          className="text-right mt-2"
                          size="sm"
                          type="submit"
                        >
                          Save
                        </Button>
                      </Colxx>
                    </Row>
                  </form>
                </>
              )}
            </CardBody>
          </Card>
          <Card className="mt-3">
            <CardBody>
              <h3 className="mb-3">
                Messages (
                <span id="comments_count">
                  {order_data.order_message !== undefined
                    ? order_data.order_message.messages_count
                    : 0}
                </span>
                )
              </h3>
              <p>
                <b id="last_message_sent_by">
                  {order_data.order_message !== undefined
                    ? order_data.order_message.sent_by
                    : ""}{" "}
                </b>{" "}
                <span id="last_message_content">
                  {order_data.order_message !== undefined
                    ? ": " + order_data.order_message.message
                    : ""}
                </span>
                <br />
                <span style={{ "margin-left": "10%" }} id="last_message_time">
                  {order_data.order_message !== undefined
                    ? order_data.order_message.created_at
                    : ""}
                </span>
              </p>
              {order_data.order_message !== undefined &&
              order_data.order_message.messages_count > 0 ? (
                <>
                  <Button
                    color="secondary"
                    className="text-right"
                    onClick={this.toggle_comments_modal}
                  >
                    {" "}
                    View All{" "}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    id="comments_btn"
                    color="secondary"
                    className="text-right"
                    onClick={this.toggle_comments_modal}
                  >
                    {" "}
                    Send Message{" "}
                  </Button>
                </>
              )}
            </CardBody>
          </Card>
        </Colxx>
        {/* Sidebar - ended */}
      </>
    );
    // }

    return sidebar_html;
  };

  update_order_status = async (event, status) => {
    const { match } = this.props;
    const { cancel_reason, cancellation_charges } = this.state;
    let success = false;
    let reason = "";
    if (cancel_reason.length === undefined) {
      reason = "Unavailabilty of beautician";
    } else {
      reason = cancel_reason;
    }
    let request_body = {
      order_status: status,
    };

    if (cancellation_charges) {
      request_body.is_cancellation_charges = true;
    }

    if (status === "Cancelled") {
      request_body.cancel_reason = reason;
    }

    await trackPromise(
      axios({
        method: "put",
        url: servicePath + "/api/v2/orders/" + match.params.id + ".json",
        data: request_body,
        headers: {
          "Content-Type": "application/json",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          success = true;
          NotificationManager.success(
            "Order Updated Successfully",
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
          () => {},
          null,
          "filled"
        );
        console.log("error", error);
      });

    if (success === true) {
      let order_data = await this.fetch_order();
      let order_billing = order_data.order_billing;
      if (status === "Cancelled") {
        this.setState({
          order_data: order_data,
          order_billing: order_billing,
          order_jobs: order_data.order_jobs,
          cancel_reason: {},
          show_order_cancel_confirm_modal: false,
        });
      } else {
        this.setState({
          order_data: order_data,
          order_billing: order_billing,
          order_jobs: order_data.order_jobs,
        });
      }
    }
  };

  render_error_bar = () => {
    const { is_client_verified, order_data } = this.state;
    let self = this;

    if (is_client_verified === false) {
      return (
        <>
          <Alert color="danger" className="rounded" isOpen={true}>
            <>
              We cannot proceed further due to client's unverified status
              <Button
                color="link"
                onClick={() => this.toggleAccordion(0)}
                aria-expanded={this.state.accordion[0]}
              >
                Click here for Details
              </Button>
            </>
          </Alert>
          <div className="border">
            <Collapse isOpen={this.state.accordion[0]}>
              <div className="p-4">
                <Table>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>City</th>
                    <th>CNIC</th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th>Actions</th>
                  </tr>
                  <tr>
                    <td>
                      {order_data.client.first_name}{" "}
                      {order_data.client.last_name}
                    </td>
                    <td>
                      <Badge>{order_data.client.approved_status}</Badge>
                    </td>
                    <td>{order_data.address.city.city_name}</td>
                    <td>{order_data.client.cnic}</td>
                    <td>{order_data.client.phone}</td>
                    <td>{order_data.client.gender}</td>
                    <td>
                      <Button
                        type="warning"
                        style={{ cursor: "pointer" }}
                        size="sm"
                        color="success"
                        onClick={(event) => self.approveClient(event)}
                        // onClick={this.toggle_show_order_cancel_confirm_modal}
                      >
                        Verify
                      </Button>
                      <Link
                        to={`/app/clients/edit/${order_data.client.id}`}
                        target="_blank"
                      >
                        <Button
                          type="warning"
                          className="ml-2"
                          style={{ cursor: "pointer" }}
                          size="sm"
                          color="danger"
                          // onClick={this.toggle_show_order_cancel_confirm_modal}
                        >
                          Edit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                </Table>
              </div>
            </Collapse>
          </div>
        </>
      );
    }
  };

  render_no_technicians_availability_bar = () => {
    const { is_client_verified, empty_suggestions } = this.state;

    if (is_client_verified === true) {
      // Client must be verified to show that error
      if (empty_suggestions === true) {
        return (
          <Alert color="warning" className="rounded" isOpen={true}>
            Currently no technician is available for that time slot
          </Alert>
        );
      }
    }
  };

  toggle_show_order_cancel_confirm_modal = async () => {
    let result = await check_permission("orders/update", "");
    if (result) {
      this.setState({
        show_order_cancel_confirm_modal:
          !this.state.show_order_cancel_confirm_modal,
      });
    }
  };

  fetch_cancel_reasons = async () => {
    let cancel_reasons_temp = [];

    await axios
      .get(servicePath + "/api/v2/cancel_reasons.json", {
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          cancel_reasons_temp = response.data.cancel_reasons;
        } else {
          console.log(response);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });

    return cancel_reasons_temp;
  };

  set_cancellation_reason = (reason) => {
    this.setState({
      cancel_reason: reason,
    });
  };

  render_order_cancel_confirm = () => {
    const { show_order_cancel_confirm_modal, cancel_reasons } = this.state;

    let order_cancel_confirm_modal_html = (
      <>
        <Modal
          isOpen={show_order_cancel_confirm_modal}
          size="lg"
          toggle={this.toggle_show_order_cancel_confirm_modal}
        >
          <ModalHeader toggle={this.toggle_show_order_cancel_confirm_modal}>
            Are you sure you want to cancel order ? Please also select reason{" "}
            <br />
          </ModalHeader>

          <ModalBody>
            <Row>
              <Colxx md="5">
                <Select
                  className="react-select mb-4"
                  classNamePrefix="react-select"
                  onChange={(reason) =>
                    this.set_cancellation_reason(reason.value)
                  }
                  options={cancel_reasons}
                  defaultValue={cancel_reasons[0]}
                />
              </Colxx>
              <Colxx md="5">
                <CustomInput
                  className="mt-2"
                  label="Cancellation Charges"
                  type="checkbox"
                  // checked={single_service.is_added}
                  onChange={(event) =>
                    this.handleCheckChangeCancellation(event)
                  }
                />
              </Colxx>
            </Row>

            <Button
              size="sm"
              style={{ cursor: "pointer" }}
              onClick={async (event) =>
                this.update_order_status(event, "Cancelled")
              }
              data-status="true"
              className="btn-success mr-2"
            >
              Yes
            </Button>
            <Button
              size="sm"
              style={{ cursor: "pointer" }}
              onClick={this.toggle_show_order_cancel_confirm_modal}
              className="btn-success"
            >
              No
            </Button>
          </ModalBody>
        </Modal>
      </>
    );

    return order_cancel_confirm_modal_html;
  };

  handleCheckChangeCancellation = (event) => {
    if (event.target.checked) {
      this.setState({
        cancellation_charges: true,
      });
    } else {
      this.setState({
        cancellation_charges: false,
      });
    }
  };

  is_jobs_suggested_or_assigned = () => {
    const { order_jobs } = this.state;
    let show_confirm_btn = true;
    if (order_jobs.length) {
      order_jobs.forEach((single_job, index) => {
        if (
          single_job.job_status === "Suggestion" ||
          single_job.job_status === "Assignment"
        ) {
          show_confirm_btn = false;
        }
      });
    }
    return show_confirm_btn;
  };

  is_jobs_completed = () => {
    const { order_data } = this.state;
    let show_complete_btn = true;

    order_data.order_jobs.forEach((single_job, index) => {
      if (
        single_job.job_status === "Suggestion" ||
        single_job.job_status === "Assignment" ||
        single_job.job_status === "Confirmed"
      ) {
        show_complete_btn = false;
      }
    });
    return show_complete_btn;
  };

  render_order_actions = () => {
    const { order_data } = this.state;
    let order_actions = [];

    if (order_data.status === "Pending" || order_data.status === "In_process") {
      if (this.is_jobs_suggested_or_assigned()) {
        order_actions.push(
          <>
            <Button
              type="warning"
              style={{ cursor: "pointer" }}
              className="mb-2 mt-2 mr-2"
              onClick={async (event) =>
                this.update_order_status(event, "Confirmed")
              }
            >
              Confirm
            </Button>
          </>
        );
      }
      order_actions.push(
        <Button
          type="warning"
          style={{ cursor: "pointer" }}
          color="danger"
          className="mb-2 mt-2"
          onClick={this.toggle_show_order_cancel_confirm_modal}
        >
          Cancel
        </Button>
      );
    } else if (order_data.status === "Confirmed") {
      if (this.is_jobs_completed()) {
        order_actions.push(
          <Button
            type="warning"
            style={{ cursor: "pointer" }}
            color="danger"
            className="mb-2 mt-2 mr-2"
            onClick={async (event) =>
              this.update_order_status(event, "Completed")
            }
          >
            Complete
          </Button>
        );
      }
      order_actions.push(
        <>
          <Button
            type="warning"
            style={{ cursor: "pointer" }}
            color="danger"
            className="mb-2 mt-2"
            onClick={this.toggle_show_order_cancel_confirm_modal}
          >
            Cancel
          </Button>
        </>
      );
    } else if (order_data.status === "Completed") {
      order_actions.push(
        <>
          <Button
            type="warning"
            style={{ cursor: "pointer" }}
            color="danger"
            className="mb-2 mt-2"
            onClick={this.toggle_show_order_cancel_confirm_modal}
          >
            Cancel
          </Button>
        </>
      );
    } else if (order_data.status === "Cancelled") {
      // Render no action buttons
    }

    return order_actions;
  };

  changePage = async () => {
    const { order_data } = this.state;
    window.location.assign(`/app/orders/show/${order_data.reschedule_to}`);
  };

  setSuperEdit = (event) => {
    this.setState({
      is_super_edit: true,
    });
  };

  render_tags_modal = () => {
    const { current_tag, order_tags, order_data } = this.state;
    let addons_modal_html = (
      <>
        <Modal
          size="md"
          isOpen={this.state.toggle_tags_modal}
          toggle={this.toggle_close_tag_modal}
        >
          <ModalHeader toggle={this.toggle_close_tag_modal}>Tags</ModalHeader>
          <ModalBody>
            {order_tags.map((single_tag) => {
              return (
                <tr>
                  {current_tag.tag_name !== undefined &&
                  current_tag.tag_name === single_tag.tag_name &&
                  document.getElementById(`${order_data.id}`) !== null &&
                  document.getElementById(`${order_data.id}`).innerHTML !==
                    "" ? (
                    <>
                      <input
                        type="radio"
                        name="tag"
                        id={single_tag.id}
                        checked={true}
                        onClick={(event) =>
                          this.handleTagChange(
                            event,
                            single_tag.tag_name,
                            single_tag.id
                          )
                        }
                      />
                      <label className="pl-2" for={single_tag.id}>
                        {single_tag.tag_name}
                      </label>
                    </>
                  ) : (
                    <>
                      <input
                        type="radio"
                        name="tag"
                        id={single_tag.id}
                        onClick={(event) =>
                          this.handleTagChange(
                            event,
                            single_tag.tag_name,
                            single_tag.id
                          )
                        }
                      />
                      <label className="pl-2" for={single_tag.id}>
                        {single_tag.tag_name}
                      </label>
                    </>
                  )}
                </tr>
              );
            })}
          </ModalBody>
          <ModalFooter>
            {/* <Button color="primary" onClick={this.toggle_t_modal}>
              Submit
            </Button> */}
            <Button color="secondary" onClick={this.toggle_close_tag_modal}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );

    return addons_modal_html;
  };

  render_order_page = () => {
    const {
      order_data,
      is_client_verified,
      empty_suggestions,
      order_billing,
      is_public_to_technician,
      order_discounts_list,
      is_super_edit,
    } = this.state;
    let self = this;
    if (is_client_verified === false || empty_suggestions === true) {
      return (
        <>
          {this.render_error_bar()}
          {this.render_no_technicians_availability_bar()}

          <div id="orderNumber" class="order-id align-middle">
            <h1>Order #{order_data.id}</h1>
            <span class="badge badge-pill badge-sm badge-secondary align-middle">
              {order_data.status}
            </span>
            {order_data.status === "Pending" ||
            order_data.status === "Confirmed" ||
            order_data.status === "In_process" ||
            is_super_edit ? (
              <Button
                color="primary"
                className="mb-2 mt-2 ml-2"
                size="sm"
                style={{ height: "22px", paddingTop: "1px" }}
                onClick={this.toggle_tags_modal}
              >
                Tags
              </Button>
            ) : (
              <></>
            )}
            {order_data.status === "Pending" ||
            order_data.status === "Confirmed" ? (
              <>
                <Link
                  // to={`/app/orders/edit_order/${order_data.id}`}
                  onClick={() =>
                    check_permission(
                      "orders/update",
                      `/app/orders/edit_order/${order_data.id}`
                    )
                  }
                >
                  <Button className="btn-success mr-2 ml-2 user-show-btns">
                    {" "}
                    Edit Order{" "}
                  </Button>
                </Link>
              </>
            ) : (
              <></>
            )}
          </div>

          <Row>
            <Colxx xxs="8">
              <OrderHeader removeTag={this.removeTag} order_meta={order_data} />
              {order_data.status !== "Cancelled" ? (
                <>
                  <Button
                    type="warning"
                    style={{ cursor: "pointer" }}
                    color="danger"
                    className="mb-2 mt-2"
                    onClick={this.toggle_show_order_cancel_confirm_modal}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <></>
              )}
            </Colxx>
            {this.render_sidebar()}
            {this.render_order_cancel_confirm()}
            {this.render_tags_modal()}
          </Row>
        </>
      );
    } else {
      return (
        <>
          <div id="orderNumber" className="order-id align-middle">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <h1 style={{ paddingBottom: "0px" }}>Order #{order_data.id}</h1>
                <br />
                <span className="badge badge-pill badge-sm badge-secondary align-middle">
                  {order_data.status}
                </span>
                {order_data.status === "Pending" ||
                order_data.status === "Confirmed" ||
                order_data.status === "In_process" ||
                is_super_edit ? (
                  <Button
                    color="primary"
                    className="mb-2 mt-2 ml-2"
                    size="sm"
                    style={{ height: "22px", paddingTop: "1px" }}
                    onClick={this.toggle_tags_modal}
                  >
                    Tags
                  </Button>
                ) : (
                  <></>
                )}
              </div>
              <div>
                {order_data.status === "Rescheduled" ? (
                  <>
                    {/* <Link to={`/app/orders/show/${order_data.reschedule_to}`}> */}
                    <Button
                      className="btn-success mr-2 ml-2"
                      onClick={self.changePage}
                    >
                      {" "}
                      Next Order{" "}
                    </Button>
                    {/* </Link> */}
                  </>
                ) : (
                  <></>
                )}
                {localStorage.getItem("user_default_role") === "Super Admin" ? (
                  <>
                    <Button
                      className="btn-success mr-2 ml-2 user-show-btns"
                      onClick={(event) => this.setSuperEdit(event)}
                    >
                      Super Edit
                    </Button>
                  </>
                ) : (
                  <></>
                )}
                {!order_data.is_public_to_technician &&
                !is_public_to_technician &&
                order_data.status !== "Completed" ? (
                  <>
                    <Button
                      className="btn-success mr-2 ml-2 user-show-btns"
                      onClick={() => this.make_public(order_data.id)}
                    >
                      {" "}
                      Public to Technician{" "}
                    </Button>
                  </>
                ) : (
                  <></>
                )}
                {order_data.status === "Pending" ||
                order_data.status === "Confirmed" ||
                order_data.status === "In_process" ? (
                  <>
                    <Link
                      // to={`/app/orders/edit_order/${order_data.id}`}
                      onClick={() =>
                        check_permission(
                          "orders/update",
                          `/app/orders/edit_order/${order_data.id}`
                        )
                      }
                    >
                      <Button className="btn-success mr-2 ml-2 user-show-btns">
                        {" "}
                        Edit Order{" "}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>

          <Row>
            <Colxx xxs="8">
              <OrderHeader removeTag={this.removeTag} order_meta={order_data} />
              {order_data.status === "Pending" ||
              order_data.status === "Confirmed" ||
              order_data.status === "In_process" ||
              is_super_edit ? (
                <Button
                  type="warning"
                  className="mb-2 mt-2"
                  size="sm"
                  onClick={this.toggle_new_job_modal}
                >
                  Add Job
                </Button>
              ) : (
                <></>
              )}
              {order_data.status === "Pending" ||
              order_data.status === "Confirmed" ||
              order_data.status === "In_process" ||
              is_super_edit ? (
                <Button
                  type="warning"
                  className="mb-2 mt-2 ml-2"
                  size="sm"
                  onClick={this.toggle_add_penalty_order}
                >
                  Add Discount
                </Button>
              ) : (
                <></>
              )}
              {/* {order_data.status === "Pending" ||
              order_data.status === "Confirmed" ||
              order_data.status === "In_process" ||
              is_super_edit ? (
                <Button
                  type="success"
                  className="mb-2 mt-2 ml-2"
                  size="sm"
                  onClick={this.toggle_tags_modal}
                >
                  Tags
                </Button>
              ) : (
                <></>
              )} */}
              {order_data.status === "Pending" ||
              order_data.status === "Confirmed" ||
              order_data.status === "In_process" ||
              is_super_edit ? (
                <Button
                  type="warning"
                  size="sm"
                  className="mb-2 mt-2 ml-2"
                  onClick={this.toggle_change_travel_charges}
                >
                  Change Travel Charges
                </Button>
              ) : (
                <></>
              )}
              {(order_data.status === "Completed" ||
                order_data.status === "Cancelled") &&
              is_super_edit ? (
                <>
                  <Button
                    type="warning"
                    className="mb-2 mt-2 ml-2"
                    size="sm"
                    onClick={this.toggle_new_coupon_modal}
                  >
                    Add Coupon
                  </Button>
                </>
              ) : (
                <></>
              )}
              {order_billing.coupon_discount !== undefined ? (
                <>
                  {order_billing.deal_discount === 0 &&
                  order_billing.coupon_discount === 0 ? (
                    <>
                      {order_billing.free_service_redeemed_discount > 0 ||
                      order_data.status === "Completed" ||
                      order_data.status === "Cancelled" ||
                      is_super_edit ? (
                        <></>
                      ) : (
                        <>
                          <Button
                            type="warning"
                            className="mb-2 mt-2 ml-2"
                            size="sm"
                            onClick={this.toggle_new_coupon_modal}
                          >
                            Add Coupon
                          </Button>
                        </>
                      )}
                    </>
                  ) : order_billing.coupon_discount > 0 ? (
                    <>
                      {/* <Popover
                        placement="bottom"
                        title="Coupon Details"
                        width="500"
                        trigger="click"
                        content={self.set_coupon_details(
                          order_data.coupon_details
                        )}
                      >
                        <Button className="ml-2">Coupon Details</Button>
                      </Popover> */}
                    </>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <></>
              )}
              {this.render_add_coupon()}
              {this.render_new_job_modal()}
              {this.render_edit_job_modal()}
              {this.render_add_penalty()}
              {this.render_add_penalty_order()}
              {this.render_change_order_job_status_modal()}
              {this.render_change_order_job_technician_modal()}
              {this.render_change_travel_charges()}
              {this.render_tags_modal()}
              <Tabs
                activeName="Active Jobs"
                // onTabClick={(tab) => {
                //   this.get_order_by_status(tab, tab.props.name);
                // }}
              >
                <Tabs.Pane label={"Active Jobs"} name="Active Jobs">
                  {this.render_order_jobs()}
                </Tabs.Pane>
                <Tabs.Pane label={"Inactive Jobs"} name="Inactive Jobs">
                  {this.render_inactive_jobs()}
                </Tabs.Pane>
                {(order_discounts_list !== undefined &&
                  order_discounts_list.length) ||
                (order_billing.coupon_discount !== undefined &&
                  order_billing.coupon_discount > 0) ||
                (order_billing.deal_discount !== undefined &&
                  order_billing.deal_discount > 0) ? (
                  <Tabs.Pane label={"Discounts"} name="Discounts">
                    {this.render_discounts()}
                  </Tabs.Pane>
                ) : (
                  <></>
                )}
                {/* <Tabs.Pane label={"Discounts"} name="Discounts">
                  {this.render_discounts()}
                </Tabs.Pane> */}
              </Tabs>

              {this.render_addons_modal()}
              {this.render_order_actions()}
              {this.render_job_edit_warning_html()}
              {this.render_order_cancel_confirm()}
            </Colxx>
            {this.render_sidebar()}
          </Row>
        </>
      );
    }
  };

  render_change_technician_button = (job) => {
    let inner_html = (
      <>
        <strong
          className="d-block bg-light text-dark text-center rounded pt-1 mt-2"
          style={{ paddingBottom: "2px", cursor: "pointer" }}
          data-job-id={job.id}
          onClick={async (event) =>
            this.toggle_job_technician_change_modal(event)
          }
        >
          Change Technician
        </strong>
      </>
    );

    return inner_html;
  };

  render_change_job_status_button = (job) => {
    let inner_html = (
      <>
        <strong
          className="d-block bg-light text-dark text-center rounded pt-1 mt-2"
          style={{ paddingBottom: "2px", cursor: "pointer" }}
          data-job-id={job.id}
          onClick={async (event) => this.toggle_job_status_change_modal(event)}
        >
          {job.job_status}
        </strong>
      </>
    );

    return inner_html;
  };

  render() {
    const { order_data } = this.state;

    if (Object.keys(order_data).length === 0) {
      return <></>;
    } else {
      return (
        <>
          {this.render_order_page()}
          {this.render_comments_modal()}
        </>
      );
    }
  }
}
