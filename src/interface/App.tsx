import * as React from "react";
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPageComponent from "./components/LandingPage/LandingPageComponent";
import ProjectPage from "./components/LandingPage/ProjectPageComponent";

import SuperescalarComponent from "./components/Superescalar/SuperescalarComponent";
import VLIWComponent from "./components/VLIW/VLIWComponent";
import LogInPageComponent from "./components/User/LogInPageComponent";
import ActivitiesPageComponent from "./components/Activities/ActivitiesPageComponent";
import ProfilePageComponent from "./components/User/ProfilePageComponent";
import NavbarComponent from "./components/NavbarComponent";
import FooterComponent from "./components/FooterComponent";


const App = () => {
    return (
        <BrowserRouter basename={process.env.PUBLIC_URL} >
            <div className="pagebody">
                <React.Suspense fallback={<div>Loading... </div>}>
                    <NavbarComponent></NavbarComponent>
                        <Routes>
                            <Route path="/" element={<LandingPageComponent/>} />
                            <Route path="/superescalar" element={<SuperescalarComponent />} />
                            <Route path="/vliw" element={<VLIWComponent />} />
                            <Route path="/project" element={<ProjectPage />} />
                            <Route path="/activities" element={<ActivitiesPageComponent />} />
                            <Route path="/logIn" element={<LogInPageComponent />} />
                            <Route path="/profile" element={<ProfilePageComponent />} />
                        </Routes>
                    <FooterComponent></FooterComponent>
                </React.Suspense>
            </div>
        </BrowserRouter>
   );
}

export default App;
