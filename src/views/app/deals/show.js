import React, { Component } from "react";
import {
  Card,
  CardBody,
  Table,
  Button,
  Row,
  Label,
  Collapse,
} from "reactstrap";
import { Colxx } from "../../../components/common/CustomBootstrap";
import { servicePath } from "../../../constants/defaultValues";
import { NotificationManager } from "../../../components/common/react-notifications";
import axios from "axios";
import { trackPromise } from "react-promise-tracker";

let accordion_data = [];
var i;
for (i = 0; i < 500; i++) {
  if (i === 0) {
    accordion_data[i] = true;
  } else {
    accordion_data[i] = false;
  }
}

class DealShow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deal: {},
      accordion: accordion_data,
    };
    this.fetch_deal = this.fetch_deal.bind(this);
  }

  async componentDidMount() {
    let deal = await this.fetch_deal();
    // deal_services.map((deal_service) => {
    // accordian_ids.push(false);
    // });
    this.setState({
      deal: deal,
      // accordion: accordian_ids,
    });
  }
  toggleAccordion = (tab) => {
    const prevState = this.state.accordion;
    const state = prevState.map((x, index) => (tab === index ? !x : false));
    this.setState({
      accordion: state,
    });
  };

  fetch_deal = async () => {
    let deal = {};
    const { match } = this.props;

    await trackPromise(
      axios({
        method: "get",
        url: servicePath + "/api/v2/deals/" + match.params.id + ".json",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          deal = response.data;
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

    return deal;
  };

  capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  render_single_deal = (deal) => {
    let single_deal_html = [];
    deal.deal_services.map((single_deal, index) => {
      single_deal_html.push(
        <>
          <Colxx mb="12" md="12">
            <div className="border">
              <Button
                color="link"
                onClick={() => this.toggleAccordion(index)}
                aria-expanded={this.state.accordion[index]}
              >
                <b>{single_deal.service_title}</b>
              </Button>
              <Collapse isOpen={this.state.accordion[index]}>
                <div className="p-4">
                  <Table>
                    <tr>
                      <th>City</th>
                      <th>Original Price</th>
                      <th>Discount Type</th>
                      <th>Discount</th>
                      <th>Discounted Price</th>
                    </tr>
                    {single_deal.service_cities.map((single_city) => {
                      return (
                        <>
                          <tr>
                            <td>{single_city.city_name}</td>
                            <td>{single_city.actual_price}</td>
                            <td>{single_city.discount_type}</td>
                            <td>{single_city.discount}</td>
                            <td>{single_city.discount_price}</td>
                          </tr>
                        </>
                      );
                    })}
                  </Table>
                </div>
              </Collapse>
            </div>
          </Colxx>
        </>
      );
      return single_deal;
    });
    return single_deal_html;
  };
  render() {
    const { deal } = this.state;
    if (Object.keys(deal).length === 0) {
      return <></>;
    } else {
      return (
        <div>
          <h3>{deal.deal_title}</h3>
          <Row className="mt-3">
            <Colxx md="6">
              <Card>
                <CardBody>
                  <Row>
                    <Colxx md="12">
                      <Row>
                        <Colxx md="12"></Colxx>
                      </Row>
                      <Row>
                        <Colxx md="12">
                          <img
                            alt="Deal Banner"
                            src={deal.deal_banner}
                            style={{
                              width: "100%",
                              height: "150px",
                            }}
                          />
                        </Colxx>
                      </Row>
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx md="12">
                      <Row className="mt-3">
                        <Colxx md="5">
                          <Label>
                            <b>Deal Start:</b>
                          </Label>
                          <br />
                          <Label>
                            <b>Deal End:</b>
                          </Label>
                          <br />
                          <Label>
                            <b>Status:</b>
                          </Label>
                          <br />
                          <Label>
                            <b>No. of Orders:</b>
                          </Label>
                          <br />
                          <Label>
                            <b>Revenue:</b>
                          </Label>
                        </Colxx>
                        <Colxx md="7">
                          <Label className="ml-3">
                            <b>{deal.deal_start_datetime}</b>
                          </Label>
                          <br />
                          <Label className="ml-3">
                            <b>{deal.deal_end_datetime}</b>
                          </Label>
                          <br />
                          <Label className="ml-3">
                            {deal.deal_status === "Current" ? (
                              <>
                                <b>
                                  {deal.is_active ? <>Active</> : <>Deactive</>}
                                </b>
                              </>
                            ) : (
                              <>
                                <b>{deal.deal_status}</b>
                              </>
                            )}
                          </Label>
                          <br />
                          <Label className="ml-3">
                            <b>{deal.orders_count}</b>
                          </Label>
                          <br />
                          <Label className="ml-3">
                            <b>
                              {deal.total_actual_price -
                                deal.total_deal_discount}
                            </b>
                          </Label>
                        </Colxx>
                      </Row>
                    </Colxx>
                  </Row>
                </CardBody>
              </Card>
            </Colxx>
            <Colxx md="6">
              <Card>
                <CardBody>
                  {deal.deal_services.length > 0 ? (
                    <>{this.render_single_deal(deal)}</>
                  ) : (
                    <>No data found</>
                  )}
                </CardBody>
              </Card>
            </Colxx>
          </Row>
        </div>
      );
    }
  }
}

export default React.memo(DealShow);
