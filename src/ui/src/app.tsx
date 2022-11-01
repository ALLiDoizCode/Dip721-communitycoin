import * as React from "react";
import { ThemeProvider } from "react-bootstrap";
import { Routes, Route } from "react-router-dom";
import CCNav from "./components/cc-nav";
import Dao from "./components/dao";
import Description from "./components/description";
import LaunchTimer from "./components/launch-timer";
import RoadMap from "./components/roadmap";
import Team from "./components/team";
import Tokenomics from "./components/tokenomics";


const APP = () => {
    return <>

<ThemeProvider
  breakpoints={['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs', 'xxs']}
  minBreakpoint="xxs"
>
    <CCNav></CCNav>
    <Routes>
        <Route
            path='/dao'
            element={<Dao />}
            />
        <Route
            path='*'
            element={<>
                <Description></Description>
                <Tokenomics></Tokenomics>
                <RoadMap></RoadMap>
                <Team></Team>
            </>
            }
            />
        </Routes>
        </ThemeProvider>;
    </>
    
}

export default APP