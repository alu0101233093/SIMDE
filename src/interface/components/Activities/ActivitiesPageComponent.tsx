import * as React from "react";
import { BrowserRouter as Router, Route, Link, useNavigate} from 'react-router-dom';
import { useTranslation } from "react-i18next";
// import { useFirebaseApp } from "reactfire";
import { app, database } from "../../../main";
import { child, equalTo, get, getDatabase, onValue, orderByChild, query, ref, set } from "firebase/database";
import { connect } from "react-redux";
import swal from "sweetalert";

interface Group {
  actualPhase: number
  files: Record<string,string>
  participants: Record<string,string>
  score: number
}

interface Activity {
  evaluation: string
  groups: Record<string, Group>
  maxNumParticipants: number
  minNumParticipants: number
  private: boolean
  tasks: Record<string, {actualPhase: string}>
}

interface ActivityList {
  privateActivities: Record<string,Activity>
  publicActivities: Record<string,Activity>
}

const ActivitiesPageComponent = (props) => {
  const navigate = useNavigate();

  const loggedCheck = async () => {
    if (!props.logged) {
      await swal("User not logged", "You have to login to access this page", "info");
      navigate("/logIn");
    }
  }

  const [t, _] = useTranslation();
  const [activityData, setActivityData] = React.useState<ActivityList>({
    privateActivities: {},
    publicActivities: {}
  });

  React.useEffect(() => {
    loggedCheck();
    const fetchData = async () => {
      try {
        const database = getDatabase();
        const actRef = ref(database, "Activities");
  
        // Fetch private activities
        const privateActivityQuery = query(actRef, orderByChild("private"), equalTo(true));
        const privateSnapshot = await get(privateActivityQuery);
        const privateActivityData = privateSnapshot.val();
  
        // Filter private activities based on user's participation
        const filteredPrivateActivities = Object.entries(privateActivityData as Activity || {}).reduce((result, [activityId, activity]) => {
          const groups = activity.groups || {};
          const isUserParticipant = Object.values(groups as Record<string,Group>).some((group) =>
            Object.values(group.participants || {}).includes(props.userID)
          );
          if (isUserParticipant) {
            result[activityId] = activity;
          }
          return result;
        }, {});
  
        // Fetch public activities
        const publicActivityQuery = query(actRef, orderByChild("private"), equalTo(false));
        const publicSnapshot = await get(publicActivityQuery);
        const publicActivityData = publicSnapshot.val();
  
        // Set the fetched and filtered activity data
        setActivityData({
          privateActivities: filteredPrivateActivities,
          publicActivities: publicActivityData
        });
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchData();
  }, [props.userID]);

  return (
    <div className="page">
      <div className="container">
        <div className="row">
          <div className="btn-group-vertical col-md-4" role="group">
            <h2 className="text-center mx-auto">Actividades públicas</h2>
            {Object.entries(activityData.publicActivities || {}).map(([id]) => (
              <div key={id}>
                <button type="button" className="btn btn-primary">{id}</button>
              </div>
            ))}
            <h2 className="text-center mx-auto mt-5">Actividades privadas</h2>
            {Object.entries(activityData.privateActivities || {}).map(([id]) => (
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

const mapStateToProps = (state) => {
  return {
    userID: state.User.userID,
    logged: state.User.logged,
  };
};

export default connect(mapStateToProps)(ActivitiesPageComponent);
