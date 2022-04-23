import React, { Component } from "react";
import { Card, Badge, Button } from "reactstrap";
import { NavLink } from "react-router-dom";
import classnames from "classnames";
import { ContextMenuTrigger } from "react-contextmenu";
import { Colxx } from "../../components/common/CustomBootstrap";

class ServiceCategoryListView extends Component {
  render() {
    const parentId = this.props.parentId;
    const service_category = this.props.service_category;
    const isSelect = this.props.isSelect;
    const collect = this.props.collect;
    const editServiceCategory = this.props.editServiceCategory;
    const servicesPath = this.props.servicesPath;
    const toggleDeleteConfirmationModal = this.props
      .toggleDeleteConfirmationModal;

    let service_cate_title_path = null;
    if (parentId !== undefined && parentId.length > 0) {
      service_cate_title_path = "#";
    } else {
      service_cate_title_path = `/app/service_categories/${service_category.id}`;
    }
    if (service_category.is_deal === false) {
      return (
        <Colxx xxs="12" className="mb-3">
          <ContextMenuTrigger
            id="menu_id"
            data={service_category.id}
            collect={collect}
          >
            <Card
              className={classnames("d-flex flex-row", {
                active: isSelect,
              })}
            >
              <div className="pl-2 d-flex flex-grow-1 min-width-zero">
                <div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
                  <NavLink
                    to={service_cate_title_path}
                    className="w-40 w-sm-100"
                  >
                    <p className="list-item-heading mb-1 truncate">
                      {service_category.service_category_title}
                    </p>
                  </NavLink>
                  <div className="w-15 w-sm-100">
                    <Badge pill>{service_category.is_active}</Badge>
                  </div>
                </div>
                <div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
                  {/* <NavLink to={`/app/service_categories/${service_category.id}/services`} className="btn-success mr-2"> Services </NavLink> */}
                  <Button
                    onClick={(event) => servicesPath(service_category, event)}
                    className="btn-success mr-2"
                  >
                    Services
                  </Button>
                  <Button
                    onClick={(event) =>
                      editServiceCategory(service_category, event)
                    }
                    className="btn-success mr-2"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={(event) =>
                      toggleDeleteConfirmationModal(event, service_category)
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          </ContextMenuTrigger>
        </Colxx>
      );
    } else {
      return <></>;
    }
  }
}

export default React.memo(ServiceCategoryListView);
