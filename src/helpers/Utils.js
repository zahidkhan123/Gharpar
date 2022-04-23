import { defaultDirection } from "../constants/defaultValues";
import React from "react";
import { NotificationManager } from "../components/common/react-notifications";
import { socketPath } from "../constants/defaultValues";

export const mapOrder = (array, order, key) => {
  array.sort(function (a, b) {
    var A = a[key],
      B = b[key];
    if (order.indexOf(A + "") > order.indexOf(B + "")) {
      return 1;
    } else {
      return -1;
    }
  });
  return array;
};

export const getDateWithFormat = () => {
  const today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!

  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  return dd + "." + mm + "." + yyyy;
};

export const getCurrentTime = () => {
  const now = new Date();
  return now.getHours() + ":" + now.getMinutes();
};

export const getDirection = () => {
  let direction = defaultDirection;
  if (localStorage.getItem("direction")) {
    const localValue = localStorage.getItem("direction");
    if (localValue === "rtl" || localValue === "ltr") {
      direction = localValue;
    }
  }
  return {
    direction,
    isRtl: direction === "rtl",
  };
};

export const setDirection = (localValue) => {
  let direction = "ltr";
  if (localValue === "rtl" || localValue === "ltr") {
    direction = localValue;
  }
  localStorage.setItem("direction", direction);
};

export const capitalizeFirstLetter = (str) => {
  if (str === undefined || str === null) {
    return;
  }
  return str?.charAt(0)?.toUpperCase() + str?.slice(1);
};

export const getImage = (user, page) => {
  let image_url = null;
  let image_html = <></>;

  if (user.profile_photo_url !== null) {
    image_url = user.profile_photo_url;
  } else if (user.profile_picture !== null) {
    image_url = user.profile_picture;
  }

  if (image_url === null) {
    // Image URL not found
    let fn = user.first_name.charAt(0);
    let ln = user.last_name.charAt(0);

    if (page === "show") {
      image_html = (
        <div className="circle">
          <span className="initials">
            {fn}
            {ln}
          </span>
        </div>
      );
    } else if (page === "listing") {
      image_html = (
        <div className="circle-tech">
          <span className="initials-tech">
            {fn}
            {ln}
          </span>
        </div>
      );
    }
  } else {
    // Image found
    if (page === "show") {
      image_html = (
        <img alt="Client" src={image_url} className="user-img ml-3" />
      );
    } else if (page === "listing") {
      image_html = (
        <img
          alt="Client"
          src={image_url}
          className="user-img"
          style={{
            width: "50px",
            height: "50px",
          }}
        />
      );
    }
  }

  return image_html;
};

export const check_permission = async (controller_action, url) => {
  let permission = false;
  let controller_name = controller_action.split("/")[0] + "_permissions";
  let action_name = controller_action.split("/")[1];
  let controller_permissions = JSON.parse(
    localStorage.getItem(controller_name)
  );
  if (controller_name && controller_permissions !== null) {
    controller_permissions.map((controller_permission) => {
      if (action_name === controller_permission.action_name) {
        if (controller_permission.is_enabled) {
          if (url !== "") {
            window.location.assign(url);
          } else {
            permission = controller_permission.is_enabled;
          }
        } else {
          NotificationManager.error(
            "You are not authorized to access this page",
            "",
            5000,
            () => {},
            null,
            "filled"
          );
        }
      }
      return controller_permission;
    });
  } else {
    NotificationManager.error(
      "You are not authorized to access this page",
      "",
      5000,
      () => {},
      null,
      "filled"
    );
  }
  return permission;
};

export const showAlertSuccess = (data) => {
  let alert_content =
    "<b> JobID: " +
    data.job_code +
    " , " +
    data.job_status +
    " </b> by <b>" +
    data.technician_name +
    "</b>";
  var html = <div dangerouslySetInnerHTML={{ __html: alert_content }} />;
  NotificationManager.success(html, "", 50000, () => {}, null, "filled");
};

export const showAlertNewOrder = (data) => {
  let alert_content = "New Order# <b>" + data.order_id + " </b> is here ";
  var html = <div dangerouslySetInnerHTML={{ __html: alert_content }} />;
  NotificationManager.success(html, "", 60000, () => {}, null, "filled");
};

export const showAlertNewComment = (data) => {
  let alert_content =
    "<b>" +
    data.sent_by +
    "</b> commented on # <b>" +
    data.order_id +
    " </b> <br>" +
    data.message;
  var html = <div dangerouslySetInnerHTML={{ __html: alert_content }} />;
  NotificationManager.success(html, "", 60000, () => {}, null, "filled");
};

export const showAlert = (data) => {
  let alert_content =
    "Technician: <b>" +
    data.technician_name +
    "</b> is in trouble Please contact @ <b>" +
    data.phone +
    "</b>";
  var html = <div dangerouslySetInnerHTML={{ __html: alert_content }} />;
  NotificationManager.error(
    html,
    "Alert!",
    5000000000000000,
    () => {},
    null,
    "filled"
  );
};

export const connect_socket = async (channel_name, order_id) => {
  let subscribe_data = {};
  if (channel_name === "OrderChannel") {
    subscribe_data = {
      command: "subscribe",
      identifier: JSON.stringify({
        channel: channel_name,
        order_id: order_id,
      }),
    };
  } else {
    subscribe_data = {
      command: "subscribe",
      identifier: JSON.stringify({
        channel: channel_name,
      }),
    };
  }
  if ("WebSocket" in window) {
    // alert("WebSocket is supported by your Browser!");
    var ws = new WebSocket(
      socketPath + "?api_auth_token=" + localStorage.getItem("auth_token")
    );

    ws.onopen = function (data) {
      var i = JSON.stringify(subscribe_data);

      // var j = JSON.stringify({
      //   command: "message",
      //   identifier: JSON.stringify({
      //     channel: "RestaurantChannel",
      //   }),
      //   data: JSON.stringify(
      //     {
      //       action: "avaster_action",
      //       data: {
      //         model_name: "AgMessage",
      //         action_name: "sdsd",
      //         conversation: {
      //           id: 1,
      //           message: {
      //             message: "text",
      //             message_type: "text",
      //             conversation_id: 1,
      //           },
      //         },
      //       },
      //     }
      //     // {
      //     //   "action": "accep_reject_order",
      //     //   "id": 1,
      //     //   "is_accepted": true
      //     // }
      //   ),
      // });

      var response = ws.send(i);
      console.log(response);
      // setTimeout(function () {
      //   var response1 = ws.send(j);
      // }, 1000);
    };

    ws.onmessage = function (evt) {
      var received_msg = evt.data;
      var json_obj = JSON.parse(received_msg);
      var data = json_obj["message"];
      if (data !== undefined && data.is_reload) {
        window.location.reload();
      } else if (data !== undefined && data.is_order_message) {
        showAlertNewComment(data);
        var sent_by_element = document.getElementById("last_message_sent_by");
        var message_element = document.getElementById("last_message_content");
        var time_element = document.getElementById("last_message_time");
        var count_element = document.getElementById("comments_count");
        var comment_btn_element = document.getElementById("comments_btn");
        if (sent_by_element !== null) {
          sent_by_element.textContent = data.sent_by;
        }
        if (message_element !== null) {
          message_element.textContent = ": " + data.message;
        }
        if (time_element !== null) {
          time_element.textContent = data.created_at;
        }
        if (count_element !== null) {
          count_element.textContent = data.messages_count;
        }
        if (comment_btn_element !== null) {
          comment_btn_element.textContent = "View All";
        }
      } else if (data !== undefined && data.is_high_alert) {
        console.log("show alet");
        showAlert(data);
      } else if (data !== undefined && data.is_job_status_changed) {
        showAlertSuccess(data);
      } else if (data !== undefined && data.is_new_order) {
        showAlertNewOrder(data);
      }
      console.log("Rcvd", json_obj["message"]);
    };

    ws.onclose = function () {
      console.log("Connection is closed...");
      // alert("Connection is closed...");
    };
  } else {
    alert("WebSocket NOT supported by your Browser!");
  }
};
