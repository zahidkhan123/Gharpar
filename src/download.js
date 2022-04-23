import React, { Component } from "react";
import { Row, Button } from "reactstrap";
import Banner from "./assets/images/Group.svg";
import { Colxx } from "./components/common/CustomBootstrap";
import { partnerAppPath } from "../src/constants/defaultValues";

export class download extends Component {
  render() {
    return (
      <div style={{ backgroundColor: "white" }}>
        <Row className="mt-5">
          <Colxx sm="4"></Colxx>
          <Colxx sm="4" className="text-center p-5">
            <img src={Banner} alt="banner" />
            <h2 className="mt-4" style={{ fontSize: "25px" }}>
              Download Gharpar Partner App
            </h2>
            <p className="mt-4">
              Beautician with GharPar – MEAN’s #1 beauty services booking app.
              Earn money by being your own boss. That’s right, being a
              beautician at GharPar. Earn more than working in a physical salon
              and have full control over your income. Why be just a salon worker
              when you can become a Beautician?
            </p>
            <a href={partnerAppPath} target="_blank" download>
              <Button
                style={{
                  backgroundColor: "#2BC6EE",
                  borderColor: "transparent",
                  borderRadius: "0px",
                }}
              >
                Download App
              </Button>
            </a>
          </Colxx>
          <Colxx sm="4"></Colxx>
        </Row>
      </div>
    );
  }
}

export default download;
