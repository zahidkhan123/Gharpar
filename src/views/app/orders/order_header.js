import React from "react";
import { Card, Badge } from "reactstrap";
import GiftBox from "../../../assets/images/gift_order_show.png";
import moment from "moment";
import { Link } from "react-router-dom";
const OrderHeader = (props) => {
  const {
    client,
    order_date,
    order_time,
    address,
    cancel_reason,
    order_edit_reason,
    id,
    status,
    is_gift_avail,
    tag_id,
    tag_name,
  } = props.order_meta;
  const { first_name, last_name, approved_status, membership_code, phone } =
    client;
  let client_id = client.id;
  function render_client_image(client_data) {
    let image_url = "/assets/img/profile-pic-l.jpg";
    if (client_data.profile_photo_url !== null) {
      image_url = client_data.profile_photo_url;
    } else if (client_data.profile_picture !== null) {
      image_url = client_data.profile_picture;
    }

    return image_url;
  }

  function format_full_name(firstName, lastName = undefined) {
    if (lastName) return firstName + " " + lastName;
    else return firstName;
  }

  function format_address(address) {
    let address_1 = address.address_1;

    if (address_1 === null) {
      address_1 = "";
    }

    return (
      address_1 + ", " + address.area?.area + ", " + address.city?.city_name
    );
  }

  const removeTag = async (event, order_id) => {
    event.preventDefault();
    props.removeTag(event, order_id);
  };

  function format_requested_for(req_date, req_time) {
    return moment(req_date).format("MMMM Do YYYY") + ", " + req_time;
  }

  let order_header_html = (
    <>
      <Card>
        <div className="order-info card-body p-0">
          <div className="container">
            <div className="row">
              <div className="col-3 pt-3 pb-3 border-right text-center">
                <img
                  alt="Client"
                  src={render_client_image(client)}
                  className="img-thumbnail img-fluid rounded-circle"
                />
                <span
                  className="mt-2"
                  style={{
                    color: "rgb(255, 255, 255)",
                    background: "rgb(69, 86, 172)",
                    marginTop: "7px",
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: "14px",
                    fontSize: "10px",
                  }}
                >
                  {" "}
                  {approved_status}{" "}
                </span>
              </div>
              <div className="col-5 pt-3 pb-3">
                <div className="mb-3">
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div>
                      <h3>{format_full_name(first_name, last_name)}</h3>
                      <span className="badge badge-pill badge-secondary">
                        {membership_code}
                      </span>
                    </div>
                    {is_gift_avail ? (
                      <>
                        <img
                          src={GiftBox}
                          alt=""
                          width="20%"
                          style={{ borderRadius: "30px" }}
                        />
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
                <table className="table mb-0">
                  <tbody>
                    <tr>
                      <td className="pr-0 pl-0">Requested For</td>
                      <td>{format_requested_for(order_date, order_time)}</td>
                    </tr>
                    <tr>
                      <td className="pr-0 pl-0">Phone</td>
                      <td>{phone}</td>
                    </tr>
                    {cancel_reason !== undefined &&
                    cancel_reason !== "" &&
                    cancel_reason !== null ? (
                      <>
                        <tr>
                          <td className="pr-0 pl-0">Cancel Reason</td>
                          <td>{cancel_reason}</td>
                        </tr>
                      </>
                    ) : (
                      <></>
                    )}
                    {order_edit_reason !== undefined &&
                    order_edit_reason !== "" &&
                    order_edit_reason !== null ? (
                      <>
                        <tr>
                          <td className="pr-0 pl-0">Rescheduled Reason</td>
                          <td>{order_edit_reason}</td>
                        </tr>
                      </>
                    ) : (
                      <></>
                    )}
                  </tbody>
                </table>
                {/* <div className="mt-5">
                  <button className="btn btn-link btn-sm float-right p-0">
                    Cancel Order
                  </button>
                </div> */}
              </div>
              <div className="col-4 bg-light pt-3 pb-3">
                <div>
                  <label className="d-block">
                    <strong>
                      Address:
                      {status === "Pending" || status === "Confirmed" ? (
                        <>
                          <Link
                            className="ml-3"
                            to={`/app/orders/change_address/${id}/client/${client_id}`}
                          >
                            Change Address
                          </Link>
                        </>
                      ) : (
                        <></>
                      )}
                    </strong>
                    <p id="address">{format_address(address)}</p>
                    {tag_name !== undefined &&
                    tag_name !== "" &&
                    tag_name !== null ? (
                      <>
                        <div
                          id={id}
                          style={{
                            display: "flex",
                            justifyContent: "space-evenly",
                          }}
                        >
                          <div>
                            <strong>Tag: </strong>{" "}
                          </div>
                          <div>
                            {tag_name}{" "}
                            <a
                              onClick={(event) => removeTag(event, id)}
                              style={{ cursor: "pointer" }}
                            >
                              <Badge className="mb-1 ml-1">X</Badge>
                            </a>
                          </div>
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
  return order_header_html;
};

export default OrderHeader;
