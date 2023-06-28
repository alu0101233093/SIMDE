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
  const [groupSelection, setGroupSelection] = React.useState<string[]>([]);
  const [rankingData, setRankingData] = React.useState<[string, number][]>([]);
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

  const fetchRankingData = async (event, activityId) => {
    event.preventDefault();
    try {
      const database = getDatabase();
      const activityRef = ref(database, `Activities/${activityId}`);
      const activitySnapshot = await get(activityRef);
      const activityData: Activity = activitySnapshot.val();
  
      if (activityData && activityData.groups) {
        const scores: Record<string, number> = Object.entries(activityData.groups).reduce((result, [groupId, group]) => {
          result[groupId] = group.score;
          return result;
        }, {});

        // Convert scores object to an array of [groupId, score] pairs
        const rankingArray = Object.entries(scores);

        // Sort the rankingArray based on the score in descending order
        rankingArray.sort((a, b) => b[1] - a[1]);

        // Update the state with the sorted ranking data
        setRankingData(rankingArray);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleActivitySelection = async (event, activityId) => {
    event.preventDefault();
    try {
      const activity = activityData.privateActivities?.[activityId] || activityData.publicActivities?.[activityId];
      await setSelectedActivity(activity);
      await fetchRankingData(event, activityId);
  
      // Verificar si el usuario está en algún grupo de la actividad seleccionada
      const group = Object.values(activity?.groups || {}).find((group) =>
        Object.values(group.participants || {}).includes(props.userID)
      );
  
      if (!group) {
        console.log("El usuario no está en ningún grupo de esta actividad");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCodeSubmit = async (event) => {
    event.preventDefault();
    const activityId = event.target.elements.code.value;
  
    try {
      const database = getDatabase();
      const activityRef = ref(database, `Activities/${activityId}`);
      const activitySnapshot = await get(activityRef);
      const activityData = activitySnapshot.val();
  
      if (activityData) {
        // Verificar si la actividad es individual (máximo y mínimo un participante)
        const isIndividualActivity = activityData.minNumParticipants == 1 && activityData.maxNumParticipants == 1;
  
        if (isIndividualActivity) {
          const groupsRef = ref(database, `Activities/${activityId}/groups`);
          const newGroupRef = push(groupsRef); // Generar un nuevo ID único para el grupo
          const groupId = String(newGroupRef.key);
  
          const newGroup = {
            actualPhase: 1,
            files: {},
            participants: {
              "01": props.userID,
            },
            score: -1,
          };
  
          // Guardar el nuevo grupo en la base de datos
          await set(newGroupRef, newGroup);
  
          // Actualizar el estado de la actividad seleccionada con el nuevo grupo
          await setSelectedActivity({
            ...activityData,
            groups: {
              [groupId]: newGroup,
            }
          });
  
          swal("Registrado correctamente a la actividad", "success");
        } else {
          console.log("La actividad no es individual"); ///////////////////////////////////////////
          const groupsRef = ref(database, `Activities/${activityId}/groups`);
          const groupsSnapshot = await get(groupsRef);
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

          // Actualizar el estado con los nombres de los grupos disponibles
          setGroupSelection(availableGroupNames);
          await setSelectedActivity({
            ...activityData
          });
        }
      } else {
        swal("No se encontró la actividad","error")
      }
    } catch (error) {
      console.error(error);
    }
  };  
  
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        await loggedCheck();
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

        // Filter public activities based on user's participation
        const filteredPublicActivities = Object.entries(publicActivityData as Activity || {}).reduce((result, [selectedActivity, activity]) => {
          const groups = activity.groups || {};
          const isUserParticipant = Object.values(groups as Record<string,Group>).some((group) =>
            Object.values(group.participants || {}).includes(props.userID)
          );
          if (isUserParticipant) {
            result[selectedActivity] = activity;
          }
          return result;
        }, {});
  
        // Set the fetched and filtered activity data
        setActivityData({
          privateActivities: filteredPrivateActivities,
          publicActivities: filteredPublicActivities
        });
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchData();
  }, [props.userID,groupSelection]);


  //////////////////////////////////////////

  const [text, setText] = React.useState('');

  const handleInputChange = (event) => {
    setText(event.target.value);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target && e.target.result) {
        setText(e.target.result.toString());
      }
    };

    reader.readAsText(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleGroupSelection = async (groupId) => {
    try {
      const database = getDatabase();

      // Obtener la ID de la actividad seleccionada
      const activitiesSnapshot = await get(ref(database, `Activities`));
      const activitiesData = activitiesSnapshot.val();

      console.log(selectedActivity)
      const ActivityID = Object.entries(activitiesData).find((val) => {
        if((val[1] as Activity).tittle == selectedActivity.tittle)
          return val[0];
      })

      console.log(ActivityID)

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
  
      await swal("Registrado correctamente en el grupo", "success");
      setGroupSelection([]);
    } catch (error) {
      console.error(error);
    }
  };
  

  return (
    <div className="page">
      <div className="container-fluid">
        {groupSelection.length > 1 ? (
          <div>
            <h2 className="text-center mx-auto mt-5">Selecciona un grupo</h2>
            <div className="group-buttons">
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
          <div className="row">
            <div className="content col-2 ms-5 p-4 rounded-3" style={{ backgroundColor: "rgba(122, 59, 122, 0.5)" }} role="group">
              <h2 className="text-center mx-auto"><strong>Actividades públicas</strong></h2>
              {Object.entries(activityData.publicActivities || {}).map(([id, activity]) => (
                <div key={id} onClick={(event) => handleActivitySelection(event, id)}>
                  <button type="button" className="btn btn-primary m-1">
                    {activity.tittle}
                  </button>
                </div>
              ))}
              <h2 className="text-center mx-auto mt-5"><strong>Actividades privadas</strong></h2>
              {Object.entries(activityData.privateActivities || {}).map(([id, activity]) => (
                <div key={id} onClick={(event) => handleActivitySelection(event, id)}>
                  <button type="button" className="btn btn-primary m-1">
                    {activity.tittle}
                  </button>
                </div>
              ))}
            </div>

            <div className="content col-7 ms-3">
              {selectedActivity.tittle ? (
                <div className="ms-5">
                  <h2>{selectedActivity.tittle}</h2>
                  <p>{selectedActivity.evaluation}</p>

                  <h3>Tareas</h3>
                  <ul>
                    {Object.entries(selectedActivity.tasks || {}).map(([taskId, task]) => (
                      <li key={taskId}>{task}</li>
                    ))}
                  </ul>

                  <div>
                    <div>
                      <textarea
                        value={text}
                        onChange={handleInputChange}
                        placeholder="Escribe tu texto aquí"
                        style={{ width: '100%', height: '200px' }}
                      />
                    </div>
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      style={{
                        border: '2px dashed #ccc',
                        padding: '20px',
                        marginTop: '20px',
                        textAlign: 'center',
                      }}
                    >
                      Arrastra y suelta un archivo de texto aquí
                    </div>
                  </div>
                </div>
              ) : (
                <div className="form-container mx-auto text-center">
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

            <div className="content col-2 ms-5 p-4 rounded-3" style={{ backgroundColor: "rgba(122, 59, 122, 0.5)" }}>
              <h2 className="text-center mx-auto">
                <strong>Ranking</strong>
              </h2>
              <div className="d-flex justify-content-between align-items-center">
                <span><strong>Grupo</strong></span>
                <span><strong>Puntaje</strong></span>
              </div>
              {Object.entries(rankingData).map(([_, [groupId, score]]) => {
                if (score > -1) {
                  return (
                    <div key={groupId} className="d-flex justify-content-between align-items-center">
                      <span>{groupId}</span>
                      <span>{score}</span>
                    </div>
                  );
                } else {
                  return null;
                }
              })}
            </div>

            {selectedActivity.tittle ? (
              <div className="row ps-5">
                <div className="content col-3">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg mt-3"
                    onClick={() => {
                      setSelectedActivity({
                        tittle: "",
                        evaluation: "",
                        groups: {},
                        private: false,
                        tasks: {},
                      });
                      setRankingData([]);
                    }}
                  >
                    Nueva actividad
                  </button>
                </div>
                <div className="col-6">
                  {/* Aquí puedes agregar contenido adicional en la columna central si es necesario */}
                </div>
                <div className="content col-3 d-flex justify-content-end">
                  <button type="button" className="btn btn-primary btn-lg mt-3">
                    Fase de pruebas
                  </button>
                </div>
              </div>
            ) : null}
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
