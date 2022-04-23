import React, { Component }  from "react";
import { Card, CustomInput, Badge, Button } from "reactstrap";
import { NavLink, Link } from "react-router-dom";
import classnames from "classnames";
import { ContextMenuTrigger } from "react-contextmenu";
import { Colxx } from "../../../components/common/CustomBootstrap";
import axios from "axios";

class UsersListView extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      user,
      toggleDeleteConfirmationModal
    } = this.props;

    let client_name = "";
    if (user.first_name == null) {
      client_name = "Guest User";
    }
    else {
      client_name = user.first_name + " " + user.last_name;
    }

    return (
      <Colxx xxs="12" className="mb-3">
        <ContextMenuTrigger id="menu_id" data={user.id}>
          <Card className={classnames("d-flex flex-row", {} )}>
            <div className="pl-2 d-flex flex-grow-1 min-width-zero">
              <div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
                <p> { user.user_details.membership_code } </p>
              </div>
              <div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
                <NavLink to={`?p=${user.id}`} className="w-40 w-sm-100">
                  <p className="list-item-heading mb-1 truncate">
                    { client_name }
                  </p>
                </NavLink>
              </div>
              <div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
                <p> { user.phone } </p>
              </div>
              <div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
                <Link to={`edit/${user.id}`}>
                  <Button className="btn-success mr-2"> Edit </Button>
                </Link>
                <Button onClick={ (event) => toggleDeleteConfirmationModal(event, user) }>Delete</Button>
              </div>
            </div>
          </Card>
        </ContextMenuTrigger>
      </Colxx>
    );
  }
};

export default React.memo(UsersListView);
