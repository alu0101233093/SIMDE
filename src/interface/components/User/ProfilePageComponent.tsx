import * as React from "react";
import { BrowserRouter as Router, Route, Link} from 'react-router-dom';
import { useTranslation } from "react-i18next";
// import { useFirebaseApp } from "reactfire";
import { app, database } from "../../../main";
import { child, get, getDatabase, onValue, ref, set } from "firebase/database";


interface UserData {
  lastName: string;
  email: string;
  name: string;
  role: string;
  activities: Record<string, {actualPhase: number}>;
}

const ProfilePageComponent = () => {

  const dbRef = ref(database);
  const [t, _] = useTranslation();
  const [userData, setUserData] = React.useState<UserData>({
    lastName: "",
    email: "",
    name: "",
    role: "",
    activities: {}
  });

  React.useEffect(() => {
    get(child(dbRef, 'Users/StudentTest')).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (JSON.stringify(data) !== JSON.stringify(userData)) {
          setUserData(data);
        }
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }, []);

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
          <h3>{userData.name + ' ' + userData.lastName}</h3>
          <h4>{userData.email}</h4>
          <p>Rol: {userData.role}</p>
          {/* <p>Actividades: 
            {Object.entries(userData.activities).map(([id, actividad]) => (
              <div key={id}>
                <p>ID: {id}</p>
                <p>Fase Actual: {actividad.actualPhase}</p>
              </div>
            ))}
          </p> */}
        </div>
      </div>
    </div>
  );
}

export default ProfilePageComponent;
