import * as React from "react";
import { BrowserRouter as Router, Route, Link, useNavigate, Navigate} from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { SequentialIntegration } from "../../../integration/sequential-integration";
import { Code } from '../../../core/Common/Code';
import { StringMap } from "i18next";
import swal from "sweetalert";
import { SuperescalarIntegration } from "../../../integration/superescalar-integration";
import { VLIWIntegration } from "../../../integration/vliw-integration";

const TestingPageComponent = (props) => {
  const [t, _] = useTranslation();
  const navigate = useNavigate();
  const [sequentialIntegration] = React.useState<SequentialIntegration>(new SequentialIntegration());
  const [superescalarIntegration] = React.useState<SuperescalarIntegration>(new SuperescalarIntegration());
  // const [vliwIntegration] = React.useState<VLIWIntegration>(new VLIWIntegration());
  
  React.useEffect(() => {
    if(!props.code)
      navigate("/myactivities");

    let code = new Code();
    
    const test = async () => {
      code.load(props.code);
      try {
        switch(props.activity.machine) {
          case "Sequential":
            sequentialIntegration.loadCode(code);
            sequentialIntegration.setBatchMode(1, 0, 0);
            sequentialIntegration.makeBatchExecution();
            break;
          case "Superescalar":
            superescalarIntegration.loadCode(code);
            superescalarIntegration.setBatchMode(1, 0, 0);
            superescalarIntegration.makeBatchExecution();
            break;
          // case "VLIW":
          //   vliwIntegration.loadCode(code);
          //   vliwIntegration.setBatchMode(1, 0, 0);
          //   vliwIntegration.makeBatchExecution();
          //   break;
        }
    
        swal({
          title: "Pruebas realizadas",
          icon: "success",
        });
      } catch (error) {
        swal({
          title: "Error",
          text: error.message,
          icon: "error",
        });
      }
    };
    
    test();

  }, [props.userID]);

  return (
    <div className="page pt-5">
      <div className="container-fluid text-center">
        <h1>Resultado</h1>
          <h3>Máquina: {props.activity.machine}</h3>
          <h3>Número de ciclos totales: {sequentialIntegration.results[0]}</h3>
          <button type="button" className="btn btn-primary btn-lg mt-3" onClick={() => navigate("/myactivities")}>
            Volver a  mis actividades
          </button>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    userID: state.User.userID,
    logged: state.User.logged,
    code: state.Activity.code,
    activity: state.Activity.data,
  };
};

export default connect(mapStateToProps)(TestingPageComponent);
