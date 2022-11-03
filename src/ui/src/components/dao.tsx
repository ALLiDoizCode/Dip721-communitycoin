import * as React from "react";
import { Col, Container, Modal, Nav, Row, Spinner} from "react-bootstrap";
import { Routes, Route, Outlet } from "react-router-dom";
import { daocanister } from "../declarations/agent";
import { Proposal } from "../lib/dao";
import { useLocation } from 'react-router-dom'
import { useRecoilState } from "recoil";
import { connectedAtom, loadingAtom } from "../lib/atoms";
import WalletConnector from "./wallet-connector";
import "../styles/dao-styles.css";
const Dao = () => {
    const [loading, setLoading] = useRecoilState(loadingAtom);
    const [connected, setConnected] = useRecoilState(connectedAtom);
    const [activeProposal, setActiveProposal] = React.useState({} as Proposal);
    const currentLocation = useLocation();

    React.useEffect(() => {

    }, []);
    
    return <>
     <Container fluid className="darken">
        <Row>
            <Col xxs="6"><h1>Crypto is Good Dao</h1></Col>
            <Col xxs="6" className="text-right text-end">
            <WalletConnector className="btn-group-dao"></WalletConnector>
            <button disabled={!connected} className="btn btn-dark btn-group-dao" >Create Proposal</button>
            <a href="#" className="btn btn-outline-dark btn-group-dao btn-group-dao" >Back</a>
            </Col>
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
                    <Nav.Link href="#/dao/rejected">Rejected Proposals</Nav.Link>
                </Nav.Item>
                </Nav>
            </Col>
        </Row>
        <Outlet />
     </Container>

     <div className={"d-flex justify-content-center margin-top minter-dialog"}>
            <Modal
                show={loading}
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Don't close Window
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Modal.Body>
            </Modal>

            </div>
    </>
    
}

export default Dao