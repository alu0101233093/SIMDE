import * as React from "react";
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import { useTranslation } from "react-i18next";

const ActivitiesPageComponent = (props) => {
    const [t, i18n] = useTranslation();

    return (
      <div className="page">
        <div className="topnav">
          <ul className="navul">
            <b className="navbaricon"><img alt="icon" src="https://adiumxtras.com/images/pictures/futuramas_bender_dock_icon_1_8169_3288_image_4129.png"></img></b>
            <li className="pagetitle"><p>{t('landingPage.pagetitle')}</p></li>
            <li><Link to="/">{t('landingPage.home')}</Link></li>
            <li><Link to="/Project">{t('landingPage.project')}</Link></li>
            <li><Link to="/Activities">{t('landingPage.activities')}</Link></li>
            <li style={{ float: 'right' }}><Link to="/LogIn">{t('landingPage.logIn')}</Link></li>
          </ul>
        </div>
        <div className="pageproject">
           
           <h2>{t('projectPage.howtouse')}</h2>
           <Link to="/superescalar"><p>{t('projectPage.howtousedescription')}</p></Link>
           <h2>{t('projectPage.problems')}</h2>
           <a href="https://etsiiull.gitbooks.io/simde/"><p>{t('projectPage.problemsdescription')}</p></a>
         </div>
        <nav className="footer navbar navbar-default navbar-fixed-bottom sticky">
          <div className="licence text-light"><a>{t('landingPage.licency')}</a></div>
        </nav>
      </div>
    );
}

export default ActivitiesPageComponent;
