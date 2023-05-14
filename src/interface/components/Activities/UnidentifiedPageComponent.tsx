import * as React from "react";
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";

const UnidentifiedPageComponent = (props) => {
  const [t, i18n] = useTranslation();

  return (
    <div className="page">
      <h1>{t("LogInPage.UnidentifiedPageComponent")}</h1>
    </div>
  );
}

export default UnidentifiedPageComponent;
