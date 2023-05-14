import * as React from "react";
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";


const ProjectPage = () => {
    const [t, _] = useTranslation();

    return (
      <div className="page">
         <div className="pageproject">
           <h1>{t('projectPage.pagetitle')}</h1>
           <div className="simdegif"><img className="img-responsive" alt="simdegif" src="https://i.imgur.com/50m9kzv.gif"></img></div>
           <h2>{t('projectPage.watsimde')}</h2>
           <p>{t('projectPage.simdedescription1')}</p>
           <p>{t('projectPage.simdedescription2')}</p>
           <p>{t('projectPage.simdedescription3')}</p>
           <h2>{t('projectPage.tecnology')}</h2>
           <p>{t('projectPage.tecnologydescription')}</p>
           <h2>{t('projectPage.howtouse')}</h2>
           <Link to="/superescalar"><p>{t('projectPage.howtousedescription')}</p></Link>
           <h2>{t('projectPage.problems')}</h2>
           <a href="https://etsiiull.gitbooks.io/simde/"><p>{t('projectPage.problemsdescription')}</p></a>
         </div>
      </div>
    );
}

export default ProjectPage;
