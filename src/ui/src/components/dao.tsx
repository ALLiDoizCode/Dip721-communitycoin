import * as React from "react";
import { Col, Container, Modal, Nav, Row, Spinner} from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { useLocation, useNavigate } from 'react-router-dom'
import { useRecoilState } from "recoil";
import { connectedAtom, identityProviderAtom, loadingAtom, principalAtom, ycBalanceAtom } from "../lib/atoms";
import WalletConnector from "./wallet-connector";
import "../styles/dao-styles.css";
import { getProposal } from "../lib/http";
import ReactGA from 'react-ga';
import util, { bigIntToDecimal, bigIntToDecimalPrettyString } from "../lib/util";
import actor from "../declarations/actor";
import { Principal } from "@dfinity/principal";
ReactGA.initialize('G-G7HPNGQVM6');
ReactGA.pageview(window.location.pathname + window.location.search);
const Dao = () => {
    const [loading, setLoading] = useRecoilState(loadingAtom);
    const [connected, setConnected] = useRecoilState(connectedAtom);
    const [activeProposal, setActiveProposal] = React.useState(false);
    const [ycBalance, setYcBalance] = useRecoilState(ycBalanceAtom);
    const [provider, setProvider] = useRecoilState(identityProviderAtom);
    const [principal, setPrincipal] = useRecoilState(principalAtom);
    const currentLocation = useLocation();
    const navigate = useNavigate();

    React.useEffect(() => {
        refreshProposal().then();
        setBalance().then();
    }, [connected]);

    async function setBalance() {
        const coinCanister = await actor.coincanister(provider);
        console.log("set balance called")
        const balance = await coinCanister.balanceOf(Principal.fromText(principal));
        console.log(balance);
        setYcBalance(bigIntToDecimal(balance))
    }

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
            <Col xxs="6"><h1>Cig Dao</h1></Col>
            <Col xxs="6" className="text-right text-end">
            <WalletConnector className="btn-group-dao"></WalletConnector>
            <button disabled={!connected || activeProposal} onClick={navCreateProposal} className="btn btn-dark btn-group-dao" >Create Proposal</button>
            <a href="#" className="btn btn-outline-dark btn-group-dao btn-group-dao" >Back</a>
            </Col>
            <Col xxs="12">{connected ? <span className="text-success">Connected</span> : <span className="text-danger">Not Connected</span> }</Col>
            <Col xxs="12">{"Principal: " + principal}</Col>
            <Col xxs="12">{"Balance: " + ycBalance.getPrettyValue(3, ",")}</Col>

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