import * as React from "react";
import { BrowserRouter as Router, Route, Link, Navigate, useNavigate} from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';


import { getAuth } from "firebase/auth"
import { app, database } from "../../../main";
import { useDispatch } from "react-redux";
import { equalTo, get, orderByChild, push, query, ref, set } from "firebase/database";

import swal from 'sweetalert';
import { Sign } from "crypto";

const LogInPageComponent = () => {
  const [LogInEmail, setLogInEmail] = React.useState('');
  const [LogInPassword, setLogInPassword] = React.useState('');
  const [SignInEmail, setSignInEmail] = React.useState('');
  const [SignInName, setSignInName] = React.useState('');
  const [SignInPassword, setSignInPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [t, _] = useTranslation();
  const usersRef = ref(database, "Users");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogInEmailChange = (event) => {
    setLogInEmail(event.target.value);
  };

  const handleSignInEmailChange = (event) => {
    setSignInEmail(event.target.value);
  };

  const handleSignInNameChange = (event) => {
    setSignInName(event.target.value);
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

  const handleLogInSubmit = async (event) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(getAuth(app), LogInEmail, LogInPassword);
      // para guardar la ID del usuario en el estado
      const emailQuery = await get(query(usersRef, orderByChild("email"), equalTo(LogInEmail)));
      const users = emailQuery.val();
      const userID = Object.keys(users)[0];
      dispatch({ type: "LOGEDIN", value: userID });
      // redirigiendo a mis actividades
      await swal("Successfully logged in!", "Redirecting to my activities...", "success");
      navigate("/myactivities");
    } catch (error) {
      console.error(error);
      swal("Error logging in", String(error), "error");
    }
  };

  const handleSignInSubmit = async (event) => {
    event.preventDefault();
    if (SignInPassword !== confirmPassword) {
      swal("Passwords do not match", "Try again", "info");
      return;
    }
    if (SignInPassword.length < 6) {
      swal("Password too short", "Password needs to have at least 6 characters", "info");
      return;
    }
    if (SignInName.length < 1) {
      swal("Invalid name", "Name is required to complete the sign in", "info");
      return;
    }
    try {
      let uid: string = ""
      // Creación del usuario en Firebase Authentication
      await createUserWithEmailAndPassword(getAuth(app), SignInEmail, SignInPassword)
      .then((userCredential) => {
        const user = userCredential.user;
        uid = user.uid;
      });
      // Se guarda el nuevo usuario en Firebase RTDB
      await set(ref(database,"Users/" + uid), {
        email: SignInEmail,
        name: SignInName,
        role: "student"
      });
      // Inicio de sesión
      await signInWithEmailAndPassword(getAuth(app), SignInEmail, SignInPassword);
      // Se guarda la ID del usuario en el estado
      const emailQuery = await get(query(usersRef, orderByChild("email"), equalTo(SignInEmail)));
      const users = emailQuery.val();
      const userID = Object.keys(users)[0];
      dispatch({ type: "LOGEDIN", value: userID });
      // Redirigiendo a profile 
      await swal("Successfully registered!", "Redirecting to Profile...", "success");
      navigate("/Profile");
    } catch (error) {
      console.error(error);
      swal("Error registering", String(error), "error");
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
  
    try {
      const result = await signInWithPopup(getAuth(app), provider);
      const user = result.user;
      
      let uid = user.uid;
  
      const userQuery = await get(query(usersRef, orderByChild("email"), equalTo(SignInEmail)));
      const users = userQuery.val();

      // Si el usuario no existe, se crea.
      if(!users) {
        await set(ref(database,"Users/" + uid), {
          email: user.email,
          name: user.displayName,
          role: "student"
        });
      }
      
      // Dispatch the user ID.
      dispatch({ type: "LOGEDIN", value: uid });
  
      // Navigate to profile.
      navigate("/MyActivities");
    } catch (error) {
      console.error(error);
      swal("Error registering", String(error), "error");
    }
  };  
  
  return (
  <div className="page  pt-5">
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
                  <label htmlFor="name">Nombre</label>
                  <input type="name" id="name" className="form-control" value={SignInName} onChange={handleSignInNameChange} />
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
              <form onSubmit={handleLogInSubmit}>
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
          <button type="button" className="btn btn-danger btn-block mt-5" onClick={handleGoogleSignIn}>
            Utilizar una cuenta de Google
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}

export default LogInPageComponent;