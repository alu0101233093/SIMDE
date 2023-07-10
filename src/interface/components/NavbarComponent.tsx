import React from "react";
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";

const NavbarComponent = (props) => {
  const [t, _] = useTranslation();

  return (
    <div className="topnav">
      <ul className="navul">
        <b className="navbaricon">
          <img
            alt="icon"
            src="https://adiumxtras.com/images/pictures/futuramas_bender_dock_icon_1_8169_3288_image_4129.png"
          ></img>
        </b>
        <li className="pagetitle">
          <p>{t("LogInPage.pagetitle")}</p>
        </li>
        <li>
          <Link to="/">{t("LogInPage.home")}</Link>
        </li>
        <li>
          <Link to="/Project">{t("LogInPage.project")}</Link>
        </li>
        <li>
          <Link to="/Activities">{t("LogInPage.activities")}</Link>
        </li>
        {props.logged ? (
          <div>
            <li style={{ float: "right" }}>
              <Link to="/Profile">Perfil</Link>
            </li>
            <li style={{ float: "right" }}>
              <Link to="/MyActivities">{t("LogInPage.myactivities")}</Link>
            </li>
          </div>
          ) : (
          <li style={{ float: "right" }}>
            <Link to="/LogIn">{t("LogInPage.logIn")}</Link>
          </li>
          )}
      </ul>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    userEmail: state.User.userEmail,
    logged: state.User.logged
  }
}

export default connect(mapStateToProps)(NavbarComponent);