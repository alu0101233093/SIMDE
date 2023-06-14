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
  tittle: string
  evaluation: string
  groups: Record<string, Group>
  private: boolean
  tasks: Record<string, string>
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
  const [actualPhase, setActualPhase] = React.useState(-1);
  const [selectedActivity, setSelectedActivity] = React.useState<Activity>({
    tittle: "",
    evaluation: "",
    groups: {},
    private: false,
    tasks: {}
  });
  const [activityData, setActivityData] = React.useState<ActivityList>({
    privateActivities: {},
    publicActivities: {}
  });

  const handleActivitySelection = async (event, activityId) => {
    event.preventDefault();
    try {
      const activity = activityData.privateActivities?.[activityId] || activityData.publicActivities?.[activityId];
      await setSelectedActivity(activity);
  
      // Verificar si el usuario está en algún grupo de la actividad seleccionada
      const group = Object.values(activity?.groups || {}).find((group) =>
        Object.values(group.participants || {}).includes(props.userID)
      );
  
      if (group) {
        setActualPhase(group.actualPhase);
      } else {
        console.log("El usuario no está en ningún grupo de esta actividad");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCodeSubmit = (event) => {
    event.preventDefault();
    handleActivitySelection(event, event.target.elements.code.value);
  };
  
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
        const filteredPrivateActivities = Object.entries(privateActivityData as Activity || {}).reduce((result, [selectedActivity, activity]) => {
          const groups = activity.groups || {};
          const isUserParticipant = Object.values(groups as Record<string,Group>).some((group) =>
            Object.values(group.participants || {}).includes(props.userID)
          );
          if (isUserParticipant) {
            result[selectedActivity] = activity;
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
            {Object.entries(activityData.publicActivities || {}).map(([id,activity]) => (
              <div key={id} onClick={(event) => handleActivitySelection(event, id)}>
                <button type="button" className="btn btn-primary">
                  {activity.tittle}
                </button>
              </div>
            ))}
            <h2 className="text-center mx-auto mt-5">Actividades privadas</h2>
            {Object.entries(activityData.privateActivities || {}).map(([id,activity]) => (
              <div key={id} onClick={(event) => handleActivitySelection(event, id)}>
                <button type="button" className="btn btn-primary">
                  {activity.tittle}
                </button>
              </div>
            ))}
          </div>
  
          <div className="content col-md-8">
          {selectedActivity.tittle ? (
              <div>
                <h2>{selectedActivity.tittle}</h2>
                <p>{selectedActivity.evaluation}</p>

                <h3>Tareas</h3>
                <ul>
                  {Object.entries(selectedActivity.tasks || {}).map(([taskId, task]) => (
                    <li key={taskId}>{task}</li>
                  ))}
                </ul>
                <h3>Fase actual</h3>
                <p>{actualPhase}</p>
                {/* MOSTRAR TODA LA INFORMACIÓN DE LA ACTIVIDAD
                <ul>
                  {Object.entries(selectedActivity.groups || {}).map(([groupId, group]) => (
                    <li key={groupId}>
                      <p>Grupo: {groupId}</p>
                      <p>Fase Actual: {group.actualPhase}</p>
                      <p>Puntaje: {group.score}</p>
                      <p>Participantes:</p>
                      <ul>
                        {Object.entries(group.participants || {}).map(([participantId, participant]) => (
                          <li key={participantId}>{participant}</li>
                        ))}
                      </ul>
                      <p>Archivos:</p>
                      <ul>
                        {Object.entries(group.files || {}).map(([fileId, file]) => (
                          <li key={fileId}>{file}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul> */}
              </div>
            ) : (
              <div className="form-container col-7 mx-auto text-center">
                <h1 className="mb-4">Introduce el código de la actividad</h1>
                <form onSubmit={handleCodeSubmit}>
                  <div className="form-group">
                    <input type="text" className="form-control" name="code" placeholder="Ejemplo: 123456" />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg mt-3">
                    Apuntarse
                  </button>
                </form>
              </div>
            )}
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
