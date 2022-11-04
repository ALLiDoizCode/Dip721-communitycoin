import * as React from "react";
import { ThemeProvider } from "react-bootstrap";
import { Routes, Route } from "react-router-dom";
import ActiveProposalComponent from "./components/active-proposal";
import CCNav from "./components/cc-nav";
import CreateProposal from "./components/create-proposal";
import Dao from "./components/dao";
import Description from "./components/description";
import ProposalList from "./components/proposal-list";
import RoadMap from "./components/roadmap";
import Team from "./components/team";
import Tokenomics from "./components/tokenomics";
import { fetchAcceptedProposals, fetchRejectedProposals } from "./lib/http";


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
            >
        <Route
            path='/dao/accepted'
            element={<>
            <ProposalList proposalFunction={fetchAcceptedProposals} ></ProposalList>
            </>}/>
        <Route
            path='/dao/rejected'
            element={<>
            <ProposalList proposalFunction={fetchRejectedProposals} ></ProposalList>
            </>
            }
            />
        <Route
            path='/dao/active'
            element={<>
            <ActiveProposalComponent></ActiveProposalComponent>
            </>
            }
            />
        <Route
            path='/dao/createproposal'
            element={<>
            <CreateProposal></CreateProposal>
            </>
            }
            />
        <Route
            path='/dao/*'
            element={<>
            <ActiveProposalComponent></ActiveProposalComponent>
            </>
            }
            />
        </Route>
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