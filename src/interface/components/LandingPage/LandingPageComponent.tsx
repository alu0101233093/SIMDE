import * as React from "react";
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
// import projectpage from "./ProjectPageComponent";  // Unused?
import { useTranslation } from "react-i18next";


const LandingPageComponent = () => {
    const [t, _] = useTranslation();

    return (
      <div className="page">
         <div className="pagecontent">
           <div className="row">
            <div className=" architecture col-3 col-sm-12 col-md-12 col-lg-12">
              <div className="jumbotron">
                <div className="container">
                  <h1 className="display-2">{t('landingPage.pagetitle')}</h1>
                  <p>{t('landingPage.description')}</p>
                  <p><Link className="btn btn-primary btn-lg" to="/Project">{t('landingPage.read')}</Link></p>
                </div>
              </div>
              <div className="thumbnail">
                <img src="" alt=""></img>
                <div className="caption">
                  <h3>{t('landingPage.superescalar')}</h3>
                  <p>{t('landingPage.superescalar_description')}</p>
                  <div className="pagebtngroup">
                    <Link className="btn btn-primary" to="/superescalar">{t('landingPage.go')}</Link><a className="pagebtn btn btn-light" href="https://etsiiull.gitbooks.io/simde/">{t('landingPage.read')}</a>
                  </div>
                </div>
              </div>
              <div className="thumbnail">
                <img src="" alt=""></img>
                <div className="caption">
                  <h3>{t('landingPage.vliw')}</h3>
                  <p>{t('landingPage.vliw_description')}</p>
                  <div className="pagebtngroup">
                    <Link className="btn btn-primary" to="/VLIW">{t('landingPage.go')}</Link><a className="pagebtn btn btn-light" href="https://etsiiull.gitbooks.io/simde/">{t('landingPage.read')}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

export default LandingPageComponent;
