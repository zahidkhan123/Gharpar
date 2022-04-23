// import React from "react";
// import {
//   CustomInput,
//   Button,
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Input,
//   Label,
// } from "reactstrap";
// import Select from "react-select";
// import CustomSelectInput from "../../../components/common/CustomSelectInput";
// import IntlMessages from "../../../helpers/IntlMessages";

// const AddUserModal = ({
//   modalOpen,
//   toggleModal,
//   createUser,
//   updateUser,
//   userAction,
//   serviceCategoryToEdit,
// }) => {
//   const cities = [
//     { label: "Lahore", value: "lahore", key: 0 },
//     { label: "Islamabad", value: "islamabad", key: 1 },
//     { label: "Rawalpindi", value: "rawalpindi", key: 2 },
//   ];

//   const genders = [
//     { label: "Male", value: "male", key: 0 },
//     { label: "Female", value: "female", key: 1 },
//   ];

//   return (
//     <Modal
//       isOpen={modalOpen}
//       toggle={toggleModal}
//       wrapClassName="modal-right"
//       backdrop="static"
//     >
//       <form onSubmit={userAction === "new" ? createUser : updateUser}>
//         <ModalHeader toggle={toggleModal}>
//           {userAction === "new" ? (
//             <IntlMessages id="New User" />
//           ) : (
//             <IntlMessages id="Edit User" />
//           )}
//         </ModalHeader>
//         <ModalBody>
//           <Label className="mt-4">
//             <IntlMessages id="First Name*" />
//           </Label>
//           {userAction === "new" ? (
//             <Input
//               className="form-control"
//               name="first_name"
//               type="text"
//               defaultValue=""
//               required
//             />
//           ) : (
//             <Input
//               className="form-control"
//               name="first_name"
//               type="text"
//               defaultValue=""
//               data-id=""
//               required
//             />
//           )}
//           <Label className="mt-4">
//             <IntlMessages id="Last Name*" />
//           </Label>
//           {userAction === "new" ? (
//             <Input
//               className="form-control"
//               name="last_name"
//               type="text"
//               defaultValue=""
//               required
//             />
//           ) : (
//             <Input
//               className="form-control"
//               name="last_name"
//               type="text"
//               defaultValue=""
//               data-id=""
//               required
//             />
//           )}
//           <Label className="mt-4">
//             <IntlMessages id="Phone*" />
//           </Label>
//           {userAction === "new" ? (
//             <Input
//               className="form-control"
//               name="phone"
//               type="number"
//               defaultValue=""
//               required
//             />
//           ) : (
//             <Input
//               className="form-control"
//               name="phone"
//               type="number"
//               defaultValue=""
//               data-id=""
//               required
//             />
//           )}
//           <Label className="mt-4">
//             <IntlMessages id="CNIC*" />
//           </Label>
//           {userAction === "new" ? (
//             <Input
//               className="form-control"
//               name="cnic"
//               type="text"
//               defaultValue=""
//               required
//             />
//           ) : (
//             <Input
//               className="form-control"
//               name="cnic"
//               type="text"
//               defaultValue=""
//               data-id=""
//               required
//             />
//           )}

//           <Label className="mt-4">
//             <IntlMessages id="Select City*" />
//           </Label>
//           <Select
//             components={{ Input: CustomSelectInput }}
//             className="react-select"
//             classNamePrefix="react-select"
//             name="city"
//             options={cities}
//           />

//           <Label className="mt-4">
//             <IntlMessages id="Gender*" />
//           </Label>
//           <Select
//             components={{ Input: CustomSelectInput }}
//             className="react-select"
//             classNamePrefix="react-select"
//             name="gender"
//             options={genders}
//           />

//           {
//             <Input
//               className="form-control"
//               name="country_code"
//               type="text"
//               defaultValue="+92"
//               hidden
//             />
//           }
//           {
//             <Input
//               className="form-control"
//               name="default_role"
//               type="text"
//               defaultValue="technician"
//               hidden
//             />
//           }
//         </ModalBody>
//         <ModalFooter>
//           <Button color="secondary" outline onClick={toggleModal} type="button">
//             <IntlMessages id="pages.cancel" />
//           </Button>
//           <Button color="primary" type="submit">
//             <IntlMessages id="pages.submit" />
//           </Button>
//         </ModalFooter>
//       </form>
//     </Modal>
//   );
// };

// export default AddUserModal;
