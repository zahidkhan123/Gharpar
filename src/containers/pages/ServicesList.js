import React, { Component }  from "react";
import { Card, CustomInput, Badge, Button } from "reactstrap";
import { NavLink } from "react-router-dom";
import classnames from "classnames";
import { ContextMenuTrigger } from "react-contextmenu";
import { Colxx } from "../../components/common/CustomBootstrap";
import axios from "axios";

class ServicesList extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const service = this.props.service
    const isSelect = this.props.isSelect
    const collect = this.props.collect
    const editService = this.props.editService
    const servicesPath = this.props.servicesPath
    const showService = this.props.showService
    const toggleDeleteConfirmationModal = this.props.toggleDeleteConfirmationModal

    return (
      <Colxx xxs="12" className="mb-3">
        <ContextMenuTrigger id="menu_id" data={service.id} collect={collect}>
          <Card
            className={classnames("d-flex flex-row", {
              active: isSelect
            })}
          >
            <div className="pl-2 d-flex flex-grow-1 min-width-zero">
              <div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
                <NavLink to="#" className="w-40 w-sm-100">
                  <p className="list-item-heading mb-1 truncate">
                    {service.service_title}
                  </p>
                </NavLink>
                <NavLink to="#" className="w-40 w-sm-100">
                  <p className="list-item-heading mb-1 truncate">
                    {service.service_duration}
                  </p>
                </NavLink>
                <div className="w-15 w-sm-100">
                  <Badge pill>
                    {service.is_active}
                  </Badge>
                </div>
              </div>
              <div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
                <Button onClick={ (event) => editService(service, event) } className="btn-success mr-2">Edit</Button>
                <Button onClick={ (event) => toggleDeleteConfirmationModal(event, service) }>Delete</Button>
              </div>
            </div>
          </Card>
        </ContextMenuTrigger>
      </Colxx>
    );
  }
};

export default React.memo(ServicesList);
