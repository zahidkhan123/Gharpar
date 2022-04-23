import React, { Component } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Label,
  Badge,
  CustomInput,
} from "reactstrap";
import Select from "react-select";
import { Colxx } from "../../../components/common/CustomBootstrap";
import ReactStars from "react-rating-stars-component";
import CustomSelectInput from "../../../components/common/CustomSelectInput";
import "./complaint.css";
import { Input } from "element-react";

class EditRatingOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      follow_up: this.props.follow_up,
      sub_categories_dropdown: [],
      discount: 0,
      penalty: 0,
      tat: "",
      is_submit: false,
      complaint_level: "",
      default_category: [],
      default_sub_category: [],
      default_status: [],
      default_follow_up: [],
      default_csr_comment: "",
      rating: props.jobComplaint.job_rating,
      default_escalate: false,
      follow_up: [
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
      ],
      complaint_status: [
        {
          label: "Pending",
          value: "pending",
          key: 1,
        },
        {
          label: "In Process",
          value: "in_process",
          key: 2,
        },
        {
          label: "Message Sent",
          value: "message_sent",
          key: 3,
        },
        {
          label: "Closed",
          value: "closed",
          key: 3,
        },
        {
          label: "Resolved",
          value: "resolved",
          key: 3,
        },
      ],
    };
  }

  render_follow_up = (follow_ups) => {
    let follow_ups_html = [];

    follow_ups.map((follow_up, index) => {
      follow_ups_html.push(
        <tbody>
          <tr>
            <td>{index + 1}</td>
            <td>{follow_up.follow_up_reason}</td>
          </tr>
        </tbody>
      );
      return follow_up;
    });
    return follow_ups_html;
  };

  sub_categories_dropdown = (current_category) => {
    let sub_categories = [];
    current_category[0].complaint_category_reasons.forEach((single_reason) => {
      sub_categories.push({
        label: single_reason.title,
        value: single_reason.id,
        discount: single_reason.discount,
        penalty: single_reason.penalty,
        tat: single_reason.tat,
        complaint_level: single_reason.complaint_level,
        remarks: single_reason.remarks,
      });
    });
    return sub_categories;
  };

  set_sub_category = (complaint_category) => {
    const { complaintCategories } = this.props;

    let current_category = complaintCategories.filter(
      (category) => category.id === complaint_category.value
    );
    let sub_categories_dropdown =
      this.sub_categories_dropdown(current_category);

    this.setState({
      sub_categories_dropdown: sub_categories_dropdown,
    });
  };

  set_sub_category_data = (sub_category) => {
    this.setState({
      discount: sub_category.discount,
      penalty: sub_category.penalty,
      tat: sub_category.tat,
      complaint_level: sub_category.complaint_level,
    });
  };

  set_ratings = (job) => {
    const { rating_value } = this.props;
    let job_rating = null;
    let ratings_input_html = <></>;

    rating_value.forEach((single_rating) => {
      if (single_rating.job === job.id) {
        job_rating = single_rating.newRating;
      }
    });

    ratings_input_html = (
      <>
        <input
          type="hidden"
          name="order[order_jobs_attributes][][job_rating]"
          value={job_rating}
        />
      </>
    );

    return ratings_input_html;
  };
  render_job_services = (job) => {
    let services_html = [];
    if (
      job.order_job_services !== undefined &&
      job.order_job_services.length > 0
    ) {
      job.order_job_services.forEach((service) => {
        services_html.push(
          <li>
            {service.service_title} {" ("}
            {service.unit_count}
            {")"}
          </li>
        );
      });
    }
    return services_html;
  };

  change_job_rating = (new_rating) => {
    this.setState({
      rating: new_rating,
    });
  };

  render() {
    let self = this;
    const {
      complaintModalOpen,
      toggleModalComplaint,
      jobComplaint,
      complaintCategoriesData,
      addComplaint,
      orderJobComplaint,
      complaintCategories,
      set_follow_up,
      ratingChanged,
    } = this.props;
    const {
      sub_categories_dropdown,
      discount,
      penalty,
      tat,
      complaint_level,
      follow_up,
      is_submit,
      complaint_status,
      rating,
      default_category,
      default_sub_category,
      default_follow_up,
      default_status,
      default_csr_comment,
      default_escalate,
    } = this.state;

    return (
      <Modal
        isOpen={complaintModalOpen}
        toggle={toggleModalComplaint}
        wrapClassName="modal-right"
        backdrop="static"
        className="custom-width"
      >
        <ModalHeader toggle={toggleModalComplaint}>
          <h2>Submit Complaint (Job- {jobComplaint.job_code})</h2>
        </ModalHeader>{" "}
        <form onSubmit={(event) => addComplaint(event, jobComplaint.id)}>
          <ModalBody>
            <Row>
              <Colxx md="12">
                <Label>Complaint Type</Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  placeholder="Complaint Type"
                  name="order_job_complaint[complaint_category_id]"
                  defaultValue={orderJobComplaint.default_category}
                  onChange={this.set_sub_category}
                  options={complaintCategoriesData}
                  isDisabled
                />
              </Colxx>
              <input
                type="text"
                name="order_job_complaint[order_job_id]"
                value={jobComplaint.id}
                hidden
              />
              <input
                type="text"
                name="id"
                value={orderJobComplaint.id}
                hidden
              />
            </Row>
            <Row className="mt-3">
              <Colxx md="12">
                <Label>Complaint Sub Type</Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  placeholder="Complaint Sub Type"
                  name="order_job_complaint[complaint_category_reason_id]"
                  defaultValue={orderJobComplaint.default_sub_category}
                  onChange={this.set_sub_category_data}
                  options={sub_categories_dropdown}
                  isDisabled
                />
              </Colxx>
            </Row>
            <Row className="mt-3">
              <Colxx md="6" className="text-right">
                <strong>Complain Level - </strong>{" "}
                {orderJobComplaint.complaint_level}
                <input
                  type="text"
                  name="order_job_complaint[complaint_level]"
                  value={orderJobComplaint.complaint_level}
                  hidden
                />
              </Colxx>
              <Colxx md="6" className="text-left">
                <strong>TAT - </strong>
                {orderJobComplaint.tat}
                <input
                  type="text"
                  name="order_job_complaint[tat]"
                  value={orderJobComplaint.tat}
                  hidden
                />
              </Colxx>
            </Row>
            <Row className="mt-3">
              <Colxx md="6">
                <Label>Discount</Label>
                <Input
                  type="number"
                  placeholder="Discount"
                  defaultValue={orderJobComplaint.discount}
                  name="order_job_complaint[discount]"
                  disabled
                />
              </Colxx>
              <Colxx md="6">
                <Label>Penalty</Label>
                <Input
                  type="number"
                  placeholder="Penalty"
                  defaultValue={orderJobComplaint.penalty}
                  name="order_job_complaint[penalty]"
                  disabled
                />
              </Colxx>
            </Row>
            <Row className="mt-3">
              <Colxx md="6">
                <Label>Follow Up</Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  placeholder="Follow Up"
                  defaultValue={orderJobComplaint.default_follow_up}
                  name="order_job_complaint[tm_follow_up]"
                  options={follow_up}
                />
              </Colxx>
              <Colxx md="6">
                <Label>Status</Label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  placeholder="Status"
                  defaultValue={orderJobComplaint.default_status}
                  name="order_job_complaint[status]"
                  options={complaint_status}
                  isDisabled
                />
              </Colxx>
            </Row>
            <Row className="mt-3">
              <Colxx md="12">
                <Label>CSR Comment</Label>
                <Input
                  type="textarea"
                  name="order_job_complaint[csr_comment]"
                  defaultValue={orderJobComplaint.default_csr_comment}
                  disabled
                />
              </Colxx>
            </Row>
            <Row className="mt-3">
              <Colxx md="12">
                <Label>T&M Comment</Label>
                <Input
                  type="textarea"
                  name="order_job_complaint[tm_comment]"
                  defaultValue={orderJobComplaint.default_tm_comment}
                />
              </Colxx>
            </Row>
            <Row className="mt-3">
              <Colxx md="12">
                <Label>Beautician Comment</Label>
                <Input
                  type="textarea"
                  name="order_job_complaint[beautician_comment]"
                  defaultValue={orderJobComplaint.default_beautician_comment}
                />
              </Colxx>
            </Row>
            <Row className="mt-3">
              <Colxx md="6">
                <CustomInput
                  className="mt-2"
                  type="checkbox"
                  label="Esclate to T&M"
                  checked={orderJobComplaint.default_escalate}
                  name="order_job_complaint[escalate_to_tm]"
                  disabled
                />
              </Colxx>
              <Colxx md="6">
                <ReactStars
                  count={5}
                  onChange={(event) => self.change_job_rating(event)}
                  value={jobComplaint.job_rating}
                  size={30}
                  activeColor="#ffd700"
                  name="order_job_complaint[rating]"
                  edit={false}
                />
                <input
                  type="text"
                  name="order_job_complaint[rating]"
                  value={orderJobComplaint.rating}
                  hidden
                />
                {/* {self.set_ratings(job)} */}
              </Colxx>
            </Row>
            <Row className="mt-3">
              <Colxx md="12">
                <Button type="submit"> Submit </Button>
              </Colxx>
            </Row>
          </ModalBody>
        </form>
        <ModalFooter></ModalFooter>
      </Modal>
    );
  }
}

export default EditRatingOrder;
