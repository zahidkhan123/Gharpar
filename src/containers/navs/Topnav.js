import React, { Component } from "react";
import { injectIntl } from "react-intl";

import {
  UncontrolledDropdown,
  DropdownItem,
  DropdownToggle,
  DropdownMenu,
  Badge,
} from "reactstrap";
import { NavLink, Link } from "react-router-dom";
import axios from "axios";
import { connect } from "react-redux";
import { servicePath } from "../../constants/defaultValues";
import { NotificationManager } from "../../components/common/react-notifications";
import { trackPromise } from "react-promise-tracker";
import {
  setContainerClassnames,
  clickOnMobileMenu,
  logoutUser,
  changeLocale,
} from "../../redux/actions";

import {
  menuHiddenBreakpoint,
  searchPath,
  isDarkSwitchActive,
} from "../../constants/defaultValues";

import { MenuIcon } from "../../components/svg";
import TopnavDarkSwitch from "./Topnav.DarkSwitch";

import { getDirection, setDirection } from "../../helpers/Utils";
class TopNav extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isInFullScreen: false,
      searchKeyword: "",
      user: {},
    };
  }

  componentDidMount = async () => {
    // let user_id = localStorage.getItem("user_id");
    // let user = await this.get_user(user_id);
    // localStorage.setItem("user_default_role", user.default_role);
    // this.setState({
    // user: user,
    // });
  };

  get_user = async (user_id) => {
    let userObj = {};

    await axios({
      method: "get",
      url: servicePath + "/api/v2/users/" + user_id + ".json",
      headers: {
        "Content-Type": "multipart/form-data",
        "AUTH-TOKEN": localStorage.getItem("auth_token"),
      },
    })
      .then((response) => {
        if (response.status === 200) {
          userObj = response.data;
        } else {
          console.log(response);
        }
      })
      .catch((error) => {
        if (
          error.response.data.message ===
          "Your session expired. Please login again."
        ) {
          localStorage.removeItem("auth_token");
          this.props.history.push("/user/login");
        } else {
          NotificationManager.error(
            error.response.data.message,
            "",
            5000,
            () => {
              alert("callback");
            },
            null,
            "filled"
          );
          localStorage.removeItem("auth_token");
          this.props.history.push("/user/login");
          console.log("error", error);
        }
      });
    return userObj;
  };

  handleChangeLocale = (locale, direction) => {
    this.props.changeLocale(locale);

    const currentDirection = getDirection().direction;
    if (direction !== currentDirection) {
      setDirection(direction);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };
  isInFullScreen = () => {
    return (
      (document.fullscreenElement && document.fullscreenElement !== null) ||
      (document.webkitFullscreenElement &&
        document.webkitFullscreenElement !== null) ||
      (document.mozFullScreenElement &&
        document.mozFullScreenElement !== null) ||
      (document.msFullscreenElement && document.msFullscreenElement !== null)
    );
  };
  handleSearchIconClick = (e) => {
    if (window.innerWidth < menuHiddenBreakpoint) {
      let elem = e.target;
      if (!e.target.classList.contains("search")) {
        if (e.target.parentElement.classList.contains("search")) {
          elem = e.target.parentElement;
        } else if (
          e.target.parentElement.parentElement.classList.contains("search")
        ) {
          elem = e.target.parentElement.parentElement;
        }
      }

      if (elem.classList.contains("mobile-view")) {
        this.search();
        elem.classList.remove("mobile-view");
        this.removeEventsSearch();
      } else {
        elem.classList.add("mobile-view");
        this.addEventsSearch();
      }
    } else {
      this.search();
    }
  };
  addEventsSearch = () => {
    document.addEventListener("click", this.handleDocumentClickSearch, true);
  };
  removeEventsSearch = () => {
    document.removeEventListener("click", this.handleDocumentClickSearch, true);
  };

  handleDocumentClickSearch = (e) => {
    let isSearchClick = false;
    if (
      e.target &&
      e.target.classList &&
      (e.target.classList.contains("navbar") ||
        e.target.classList.contains("simple-icon-magnifier"))
    ) {
      isSearchClick = true;
      if (e.target.classList.contains("simple-icon-magnifier")) {
        this.search();
      }
    } else if (
      e.target.parentElement &&
      e.target.parentElement.classList &&
      e.target.parentElement.classList.contains("search")
    ) {
      isSearchClick = true;
    }

    if (!isSearchClick) {
      const input = document.querySelector(".mobile-view");
      if (input && input.classList) input.classList.remove("mobile-view");
      this.removeEventsSearch();
      this.setState({
        searchKeyword: "",
      });
    }
  };
  handleSearchInputChange = (e) => {
    this.setState({
      searchKeyword: e.target.value,
    });
  };
  handleSearchInputKeyPress = (e) => {
    if (e.key === "Enter") {
      this.search();
    }
  };

  search = () => {
    this.props.history.push(searchPath + "/" + this.state.searchKeyword);
    this.setState({
      searchKeyword: "",
    });
  };

  toggleFullScreen = () => {
    const isInFullScreen = this.isInFullScreen();

    var docElm = document.documentElement;
    if (!isInFullScreen) {
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
      } else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
      } else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
      } else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    this.setState({
      isInFullScreen: !isInFullScreen,
    });
  };

  handleLogout = async () => {
    let self = this;
    await trackPromise(
      axios({
        method: "post",
        url: servicePath + "/api/v2/user_sessions/logout.json",
        headers: {
          "Content-Type": "multipart/form-data",
          "AUTH-TOKEN": localStorage.getItem("auth_token"),
          "IS-ACCESSIBLE": true,
        },
      })
    )
      .then((response) => {
        if (response.status === 200) {
          localStorage.clear();
          self.props.logoutUser(this.props.history);
        } else {
          console.log(response);
        }
      })
      .catch((error) => {
        NotificationManager.error(
          error.response.data.message,
          "",
          5000,
          () => {
            alert("callback");
          },
          null,
          "filled"
        );
        console.log("error", error);
      });
  };

  menuButtonClick = (e, menuClickCount, containerClassnames) => {
    e.preventDefault();

    setTimeout(() => {
      var event = document.createEvent("HTMLEvents");
      event.initEvent("resize", false, false);
      window.dispatchEvent(event);
    }, 350);
    this.props.setContainerClassnames(
      ++menuClickCount,
      containerClassnames,
      this.props.selectedMenuHasSubItems
    );
  };
  mobileMenuButtonClick = (e, containerClassnames) => {
    e.preventDefault();
    this.props.clickOnMobileMenu(containerClassnames);
  };

  render() {
    const { containerClassnames, menuClickCount } = this.props;
    let first_name = localStorage.getItem("user_first_name");
    let last_name = localStorage.getItem("user_last_name");
    let default_role = localStorage.getItem("user_default_role");
    return (
      <>
        <nav className="navbar fixed-top">
          <div className="d-flex align-items-center navbar-left">
            <NavLink
              to="#"
              location={{}}
              className="menu-button d-none d-md-block"
              onClick={(e) =>
                this.menuButtonClick(e, menuClickCount, containerClassnames)
              }
            >
              <MenuIcon />
            </NavLink>
            {/* <NavLink
            to="#"
            location={{}}
            className="menu-button-mobile d-xs-block d-sm-block d-md-none"
            onClick={e => this.mobileMenuButtonClick(e, containerClassnames)}
          >
            <MobileMenuIcon />
          </NavLink> */}

            {/* <div className="search" data-search-path="/app/pages/search">
            <Input
              name="searchKeyword"
              id="searchKeyword"
              placeholder={messages["menu.search"]}
              value={this.state.searchKeyword}
              onChange={e => this.handleSearchInputChange(e)}
              onKeyPress={e => this.handleSearchInputKeyPress(e)}
            />
            <span
              className="search-icon"
              onClick={e => this.handleSearchIconClick(e)}
            >
              <i className="simple-icon-magnifier" />
            </span>
          </div> */}

            {/* <div className="d-inline-block">
            <UncontrolledDropdown className="ml-2">
              <DropdownToggle
                caret
                color="light"
                size="sm"
                className="language-button">
                <span className="name">{locale.toUpperCase()}</span>
              </DropdownToggle>
              <DropdownMenu className="mt-3" right>
                {localeOptions.map(l => {
                  return (
                    <DropdownItem
                      onClick={() => this.handleChangeLocale(l.id, l.direction)}
                      key={l.id}
                    >
                      {l.name}
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            </UncontrolledDropdown>
          </div> */}
            {/* <div className="position-relative d-none d-none d-lg-inline-block">
            <a
              className="btn btn-outline-primary btn-sm ml-2"
              target="_top"
              href="https://themeforest.net/cart/configure_before_adding/22544383?license=regular&ref=ColoredStrategies&size=source"
            >
              <IntlMessages id="user.buy" />
            </a>
          </div> */}
          </div>
          <a className="navbar-logo" href="/">
            <span className="logo d-none d-xs-block" />
            <span className="logo-mobile d-block d-xs-none" />
          </a>

          <div className="navbar-right">
            {isDarkSwitchActive && <TopnavDarkSwitch />}
            {/* <div className="header-icons d-inline-block align-middle">
            <TopnavEasyAccess />
            <TopnavNotifications />
            <button
              className="header-icon btn btn-empty d-none d-sm-inline-block"
              type="button"
              id="fullScreenButton"
              onClick={this.toggleFullScreen}
            >
              {this.state.isInFullScreen ? (
                <i className="simple-icon-size-actual d-block" />
              ) : (
                <i className="simple-icon-size-fullscreen d-block" />
              )}
            </button>
          </div> */}
            <div className="user d-inline-block">
              <UncontrolledDropdown className="dropdown-menu-right">
                <DropdownToggle className="p-0" color="empty">
                  <span className="name mr-1">
                    {first_name} {last_name}{" "}
                    <Badge color="success">{default_role}</Badge>
                  </span>
                  <span>
                    <img alt="Profile" src="/assets/img/profile-pic-l.jpg" />
                  </span>
                </DropdownToggle>
                <DropdownMenu className="mt-3" right>
                  {/* <DropdownItem>Account</DropdownItem>
                <DropdownItem>Features</DropdownItem>
                <DropdownItem>History</DropdownItem>
                <DropdownItem>Support</DropdownItem>
                <DropdownItem divider /> */}
                  <Link to={`/app/csr/change_password`}>
                    <DropdownItem>Change Password</DropdownItem>
                  </Link>
                  <DropdownItem onClick={() => this.handleLogout()}>
                    Sign out
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>
          </div>
        </nav>
      </>
    );
  }
}

const mapStateToProps = ({ menu, settings }) => {
  const { containerClassnames, menuClickCount, selectedMenuHasSubItems } = menu;
  const { locale } = settings;
  return {
    containerClassnames,
    menuClickCount,
    selectedMenuHasSubItems,
    locale,
  };
};
export default injectIntl(
  connect(mapStateToProps, {
    setContainerClassnames,
    clickOnMobileMenu,
    logoutUser,
    changeLocale,
  })(TopNav)
);
