import * as React from "react";
import { BrowserRouter as Router, Route, Link, useNavigate} from 'react-router-dom';
import { useTranslation } from "react-i18next";
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
  minNumParticipants: number
  maxNumParticipants: number
}

const TestingPageComponent = (props) => {
  const [t, _] = useTranslation();
  const [activityData, setActivityData] = React.useState<Activity[]>([]);
  
  React.useEffect(() => {
    // swal while loading the testing 2 seconds
    swal({
        title: "Loading...",
        text: "Please wait",
        icon: "info",
        buttons: [false],
        timer: 2000,
    });

  }, [props.userID]);

  const handleTesting = () => {
    
  }

  return (
    <div className="page pt-5">
      <div className="container-fluid">
        <h1>Testing</h1>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => handleTesting()}>
            Fase de pruebas
          </button>
          <p>codigo: {props.code}</p>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    userID: state.User.userID,
    logged: state.User.logged,
    code: state.Activity.code,
  };
};

export default connect(mapStateToProps)(TestingPageComponent);
