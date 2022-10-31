import * as React from "react";
import { Routes, Route } from "react-router-dom";
import CCNav from "./components/cc-nav";
import Dao from "./components/dao";
import Description from "./components/description";
import RoadMap from "./components/roadmap";
import Team from "./components/team";
import Tokenomics from "./components/tokenomics";


const APP = () => {
    return <>
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
    </>
    
}

export default APP