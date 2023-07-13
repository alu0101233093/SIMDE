import * as React from "react";
import { BrowserRouter as Router, Route, Link, useNavigate} from 'react-router-dom';
import { useTranslation } from "react-i18next";
// import { useFirebaseApp } from "reactfire";
import { app, database } from "../../../main";
import { child, equalTo, get, getDatabase, onValue, orderByChild, push, query, ref, set } from "firebase/database";
import { connect } from "react-redux";
import swal from "sweetalert";
import { StringMap } from "i18next";

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
  machine: string
  minNumParticipants: number
  maxNumParticipants: number
}

const ActivitiesPageComponent = (props) => {
  const [t, _] = useTranslation();
  const [activityData, setActivityData] = React.useState<Activity[]>([]);
  const [groupSelection, setGroupSelection] = React.useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = React.useState<Activity>({
    tittle: "",
    evaluation: "",
    groups: {},
    private: false,
    tasks: {},
    machine: "",
    minNumParticipants: 0,
    maxNumParticipants: 0,
  });

  const handleActivitySelection = (event, activityId) => {
    event.preventDefault();
    if (!props.logged) {
      swal("User not logged", "Login required to participate in a public activity", "info");
      return;
    }
  
    setSelectedActivity(activityData[activityId]);
    const selectedActivity = activityData[activityId];
  
    try {
      if (selectedActivity) {
        // Verificar si la actividad es individual (máximo y mínimo un participante)
        const isIndividualActivity = selectedActivity.minNumParticipants == 1 && selectedActivity.maxNumParticipants == 1;
  
        if (isIndividualActivity) {
          const groupsRef = ref(database, `Activities/${activityId}/groups`);
          const newGroupRef = push(groupsRef); // Generar un nuevo ID único para el grupo
  
          const newGroup = {
            actualPhase: 1,
            files: {
              code: "",
              memory: ""
            },
            participants: {
              "01": props.userID,
            },
            score: -1,
          };
  
          // Guardar el nuevo grupo en la base de datos
          set(newGroupRef, newGroup);
  
          swal("Registrado correctamente a la actividad", "success");
        } else {
          const groupsRef = ref(database, `Activities/${activityId}/groups`);
          get(groupsRef).then((groupsSnapshot) => {
            const groupsData = groupsSnapshot.val();

            // Obtener los nombres de los grupos con plazas disponibles
            const availableGroupNames = Object.entries(groupsData || {}).reduce(
              (result: string[], [groupId, group]) => {
                const hasAvailableSpot = Object.values((group as Group).participants || {}).includes("");
                if (hasAvailableSpot) {
                  result.push(groupId);
                }
                return result;
              },
              []
            );

            if(availableGroupNames.length == 0)
              swal("No hay grupos disponibles", "Contacta con un administrador si crees que se trata de un error", "info");

            // Actualizar el estado con los nombres de los grupos disponibles
            setGroupSelection(availableGroupNames);
          });
        }
      } else {
        swal("No se encontró la actividad","error")
      }
    } catch (error) {
      console.error(error);
    }
  };
  

  const handleGroupSelection = async (groupId) => {     ///////////////////////////////////////////////////////////////////////////////////////
    try {
      const database = getDatabase();

      // Obtener la ID de la actividad seleccionada
      const activitiesSnapshot = await get(ref(database, `Activities`));
      const activitiesData = activitiesSnapshot.val();

      const ActivityID = Object.entries(activitiesData).find((val) => {
        if((val[1] as Activity).tittle == selectedActivity.tittle)
          return val[0];
      })

      if (!ActivityID) {
        swal("Error al obtener la actividad seleccionada", "error");
        return;
      }

      const groupRef = ref(database, `Activities/${ActivityID[0]}/groups/${groupId}/participants`);

      // Verificar si el grupo ya tiene al usuario como participante
      const groupSnapshot = await get(groupRef);
      const groupData = groupSnapshot.val();
  
      if (groupData && Object.values(groupData).includes(props.userID)) {
        swal("Usuario ya está registrado en este grupo", "info");
        return;
      }
  
      // Obtener el primer slot vacío en el grupo
      
      const emptySlot = Object.entries(groupData).find(([key, value]) => value == "")?.[0];
  
      if (!emptySlot) {
        swal("No hay slots disponibles en este grupo", "info");
        return;
      }
  
      // Agregar al usuario al primer slot vacío
      await set(ref(database, `Activities/${ActivityID[0]}/groups/${groupId}/participants/${emptySlot}`), props.userID);
  
      // Actualizar la actividad seleccionada con el nuevo grupo
      const updatedActivity = {
        ...selectedActivity,
        groups: {
          ...selectedActivity.groups,
          [groupId]: {
            ...selectedActivity.groups[groupId],
            participants: {
              ...selectedActivity.groups[groupId].participants,
              [emptySlot]: props.userID
            }
          }
        }
      };
      setSelectedActivity(updatedActivity);
  
      await swal("Registrado correctamente en el grupo:" + groupId, "success");
      setGroupSelection([]);
    } catch (error) {
      console.error(error);
    }
  };
  
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const database = getDatabase();
        const actRef = ref(database, "Activities");
  
        // Fetch public activities
        const publicActivityQuery = query(actRef, orderByChild("private"), equalTo(false));
        const publicSnapshot = await get(publicActivityQuery);
        const publicActivityData = publicSnapshot.val();

        // Filter activities based on user's participation
        const nonParticipatingActivities = Object.entries(publicActivityData as Activity || {}).reduce((result, [selectedActivity, activity]) => {
          const groups = activity.groups || {};
          const isUserParticipant = Object.values(groups as Record<string,Group>).some((group) =>
            Object.values(group.participants || {}).includes(props.userID)
          );
          if (!isUserParticipant) {
          result[selectedActivity] = activity;
          }
          return result;
        }, {});
  
        // Set the fetched activity data
        setActivityData(nonParticipatingActivities as Activity[]);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchData();
  }, [props.userID,groupSelection,selectedActivity]);

  return (
    <div className="page pt-5">
      <div className="container-fluid">
      {groupSelection.length > 1 ? (
          <div className="group-buttons text-center">
            <h1>Selecciona un grupo</h1>
            <div className="group-buttons mt-5">
              {groupSelection.map((groupId) => (
                <button
                  key={groupId}
                  type="button"
                  className="btn btn-primary m-1"
                  onClick={() => handleGroupSelection(groupId)}
                >
                  {groupId}
                </button>
              ))}
            </div>
          </div>
        ) : (
        <div className="group-buttons text-center">
          <h1>Actividades Públicas</h1>
          {activityData? Object.entries(activityData || {}).map(([id, activity]) => (
            <button 
              type="button" 
              className="btn btn-primary m-1" 
              key={id} 
              onClick={(event) => handleActivitySelection(event, id)}>
              {activity.tittle}
            </button>
          )): <p>No hay actividades públicas disponibles</p>}
        </div>
      )}
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
