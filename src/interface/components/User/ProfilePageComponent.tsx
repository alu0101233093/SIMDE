import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { connect, useDispatch } from "react-redux";
import { database } from "../../../main";
import { child, equalTo, get, orderByChild, query, ref } from "firebase/database";
import { Navigate, useNavigate } from "react-router";
import swal from 'sweetalert';

interface UserData {
  lastName: string;
  email: string;
  name: string;
  role: string;
  activities: Record<string, { actualPhase: number }>;
}

const ProfilePageComponent = (props) => {
  const navigate = useNavigate();
  if (!props.logged) {
    navigate("/logIn");
  }

  const dbRef = ref(database);
  const [t, _] = useTranslation();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState<UserData>({
    lastName: "",
    email: "",
    name: "",
    role: "",
    activities: {},
  });

  useEffect(() => {
    get(child(dbRef, 'Users/' + props.userID))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (JSON.stringify(data) !== JSON.stringify(userData)) {
            setUserData(data);
          }
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [props.logged]);

  const handleLogout = async (event) => {
    event.preventDefault();
    await swal("Successfully logged out!", "Redirecting to landing page...", "success");
    dispatch({ type: "LOGEDOUT"});
    navigate("/");
  };

  const handleDeleteUser = async (event) => {
    event.preventDefault();
    await swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this user!",
      icon: "warning",
      buttons: ["Stop", "Delete it"],
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        swal("Poof! Your imaginary file has been deleted!", {
          icon: "success",
        });
        dispatch({ type: "LOGEDOUT"});
      }
    });
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-4 text-center">
          <img
            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
            alt="Profile"
            className="img-thumbnail"
            style={{ width: "200px", height: "200px", objectFit: "cover" }}
          />
        </div>
        <div className="col-md-8">
          <p className="h4">
            <strong>Name:</strong> {userData.name} {userData.lastName}
          </p>
          <p className="h4">
            <strong>Email:</strong> {userData.email}
          </p>
          <p className="h4">
            <strong>Rol:</strong> {userData.role}
          </p>
          <div className="mt-3">
            <button className="btn btn-danger" onClick={handleLogout}>
              Cerrar sesión
            </button>
            <button className="btn btn-danger m-5" onClick={handleDeleteUser}>
              Eliminar usuario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    userID: state.User.userID,
    logged: state.User.logged,
  };
};

export default connect(mapStateToProps)(ProfilePageComponent);

