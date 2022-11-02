import * as React from "react";
import { Col, Container, Nav, Row} from "react-bootstrap";
import { Routes, Route, Outlet } from "react-router-dom";
import { daocanister } from "../declarations/agent";
import { Proposal } from "../lib/dao";
import { useLocation } from 'react-router-dom'

const Dao = () => {

    const [activeProposal, setActiveProposal] = React.useState({} as Proposal);
    const currentLocation = useLocation();

    React.useEffect(() => {

    }, []);
    
    return <>
     <Container fluid className="darken">
        <Row>
            <Col xxs="9"><h1>Crypto is Good Dao</h1></Col>
            <Col xxs="2" className="text-right text-end"><a href="#" className="btn btn-dark" >Create Proposal</a></Col>
            <Col xxs="1" className="text-right text-end"><a href="#" className="btn btn-outline-dark" >Back</a></Col>
        </Row>
        <Row>
            <Col>
                <Nav fill variant="tabs" defaultActiveKey={"#" + currentLocation.pathname}>
                <Nav.Item>
                    <Nav.Link href="#/dao/active" >Active Proposal</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="#/dao/accepted" >Accepted Proposals</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="#/dao/rejected">Rejected Proposals</Nav.Link>
                </Nav.Item>
                </Nav>
            </Col>
        </Row>

        <Row>
            <Col>
            <Outlet />
            </Col>
        </Row>
     </Container>
    </>
    
}

export default Dao