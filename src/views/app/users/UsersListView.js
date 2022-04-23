import React, { Component } from "react";
import { Badge, Button, Label } from "reactstrap";
import { Link } from "react-router-dom";
import "./technician.css";
import { getImage } from "../../../helpers/Utils";
import BeautyStars from "beauty-stars";
import { check_permission } from "../../../helpers/Utils";
class UsersListView extends Component {
  render() {
    const { user } = this.props;

    return (
      <tr>
        <td>{getImage(user, "listing")}</td>
        <td>
          <Link
            // to={`/app/technicians/show/${user.id}`} className="w-40 w-sm-100"
            onClick={() =>
              check_permission(
                "technicians/show",
                `/app/technicians/show/${user.id}`
              )
            }
          >
            <Label>
              {" "}
              {user.first_name} {user.last_name}{" "}
            </Label>
          </Link>
        </td>
        <td>
          <Badge color="secondary" pill className="mb-1">
            {user.membership_code}
          </Badge>
        </td>
        <td>{user.technician_working_cities}</td>
        <td>
          {user.country_code}
          {user.phone}
        </td>
        <td>
          {user.phone_pin}
        </td>
        <td>{user.technician_status}</td>
        <td>
          <BeautyStars
            // count={5}
            // onChange={ratingChanged}
            value={user.ratings}
            size={14}
            activeColor="#ffd700"
            edit={false}
            gap="5px"
          />
        </td>
        <td>
          <Link
            // to={`edit/${user.id}`}
            onClick={() =>
              check_permission("technicians/update", `edit/${user.id}`)
            }
          >
            <Button className="btn-success mr-2"> Edit </Button>
          </Link>
        </td>
      </tr>
    );
  }
}

export default React.memo(UsersListView);
