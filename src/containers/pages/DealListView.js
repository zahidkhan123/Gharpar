import React, { Component } from "react";
import { Card, CustomInput, Badge, Button, Label } from "reactstrap";
import { NavLink, Link } from "react-router-dom";
import classnames from "classnames";
import { ContextMenuTrigger } from "react-contextmenu";
import { Colxx } from "../../components/common/CustomBootstrap";
import axios from "axios";

class DealListView extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const parentId = this.props.parentId;
    const deal = this.props.deal;
    const isSelect = this.props.isSelect;
    const collect = this.props.collect;
    const editDeal = this.props.editDeal;
    const activateDeal = this.props.activateDeal;
    const toggleDeleteConfirmationModal = this.props
      .toggleDeleteConfirmationModal;

    return (
      <>
        <tr>
          <td>
            <NavLink
              to={`/app/deals/show/${deal.id}`}
              className="w-40 w-sm-100">
              <p className="list-item-heading mb-1 truncate">
                {deal.deal_title}
              </p>
            </NavLink>
          </td>
          <td>
            {deal.deal_cities.map((single_city) => {
              return (
                <>
                  {single_city.deal_city_services.map((service) => {
                    return <> {service.service_title + " + "} </>;
                  })}
                </>
              );
            })}
          </td>
          <td>
            {deal.deal_cities.map((single_city) => {
              return <>{single_city.city_name + " "}</>;
            })}
          </td>
          <td>{deal.deal_start_date}</td>
          <td>{deal.deal_end_date}</td>
          <td>
            {deal.is_active == true || deal.is_active == "true" ? (
              <Label>Active</Label>
            ) : (
              <Label>Disabled</Label>
            )}
          </td>
          <td>
            <div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
              <Link to={`edit_deal/${deal.id}`}>
                <Button size="sm" className="btn-success mr-2">
                  {" "}
                  Edit{" "}
                </Button>
              </Link>
              {deal.is_active ? (
                <Button
                  color="danger"
                  onClick={(event) => activateDeal(event, deal.id, false)}
                  className="">
                  {" "}
                  Deactivate{" "}
                </Button>
              ) : (
                <Button
                  color="success"
                  onClick={(event) => activateDeal(event, deal.id, true)}
                  className="">
                  {" "}
                  Activate{" "}
                </Button>
              )}
              {/* <Button onClick={ (event) => editDeal(deal, event) } className="btn-success mr-2">Edit</Button> */}
              {/* <Button size="sm" onClick={ (event) => toggleDeleteConfirmationModal(event, deal) }>Delete</Button> */}
            </div>
          </td>
        </tr>
      </>
    );
  }
}

export default React.memo(DealListView);
