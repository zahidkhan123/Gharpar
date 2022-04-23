import React, { Component } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Badge,
} from "reactstrap";
import Select from "react-select";
import { Colxx } from "../../../components/common/CustomBootstrap";
import ReactStars from "react-rating-stars-component";
import CustomSelectInput from "../../../components/common/CustomSelectInput";

class EditRatingOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      follow_up: this.props.follow_up,
      follow_up_reasons: [
        {
          label: "Call not attended",
          value: "Call not attended",
          key: 1,
        },
        {
          label: "Number Busy",
          value: "Number Busy",
          key: 2,
        },
        {
          label: "Phone Switched Off",
          value: "Phone Switched Off",
          key: 3,
        },
        {
          label: "Not interested",
          value: "Not interested",
          key: 4,
        },
        {
          label: "Call later",
          value: "Call later",
          key: 5,
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

  render() {
    let self = this;
    const {
      modalOpen,
      toggleModal,
      orderToEdit,
      updateRating,
      addFollowUp,
      follow_up,
      set_follow_up,
      jobRatingChanged,
    } = this.props;
    const { follow_up_reasons } = this.state;
    return (
      <Modal
        isOpen={modalOpen}
        toggle={toggleModal}
        wrapClassName="modal-right"
        backdrop="static"
      >
        <form onSubmit={(event) => addFollowUp(event, orderToEdit.id)}>
          <ModalHeader toggle={toggleModal}>
            <strong>Order#{orderToEdit.id}</strong>
            <div style={{ textAlign: "center" }}>
              <strong>Date:</strong> {" ("} {orderToEdit.order_date} {") "}
              <strong className="ml-4">Phone:</strong>{" "}
              {orderToEdit.client !== undefined ? (
                <>{orderToEdit.client.phone}</>
              ) : (
                <> </>
              )}
            </div>
          </ModalHeader>{" "}
          <input
            type="hidden"
            name="follow_up[parentable_type]"
            value="Order"
          />
          <input
            type="hidden"
            name="follow_up[parentable_id]"
            value={orderToEdit.id}
          />
          {orderToEdit.follow_ups !== undefined &&
          orderToEdit.follow_ups.length > 0 ? (
            <>
              <Row>
                <Colxx md="3"></Colxx>
                <Colxx md="6">
                  <h4>Previous Follow Ups</h4>
                  <table style={{ width: "100%" }}>
                    <th>No.</th>
                    <th>Reason</th>
                    {self.render_follow_up(orderToEdit.follow_ups)}
                  </table>
                </Colxx>
                <Colxx md="3"></Colxx>
              </Row>
              {orderToEdit.follow_ups.length === 1 ? (
                <>
                  <Row>
                    <Colxx md="4"></Colxx>
                    <Colxx md="4">
                      <Button
                        color="primary"
                        className="ml-2"
                        size="sm"
                        onClick={(event) => set_follow_up(event, 2)}
                      >
                        Follow Up 2
                      </Button>
                      <Button
                        color="primary"
                        disabled
                        className="ml-2"
                        size="sm"
                        onClick={(event) => set_follow_up(event, 3)}
                      >
                        Follow Up 3
                      </Button>
                    </Colxx>
                    <Colxx md="4"></Colxx>
                  </Row>
                  {follow_up !== "" ? (
                    <>
                      <Row className="mt-4">
                        <Colxx md="4"></Colxx>
                        <Colxx md="4">
                          <Select
                            components={{ Input: CustomSelectInput }}
                            className="react-select"
                            classNamePrefix="react-select"
                            placeholder="Select Rating"
                            name="follow_up[follow_up_reason]"
                            options={follow_up_reasons}
                          />
                        </Colxx>
                        <Colxx md="4"></Colxx>
                      </Row>
                      <Row className="mt-4">
                        <Colxx md="4"></Colxx>
                        <Colxx md="4">
                          <Button color="primary" type="submit">
                            Add Follow Up
                          </Button>
                          <Button
                            color="secondary"
                            outline
                            onClick={toggleModal}
                            type="button"
                          >
                            Cancel
                          </Button>
                        </Colxx>
                        <Colxx md="4"></Colxx>
                      </Row>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              ) : orderToEdit.follow_ups.length === 2 ? (
                <>
                  <Row>
                    <Colxx md="5"></Colxx>
                    <Colxx md="2">
                      <Button
                        color="primary"
                        className="ml-2"
                        size="sm"
                        onClick={(event) => set_follow_up(event, 3)}
                      >
                        Follow Up 3
                      </Button>
                    </Colxx>
                    <Colxx md="5"></Colxx>
                  </Row>
                  {follow_up !== "" ? (
                    <>
                      <Row className="mt-4">
                        <Colxx md="4"></Colxx>
                        <Colxx md="4">
                          <Select
                            components={{ Input: CustomSelectInput }}
                            className="react-select"
                            classNamePrefix="react-select"
                            placeholder="Select Rating"
                            name="follow_up[follow_up_reason]"
                            options={follow_up_reasons}
                          />
                        </Colxx>
                        <Colxx md="4"></Colxx>
                      </Row>
                      <Row className="mt-4">
                        <Colxx md="4"></Colxx>
                        <Colxx md="4">
                          <Button color="primary" type="submit">
                            Add Follow Up
                          </Button>
                          <Button
                            color="secondary"
                            outline
                            onClick={toggleModal}
                            type="button"
                          >
                            Cancel
                          </Button>
                        </Colxx>
                        <Colxx md="4"></Colxx>
                      </Row>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <></>
              )}
            </>
          ) : (
            <>
              <Row>
                <Colxx md="3"></Colxx>
                <Colxx md="7">
                  <Button
                    color="primary"
                    size="sm"
                    onClick={(event) => set_follow_up(event, 1)}
                  >
                    Follow Up 1
                  </Button>
                  <Button
                    color="primary"
                    disabled
                    className="ml-2"
                    size="sm"
                    onClick={(event) => set_follow_up(event, 2)}
                  >
                    Follow Up 2
                  </Button>
                  <Button
                    color="primary"
                    disabled
                    className="ml-2"
                    size="sm"
                    onClick={(event) => set_follow_up(event, 3)}
                  >
                    Follow Up 3
                  </Button>
                </Colxx>
                <Colxx md="2"></Colxx>
              </Row>
              {follow_up !== "" ? (
                <>
                  <Row className="mt-4">
                    <Colxx md="4"></Colxx>
                    <Colxx md="4">
                      <Select
                        components={{ Input: CustomSelectInput }}
                        className="react-select"
                        classNamePrefix="react-select"
                        placeholder="Select Rating"
                        name="follow_up[follow_up_reason]"
                        options={follow_up_reasons}
                        defaultValue={follow_up_reasons[0]}
                      />
                    </Colxx>
                    <Colxx md="4"></Colxx>
                  </Row>
                  <Row className="mt-4">
                    <Colxx md="4"></Colxx>
                    <Colxx md="4">
                      <Button color="primary" type="submit">
                        Add Follow Up
                      </Button>
                      <Button
                        color="secondary"
                        outline
                        onClick={toggleModal}
                        type="button"
                      >
                        Cancel
                      </Button>
                    </Colxx>
                    <Colxx md="4"></Colxx>
                  </Row>
                </>
              ) : (
                <></>
              )}
            </>
          )}
        </form>
        {follow_up === "" ? (
          <>
            <form onSubmit={(event) => updateRating(event, orderToEdit.id)}>
              <input
                type="hidden"
                name="order[is_feedback_skipped]"
                value={false}
              />
              <ModalBody>
                {orderToEdit.order_jobs !== undefined ? (
                  <>
                    {orderToEdit.order_jobs.map((job) => {
                      return (
                        <>
                          <Row>
                            <Colxx md="4"></Colxx>
                            <Colxx md="1">
                              <img
                                alt="Tech "
                                src={job.technician.profile_photo_url}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50px",
                                }}
                              />
                            </Colxx>
                            <hr />
                            <Colxx md="3">
                              {job.technician.first_name}{" "}
                              {job.technician.last_name}{" "}
                              <Badge>{job.technician.membership_code}</Badge>
                              {""}
                              <br />
                              {job.job_code}
                            </Colxx>
                            <hr />
                            <Colxx md="4"></Colxx>
                          </Row>
                          <Row>
                            <Colxx md="3"></Colxx>
                            <Colxx md="6">
                              <ul>
                                <strong>Services</strong>
                                {self.render_job_services(job)}
                              </ul>
                            </Colxx>
                            <Colxx md="3"></Colxx>
                          </Row>
                          {/* <hr /> */}
                          <Row>
                            <Colxx md="4"></Colxx>
                            <Colxx md="4">
                              <ReactStars
                                count={5}
                                onChange={(event) =>
                                  jobRatingChanged(event, job.id)
                                }
                                defaultValue={0}
                                size={24}
                                activeColor="#ffd700"
                                name="order[order_jobs_attributes][][job_rating]"
                              />
                              {self.set_ratings(job)}
                            </Colxx>
                            <Colxx md="4"></Colxx>
                          </Row>
                          <Row className="mt-3">
                            <Colxx md="3"></Colxx>
                            <Colxx md="6">
                              <input
                                type="hidden"
                                name="order[order_jobs_attributes][][id]"
                                value={job.id}
                              />
                              <textarea
                                rows="4"
                                cols="40"
                                name="order[order_jobs_attributes][][comments]"
                                placeholder="Comments"
                              ></textarea>
                            </Colxx>
                            <Colxx md="3"></Colxx>
                          </Row>
                          <hr />
                        </>
                      );
                    })}
                  </>
                ) : (
                  <></>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="secondary"
                  outline
                  onClick={toggleModal}
                  type="button"
                >
                  Cancel
                </Button>
                {this.props.rating_value[0] !== undefined &&
                this.props.rating_value.length > 0 &&
                this.props.rating_value[0].newRating > 0 ? (
                  <>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>{" "}
                  </>
                ) : (
                  <></>
                )}
              </ModalFooter>
            </form>
          </>
        ) : (
          <></>
        )}
      </Modal>
    );
  }
}

export default EditRatingOrder;
