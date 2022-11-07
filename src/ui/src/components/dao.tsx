import * as React from "react";
import { Col, Container, Modal, Nav, Row, Spinner} from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { useLocation, useNavigate } from 'react-router-dom'
import { useRecoilState } from "recoil";
import { connectedAtom, loadingAtom } from "../lib/atoms";
import WalletConnector from "./wallet-connector";
import "../styles/dao-styles.css";
import { getProposal } from "../lib/http";
import ReactGA from 'react-ga';
ReactGA.pageview(window.location.pathname + window.location.search);
const Dao = () => {
    const [loading, setLoading] = useRecoilState(loadingAtom);
    const [connected, setConnected] = useRecoilState(connectedAtom);
    const [activeProposal, setActiveProposal] = React.useState(false);

    const currentLocation = useLocation();
    const navigate = useNavigate();

    React.useEffect(() => {
        refreshProposal().then();
    }, []);
    async function refreshProposal() {
        try {
            const proposal = await getProposal();
            setActiveProposal(true);
        } catch(e) {
            if (e.response.status === 404) {
                setActiveProposal(false);
            }
        }
    }

    function navCreateProposal() {
        navigate("/dao/createproposal");
    }

    return <>
     <Container fluid className="darken">
        <Row>
            <Col xxs="6"><h1>Crypto is Good Dao</h1></Col>
            <Col xxs="6" className="text-right text-end">
            <WalletConnector className="btn-group-dao"></WalletConnector>
            <button disabled={!connected && !activeProposal} onClick={navCreateProposal} className="btn btn-dark btn-group-dao" >Create Proposal</button>
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