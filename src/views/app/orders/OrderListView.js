import React, { Component }  from "react";
import { Card, CustomInput, Badge, Button, Label } from "reactstrap";
import { NavLink } from "react-router-dom";
import classnames from "classnames";
import { ContextMenuTrigger } from "react-contextmenu";
import { Colxx } from "../../../components/common/CustomBootstrap";
import axios from "axios";

class OrderListView extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const order = this.props.order
    let client_name = "";

    if (order.client.first_name == null) {
      client_name = "Guest User";
    }
    else {
      client_name = order.client.first_name + " " + order.client.last_name;
    }

    return (
      <>
        <tr data={ order.id }>
          <td>
            <NavLink to={`/app/orders/show/${order.id}`} className="w-40 w-sm-100">
              <p className="list-item-heading mb-1 truncate">
                <Label> { client_name } </Label>
              </p>
            </NavLink>
          </td>
          <td> { order.id } </td>
          <td> { order.status } </td>
          <td> { order.order_time + ' ' + order.order_date } </td>
          <td> { order.client.gender } </td>
          <td> { order.address.city.city_name } </td>
          <td> { order.total_price } </td>
          <td> { order.created_at } </td>
        </tr>
      </>
    );
  }
};

export default React.memo(OrderListView);
