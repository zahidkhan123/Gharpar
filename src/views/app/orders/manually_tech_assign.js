// import React, { Component }  from "react";
// import { Card, CustomInput, Badge, Button, Row, Input, Modal, ModalHeader, ModalBody, Label, CardBody} from "reactstrap";
// import { NavLink } from "react-router-dom";
// import classnames from "classnames";
// import { ContextMenuTrigger } from "react-contextmenu";
// import { Colxx } from "../../../components/common/CustomBootstrap";
// import { servicePath, authHeaders } from "../../../constants/defaultValues";
// import { NotificationManager } from "../../../components/common/react-notifications";
// import Select from "react-select";
// import CustomSelectInput from "../../../components/common/CustomSelectInput";
// import axios from "axios";

// const apiUrl = servicePath + "/api/v2/orders.json";
// class EditOrder extends Component {

//   constructor(props) {
//     super(props);
//     this.state = {
//       order_data: {},
//       order: {},
//       technicians_json: {},
//       order_service_to_delete: "",
//       deleteConfirmationModal: false
//     }
//     this.fetch_all_order_details = this.fetch_all_order_details.bind(this);
//     this.prepare_technicians_json = this.prepare_technicians_json.bind(this);
//     this.orderUpdate = this.orderUpdate.bind(this);
//     this.fetch_order = this.fetch_order.bind(this);
//     this.deleteOrderService = this.deleteOrderService.bind(this);
//   }

//   async componentDidMount() {
//     let order = await this.fetch_order();
//     let order_data = await this.fetch_all_order_details();
//     let technicians_json = this.prepare_technicians_json(order_data);

//     this.setState({
//       order: order,
//       order_data: order_data,
//       technicians_json: technicians_json
//     })
//   };

//   prepare_technicians_json = (order_data) => {
//     let technicians_json = {}
//     order_data.forEach(function(single_order_detail, outerIndex) {
//       let order_detail_id = single_order_detail.id;
//       technicians_json[order_detail_id] = []
//       single_order_detail.technicians.forEach(function(single_technician, index) {
//         technicians_json[order_detail_id].push({
//           label: single_technician.first_name + " " + single_technician.last_name,
//           value: single_technician.id,
//           key: single_technician.id
//         })
//       })
//     });

//     return technicians_json;
//   };

//   fetch_all_order_details = async () => {
//     let order_data = {};
//     const { match } = this.props;

//     await axios({
//       method: "get",
//       url: servicePath + '/api/v2/orders/' + match.params.id + '/order_technicians.json',
//       headers: {
//         "Content-Type": "application/json",
//         "AUTH-TOKEN": localStorage.getItem("auth_token")
//       }
//     })
//     .then(response => {
//       if (response.status == 200) {
//         order_data = response.data
//       }
//       else {
//         console.log(response);
//       }
//     })
//     .catch((error) => {
//       NotificationManager.error(
//         error.response.data.message, "", 5000, () => { alert("callback"); }, null, "filled"
//       );
//       console.log('error', error)
//     });

//     return order_data;
//   };

//   fetch_order = async () => {
//     let order = {};
//     const { match } = this.props;

//     await axios({
//       method: "get",
//       url: servicePath + '/api/v2/orders/' + match.params.id + '.json?default_role=admin',
//       headers: {
//         "Content-Type": "application/json",
//         "AUTH-TOKEN": localStorage.getItem("auth_token")
//       }
//     })
//     .then(response => {
//       if (response.status == 200) {
//         order = response.data
//       }
//       else {
//         console.log(response);
//       }
//     })
//     .catch((error) => {
//       NotificationManager.error(
//         error.response.data.message, "", 5000, () => { alert("callback"); }, null, "filled"
//       );
//       console.log('error', error)
//     });

//     return order;
//   };

//   orderUpdate = async (event) => {
//     event.preventDefault();

//     const { match } = this.props;

//     let self = this;
//     let formData = new FormData(event.target);
//     await axios({
//       method: "put",
//       url: servicePath + '/api/v2/orders/' + match.params.id + '.json',
//       data: formData,
//       headers: {
//         'Content-Type': 'application/json',
//         "AUTH-TOKEN": localStorage.getItem("auth_token")
//       }
//     })
//     .then(response => {

//       if (response.status == 200) {
//         // self.setState({
//         //   order: response.data,
//         // });

//         NotificationManager.success(
//           "Updated Successfully", "", 3000, null, null, "filled"
//         );

//         this.props.history.push("/app/orders/show/" + response.data.id);
//       }
//       else {
//         console.log(response);
//       }
//     })
//     .catch((error) => {
//       NotificationManager.error(
//         error.response.data.message, "", 5000, () => { alert("callback"); }, null, "filled"
//       );
//       console.log('error', error)
//     });
//   };

//   deleteOrderService = async () => {
//     let self = this;
//     const {
//       order_service_to_delete
//     } = this.state;

//     await axios.delete(servicePath + '/api/v2/orders/delete_order_service.json?order_service_id=' + this.state.order_service_to_delete,
//     {
//       headers: {
//         "Content-Type": "application/json",
//         "AUTH-TOKEN": localStorage.getItem("auth_token")
//       }
//     })
//     .then(response => {
//       if (response.status == 200) {
//         document.body.querySelector('[data-id="' + order_service_to_delete + '"]').closest(".row").remove();
//         NotificationManager.success(
//           "Deleted Successfully", "", 3000, null, null, "filled"
//         );
//       }
//       else {
//         console.log(response);
//       }
//     })
//     .catch((error) => {
//       NotificationManager.error(
//         error.response.data.message, "", 5000, () => { alert("callback"); }, null, "filled"
//       );
//       console.log('error', error)
//     });
//   };

//   toggleDeleteConfirmationModal = (event) => {
//     if (this.state.deleteConfirmationModal == false) {
//       this.setState({
//         deleteConfirmationModal: !this.state.deleteConfirmationModal,
//         order_service_to_delete: event.target.dataset.id
//       });
//     }
//     else {
//       // if delete confirmed then, first call delete function for service category
//       if (event.target.classList.contains("delete-confirmed")) {
//         this.deleteOrderService();
//       }
//       this.setState({
//         deleteConfirmationModal: !this.state.deleteConfirmationModal,
//         order_service_to_delete: ""
//       });
//     }
//   };

//   deleteConfirmation = (event, deal) => {
//     return (
//       <Modal
//         isOpen={this.state.deleteConfirmationModal}
//         size="sm"
//         toggle={this.toggleDeleteConfirmationModal}
//       >
//         <ModalHeader toggle={this.toggleSmall}>
//           Are you sure you want to delete this service ?
//         </ModalHeader>
//         <ModalBody>
//           <Button size="sm" onClick={ (event) => this.toggleDeleteConfirmationModal(event) } className="btn-success mr-2 delete-confirmed"> Yes </Button>
//           <Button size="sm" onClick={ (event) => this.toggleDeleteConfirmationModal(event) } className="btn-success"> Cancel </Button>
//         </ModalBody>
//       </Modal>
//     )
//   };

//   render_order_services = () => {
//     const {
//       order_data,
//       technicians_json,
//       order,
//       toggleDeleteConfirmationModal
//     } = this.state;

//     let self = this;

//     let order_services = [];

//     order.order_services.forEach(function(single_order_service, index) {
//       let service_order_technician = [{}];
//       service_order_technician = single_order_service.technicians_for_dropdown.map(function (technician) {
//         if (technician.value == single_order_service.technician_id) {
//           return technician;
//         }
//       });

//       order_services.push(
//         <>
//           <Row>
//             <Colxx xxs="12" md="12" className="mb-3">
//               <ContextMenuTrigger id="menu_id" data={single_order_service.id} >
//                 <Card className={classnames("d-flex flex-row")}>
//                   <div className="pl-2 d-flex flex-grow-1 min-width-zero">
//                     <div className="card-body d-flex flex-column flex-lg-row min-width-zero align-items-lg-center">
//                       { <Input name="order[order_services_attributes][][id]" defaultValue={single_order_service.id} hidden /> }
//                       { <Input name="order[order_services_attributes][][service_id]" defaultValue={single_order_service.service_id} hidden /> }
//                       {/* <NavLink to={`/app/orders/show/${single_order_service.id}`} className="w-40 w-sm-100"> */}
//                         <p className="list-item-heading mb-1 truncate w-40 w-sm-100"> { single_order_service.service_title } </p>
//                       {/* </NavLink> */}

//                       <Select
//                         components={{ Input: CustomSelectInput }}
//                         className="react-select order_service_select"
//                         classNamePrefix="react-select"
//                         name="order[order_services_attributes][][technician_id]"
//                         defaultValue={service_order_technician}
//                         options={single_order_service.technicians_for_dropdown}
//                       />
//                     </div>
//                     <div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
//                       {/* <Button onClick={ (event) => editDeal(order, event) } className="btn-success mr-2">Edit</Button> */}
//                       <Button data-id={single_order_service.id} onClick={ (event) => self.toggleDeleteConfirmationModal(event) }>Delete</Button>
//                     </div>
//                   </div>
//                 </Card>
//               </ContextMenuTrigger>
//             </Colxx>
//           </Row>
//         </>
//       )
//     });

//     order_services.push(
//       <>
//         <Row>
//           <Colxx>
//             {
//               order.status == 'Confirmed' ?
//               <Button color="primary" type="submit"> Update </Button> :
//               <Button color="primary" type="submit"> Confirm </Button>
//             }
//           </Colxx>
//         </Row>
//       </>
//     )

//     return order_services;
//   }

//   render() {
//     const {
//       order_data,
//       order
//     } = this.state;

//     if (Object.keys(order).length === 0 || Object.keys(order_data).length === 0) {
//       return (
//         <> </>
//       );
//     }
//     else {
//       return (
//         <>
//           { this.deleteConfirmation() }
//           <Row className="mt-3">
//             <Colxx md="12">
//               <Card>
//                 <CardBody>
//                   <Row>
//                     <Colxx md="2">
//                       {
//                         order.client.profile_picture != null && order.client.profile_picture.lenght > 0 ?
//                         <img alt="Client Image" src={order.client.profile_picture} className="user-img" /> :
//                         <img alt="Client Image" src="/assets/img/profile-pic-l.jpg" className="user-img"/>
//                       }
//                     </Colxx>
//                     <Colxx md="4" className="user-show-border">
//                       <Row>
//                         <Colxx md="12">
//                           <h3>
//                             {
//                               order.client.user_name != null && order.client.user_name.length > 0 ?
//                               <> { order.client.user_name } </> :
//                               <> { order.client.first_name + " " + order.client.last_name } </>
//                             }
//                           </h3>
//                         </Colxx>
//                       </Row>
//                       <Row>
//                         <Colxx md="5">
//                           <Label> <b> Status: </b> </Label> <br/>
//                           <Label> <b> Phone: </b> </Label> <br/>
//                           <Label> <b> Date: </b> </Label> <br/>
//                           <Label> <b> Time: </b> </Label>
//                         </Colxx>
//                         <Colxx md="7">
//                           {
//                             order.client.is_cnic_verified == true || order.client.is_cnic_verified == 'true' ?
//                             <Label className="ml-3"> Verified </Label> :
//                             <Label className="ml-3"> Unverified </Label>
//                           }
//                           <br/>
//                           <Label className="ml-3">{order.client.phone}</Label> <br/>
//                           <Label className="ml-3">{order.order_date}</Label> <br/>
//                           <Label className="ml-3">{order.order_time}</Label>
//                         </Colxx>
//                       </Row>
//                     </Colxx>

//                     <Colxx md="3" className="user-show-border">
//                       <Label> <b> Address: </b> </Label> <br/>
//                       <Label>
//                         {
//                           order.address.address_1 + ", " + order.address.area.area + ", " + order.address.city.city_name
//                         }
//                       </Label> <br/>
//                       <Label> <b> Order Status: </b> </Label> <br/>
//                       <Label> { order.status } </Label>
//                     </Colxx>

//                     <Colxx md="3">
//                       <Label> <b> Service Ordered: </b> </Label> <br/>
//                       <ul className="technician-services">
//                         {
//                           order.order_services.map( (service, index) => {
//                             return (
//                               <>
//                                 <li>
//                                   <Label> { service.service_title } </Label>
//                                   <ul>
//                                     {
//                                       service.order_service_addons.map((addon, index) => {
//                                         return (
//                                           <li>
//                                             <Label> { addon.service_addon_title } </Label>
//                                           </li>
//                                         )
//                                       })
//                                     }
//                                   </ul>
//                                 </li>
//                               </>
//                             )
//                           })
//                         }
//                       </ul>
//                     </Colxx>
//                   </Row>
//                 </CardBody>
//               </Card>
//             </Colxx>
//           </Row>
//           <form onSubmit={this.orderUpdate} autoComplete="off">
//             { this.render_order_services() }
//           </form>
//         </>
//       )
//     }
//   }
// };

// export default React.memo(EditOrder);
