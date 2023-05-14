import * as React from "react";
import { BrowserRouter as Router, Route, Link} from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { UserState } from "../reducers/user";
import { store } from "../../store";

const NavbarComponent = () => {
  const [t, _] = useTranslation();

  return (
    <div className="topnav mb-5">
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
        <li style={{ float: "right" }}>
          <Link to="/LogIn">{t("LogInPage.logIn")}</Link>
        </li>
      </ul>
    </div>
  );
}

export default NavbarComponent;
