import * as React from "react";
import { BrowserRouter as Router, Route, Link} from 'react-router-dom';
import { useTranslation } from "react-i18next";

const FooterComponent = () => {
  const [t, _] = useTranslation();

  return (
    <nav className="footer navbar navbar-dark bg-dark fixed-bottom">
      <div className="licence text-light">
        <a>{t("projectPage.licency")}</a>
      </div>
    </nav>
  );
}

export default FooterComponent;
