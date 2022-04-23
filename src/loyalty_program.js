import React, { Component } from "react";
import { Row, Button } from "reactstrap";
import Banner from "./assets/images/logo.png";
import Step1 from "./assets/images/step-1.png";
import Step2 from "./assets/images/step-2.png";
import Step3 from "./assets/images/step-3.png";
import { Colxx } from "./components/common/CustomBootstrap";
import { partnerAppPath } from "./constants/defaultValues";

export class download extends Component {
  render() {
    document.title = "Loyalty Program";
    return (
      <div style={{ backgroundColor: "white" }}>
        <Row>
          <Colxx xs="4"></Colxx>
          <Colxx xs="4" className="text-center p-5">
            <img src={Banner} alt="banner" width="50%" />
            <h3
              className="mt-5"
              style={{
                textAlign: "center",
                font: "normal normal medium 13px/16px Montserrat",
                letterSpacing: "6.5px",
                color: "#0C0C19",
                textTransform: "uppercase",
                opacity: "1",
              }}
            >
              HOW IT WORKS
            </h3>
            <h1
              style={{
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "0px",
                color: "#F68D2F",
                textTransform: "uppercase",
                opacity: "1",
                fontSize: "40px",
              }}
            >
              GHARPAR LOYALTY PROGRAM!
            </h1>
            <p
              style={{
                textAlign: "center",
                font: "normal normal medium 12px/24px Montserrat",
                letterSpacing: "0px",
                color: "#91919D",
                opacity: " 1",
              }}
            >
              Share the comfort & experience of GharPar with your friends. Give
              them a reason to be happy and increase your happiness along the
              way too!
            </p>
            <p
              style={{
                textAlign: "center",
                font: "normal normal medium 12px/24px Montserrat",
                letterSpacing: "0px",
                color: "#91919D",
                opacity: " 1",
              }}
            >
              The more you share, the more you get!
            </p>
            <p
              style={{
                textAlign: "center",
                font: "normal normal medium 12px/24px Montserrat",
                letterSpacing: "0px",
                color: "#91919D",
                opacity: " 1",
              }}
            >
              Read below to learn how GharPar loyalty program works.
            </p>
          </Colxx>
          <Colxx xs="4"></Colxx>
        </Row>
        <Row style={{ backgroundColor: "#f9f5f0" }}>
          <Colxx xs="4"></Colxx>
          <Colxx xs="4" className="p-4">
            <h3
              className="mt-5"
              style={{
                font: "normal normal bold 13px/16px Montserrat",
                letterSpacing: "6.5px",
                color: "#91919D",
                textTransform: "uppercase",
                opacity: "1",
              }}
            >
              STEP NO. 1
            </h3>
            <h1
              style={{
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "0px",
                color: "#000",
                textTransform: "uppercase",
                opacity: "1",
                fontSize: "35px",
              }}
            >
              Complete your first 3 orders.
            </h1>
            <p
              style={{
                textAlign: "left",
                font: "normal normal medium 12px/24px Montserrat",
                letterSpacing: "0px",
                color: "#91919D",
                opacity: " 1",
              }}
            >
              On signup with GharPar, when you are referred by some existing
              user, first milestone will be active. You have to complete first 3
              orders with GharPar and you will get discounts on first 3 orders
              as follows:
            </p>
            <ul
              style={{
                textAlign: "left",
                font: "normal normal medium 12px/24px Montserrat",
                letterSpacing: "0px",
                color: "#91919D",
                opacity: " 1",
              }}
            >
              <li>On first order, you will get 18% discount.</li>
              <li>On second order, you will get 15% discount.</li>
              <li>On third order, you will get 10% discount.</li>
            </ul>
            <p
              style={{
                textAlign: "left",
                font: "normal normal medium 12px/24px Montserrat",
                letterSpacing: "0px",
                color: "#91919D",
                opacity: " 1",
              }}
            >
              As you completes first 3 orders with GharPar, 2nd milestone will
              be active.
            </p>
            <img src={Step1} alt="step-1" style={{ textAlign: "center" }} />
          </Colxx>
          <Colxx xs="4"></Colxx>
        </Row>
        <Row>
          <Colxx xs="4"></Colxx>
          <Colxx xs="4" className="p-4">
            <h3
              className="mt-5"
              style={{
                font: "normal normal bold 13px/16px Montserrat",
                letterSpacing: "6.5px",
                color: "#91919D",
                textTransform: "uppercase",
                opacity: "1",
              }}
            >
              STEP NO. 2
            </h3>
            <h1
              style={{
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "0px",
                color: "#000",
                textTransform: "uppercase",
                opacity: "1",
                fontSize: "35px",
              }}
            >
              Share your Referral code with your friends and family members.
            </h1>
            <p
              style={{
                textAlign: "left",
                font: "normal normal medium 12px/24px Montserrat",
                letterSpacing: "0px",
                color: "#91919D",
                opacity: " 1",
              }}
            >
              On completion of 1st milestone, you will able to get your referral
              code and you can share to maximum number of new users. This
              milestone card also showing the statistics of new signups using
              your referral code and number of users those completed their first
              orders with GharPar.
            </p>
            <p
              style={{
                textAlign: "left",
                font: "normal normal medium 12px/24px Montserrat",
                letterSpacing: "0px",
                color: "#91919D",
                opacity: " 1",
              }}
            >
              As sign up users and ordered users count gets 3, your next
              milestone will be active.
            </p>
            <img src={Step2} alt="step-2" style={{ textAlign: "center" }} />
          </Colxx>
          <Colxx xs="4"></Colxx>
        </Row>
        <Row style={{ backgroundColor: "#f9f5f0" }}>
          <Colxx xs="4"></Colxx>
          <Colxx xs="4" className="p-4">
            <h3
              className="mt-5"
              style={{
                font: "normal normal bold 13px/16px Montserrat",
                letterSpacing: "6.5px",
                color: "#91919D",
                textTransform: "uppercase",
                opacity: "1",
              }}
            >
              STEP NO. 3
            </h3>
            <h1
              style={{
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "0px",
                color: "#000",
                textTransform: "uppercase",
                opacity: "1",
                fontSize: "35px",
              }}
            >
              Redeem Free Service
            </h1>
            <p
              style={{
                textAlign: "left",
                font: "normal normal medium 12px/24px Montserrat",
                letterSpacing: "0px",
                color: "#91919D",
                opacity: " 1",
              }}
            >
              You will be able to redeem your <b>FREE SERVICE</b> when you have
              at least 3 sign up users and 3 ordered users.
            </p>
            <img src={Step3} alt="step-3" style={{ textAlign: "center" }} />
          </Colxx>
          <Colxx xs="4"></Colxx>
        </Row>
      </div>
    );
  }
}

export default download;
