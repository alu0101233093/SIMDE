import * as React from "react";
import { BrowserRouter as Router, Route, Link} from 'react-router-dom';
import { useTranslation } from "react-i18next";
// import { useFirebaseApp } from "reactfire";
import { app, database } from "../../../main";
import { child, get, getDatabase, onValue, ref, set } from "firebase/database";


interface UserData {
  groups: Record<string, string>;
  activities: Record<string, {actualPhase: string}>;
}

interface GroupsData {
  participants: Record<string, string>;
  activities: Record<string, {actualPhase: string}>;
}

const ActivitiesPageComponent = (props) => {
  const dbRef = ref(database);
  const [t, _] = useTranslation();
  const [userData, setUserData] = React.useState<UserData>({
    groups: {},
    activities: {}
  });
  const [groupsData, setGroupsData] = React.useState<GroupsData>({
    participants: {},
    activities: {}
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      get(child(dbRef, 'Users/StudentTest')),
      get(child(dbRef, 'Groups/GroupTest'))
    ]).then(([userSnapshot, groupsSnapshot]) => {
        if (userSnapshot.exists()) {
          setUserData(userSnapshot.val());
        } else {
          console.log("No user data available");
        }

        if (groupsSnapshot.exists()) {
          setGroupsData(groupsSnapshot.val());
        } else {
          console.log("No groups data available");
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [dbRef]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="row">
          <div className="btn-group-vertical col-md-4" role="group">
            <h2 className="text-center mx-auto">Actividades Individuales</h2>
            {Object.entries(userData.activities).map(([id]) => (
              <div key={id}>
                <button type="button" className="btn btn-primary">{id}</button>
              </div>
            ))}
            <h2 className="text-center mx-auto mt-5">Actividades Grupales</h2>
            {Object.entries(groupsData.activities).map(([id]) => (
              <div key={id}>
                <button type="button" className="btn btn-primary">{id}</button>
              </div>
            ))}
          </div>

          <div className="content col-md-8">
            <div className="form-container col-7 mx-auto text-center">
              <h1 className="mb-4">Introduce el código de la actividad</h1>
              <form>
                <div className="form-group">
                  <input type="text" className="form-control" placeholder="Ejemplo: 123456" />
                </div>
                <button type="submit" className="btn btn-primary btn-lg mt-3">Jugar</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivitiesPageComponent;
