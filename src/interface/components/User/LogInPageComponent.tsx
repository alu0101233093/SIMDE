import * as React from "react";
import { BrowserRouter as Router, Route, Link} from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import { getAuth } from "firebase/auth"
// import { useFirebaseApp } from "reactfire";
import { app } from "../../../main";
import { useDispatch } from "react-redux";

const LogInPageComponent = () => {
  const [LogInEmail, setLogInEmail] = React.useState('');
  const [LogInPassword, setLogInPassword] = React.useState('');
  const [SignInEmail, setSignInEmail] = React.useState('');
  const [SignInPassword, setSignInPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [t, _] = useTranslation();
  const dispatch = useDispatch();

  const handleLogInEmailChange = (event) => {
    setLogInEmail(event.target.value);
  };

  const handleSignInEmailChange = (event) => {
    setSignInEmail(event.target.value);
  };

  const handleLogInPasswordChange = (event) => {
    setLogInPassword(event.target.value);
  };

  const handleSignInPasswordChange = (event) => {
    setSignInPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(getAuth(app), LogInEmail, LogInPassword);
      alert('Successfully logged in!');
      // redirigir a la página de inicio de sesión exitosa
      dispatch({ type: "LOGEDIN", value: LogInEmail });
    } catch (error) {
      //console.error('Error logging in:', error);
      alert('Error logging in:');
    }
  };

  const handleSignInSubmit = async (event) => {
    event.preventDefault();
    if (SignInPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (SignInPassword.length < 6) {
      alert('Password needs to have at least 6 characters');
      return;
    }
    try {
      await createUserWithEmailAndPassword(getAuth(app), SignInEmail, SignInPassword);
      alert('Successfully registered!');
      // redirigir a la página de inicio de sesión exitosa
    } catch (error) {
      console.error('Error registering:', error);
      alert('Error registering:');
    }
  };
  
  return (
  <div className="page">
    <h1 className="text-center mb-5">
      Te damos la bienvenida a SIMDE Web
    </h1>
    <div className="container">
      <div className="row">
        <div className="col-md-5">
          <div className="card">
            <div className="card-header text-center">{t('LogInPage.signIn')}</div>
            <div className="card-body">
              <form onSubmit={handleSignInSubmit}>
                <div className="form-group m-3">
                  <label htmlFor="email">{t('LogInPage.emailLabel')}</label>
                  <input type="email" id="email" className="form-control" value={SignInEmail} onChange={handleSignInEmailChange} />
                </div>
                <div className="form-group m-3">
                  <label htmlFor="password">{t('LogInPage.passwordLabel')}</label>
                  <input type="password" id="password" className="form-control" value={SignInPassword} onChange={handleSignInPasswordChange} />
                </div>
                <div className="form-group m-3">
                  <label htmlFor="confirmPassword">{t('LogInPage.confirmPasswordLabel')}</label>
                  <input type="password" id="confirmPassword" className="form-control" value={confirmPassword} onChange={handleConfirmPasswordChange} />
                </div>
                <button type="submit" className="btn btn-primary btn-block m-3">{t('LogInPage.signIn')}</button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-2"></div>
        <div className="col-md-5">
          <div className="card">
            <div className="card-header text-center">{t('LogInPage.logIn')}</div>
            <div className="card-body">
              <form onSubmit={handleFormSubmit}>
                <div className="form-group m-3">
                  <label htmlFor="loginEmail">{t('LogInPage.emailLabel')}</label>
                  <input type="email" id="loginEmail" className="form-control" value={LogInEmail} onChange={handleLogInEmailChange} />
                </div>
                <div className="form-group m-3">
                  <label htmlFor="loginPassword">{t('LogInPage.passwordLabel')}</label>
                  <input type="password" id="loginPassword" className="form-control" value={LogInPassword} onChange={handleLogInPasswordChange} />
                </div>
                <button type="submit" className="btn btn-primary btn-block m-3">{t('LogInPage.logIn')}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

export default LogInPageComponent;
