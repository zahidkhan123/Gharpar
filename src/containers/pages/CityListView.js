import React, { Component } from "react";
import { Card, Row, Button } from "reactstrap";
import classnames from "classnames";
import { ContextMenuTrigger } from "react-contextmenu";
import { Colxx } from "../../components/common/CustomBootstrap";

class CityListView extends Component {
  render() {
    const city = this.props.city;
    const isSelect = this.props.isSelect;
    const collect = this.props.collect;
    const editCity = this.props.editCity;
    const toggleDeleteConfirmationModal = this.props
      .toggleDeleteConfirmationModal;
    const toggleModalArea = this.props.toggleModalArea;
    const activateCity = this.props.activateCity;

    return (
      <Row>
        <Colxx xxs="12" className="mb-3">
          <ContextMenuTrigger id="menu_id" data={city.id} collect={collect}>
            <Card
              // onClick={event => onCheckItem(event, city.id)}
              className={classnames("d-flex flex-row", {
                active: isSelect,
              })}
            >
              <div
                className={
                  city.is_active === true
                    ? "pl-2 d-flex flex-grow-1 min-width-zero"
                    : "pl-2 d-flex flex-grow-1 min-width-zero deactivated-row"
                }
              >
                <div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
                  <p className="list-item-heading mb-1 truncate">
                    {city.city_name}
                  </p>
                </div>
                <div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
                  {city.is_active ? (
                    <>
                      <Button
                        onClick={(event) => toggleModalArea(event, city)}
                        data-city={city.id}
                        className="btn-success mr-2"
                      >
                        Areas
                      </Button>
                      <Button
                        onClick={(event) => editCity(city, event)}
                        className="btn-success mr-2"
                      >
                        Edit
                      </Button>
                    </>
                  ) : (
                    <></>
                  )}
                  {city.is_active === true ? (
                    <Button
                      color="danger"
                      onClick={(event) =>
                        toggleDeleteConfirmationModal(event, city)
                      }
                      className=""
                    >
                      {" "}
                      Deactivate{" "}
                    </Button>
                  ) : (
                    <Button
                      color="success"
                      onClick={(event) => activateCity(event, city.id)}
                      className=""
                    >
                      {" "}
                      Activate{" "}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </ContextMenuTrigger>
        </Colxx>
      </Row>
    );
  }
}

/* React.memo detail : https://reactjs.org/docs/react-api.html#reactpurecomponent  */
export default React.memo(CityListView);
