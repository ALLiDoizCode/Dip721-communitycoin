import * as React from "react";
import { Alert, Col, Container, Modal, Nav, OverlayTrigger, Popover, Row, Spinner } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  activeProposalAtom,
  connectedAtom,
  identityProviderAtom,
  loadingAtom,
  principalAtom,
  successAtom,
  ycBalanceAtom,
} from "../lib/atoms";
import WalletConnector from "./wallet-connector";
import "../styles/dao-styles.css";
import { getProposal } from "../lib/http";
import { bigIntToDecimal } from "../lib/util";
import actor from "../declarations/actor";
import { Principal } from "@dfinity/principal";
import { TwitterShareButton } from "react-share";

const Dao = () => {
  const [loading] = useRecoilState(loadingAtom);
  const [connected] = useRecoilState(connectedAtom);
  const [activeProposal, setActiveProposal] = useRecoilState(activeProposalAtom);
  const [ycBalance, setYcBalance] = useRecoilState(ycBalanceAtom);
  const [provider] = useRecoilState(identityProviderAtom);
  const [principal] = useRecoilState(principalAtom);
  const [success] = useRecoilState(successAtom);

  const currentLocation = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    refreshProposal().then();
    setBalance().then();
  }, [connected]);

  async function setBalance() {
    const coinCanister = await actor.coinCanister(provider);
    const balance = await coinCanister.balanceOf(Principal.fromText(principal));
    setYcBalance(bigIntToDecimal(balance));
  }

  async function refreshProposal() {
    try {
      const proposal = await getProposal();
      setActiveProposal(proposal);
    } catch (e) {
      if (e.response.status === 404) {
        setActiveProposal(undefined);
      }
    }
  }

  function navCreateProposal() {
    navigate("/dao/createproposal");
  }
  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">Disabled</Popover.Header>
      <Popover.Body>
        <ul>
          {activeProposal && <li>There is already an active proposal</li>}
          {!connected && activeProposal && <li>Not signed-in</li>}
        </ul>
      </Popover.Body>
    </Popover>
  );

  return (
    <>
      <Container fluid className="darken">
        <Row>
          <Alert show={success} variant={"success"}>
            <Alert.Heading className="text-center">Successfulyl Submitted Form</Alert.Heading>
          </Alert>
        </Row>
        <Row>
          <Col xxs="6">
            <h1>Cig Dao</h1>
          </Col>
          <Col xxs="6" className="text-right text-end">
          {!!activeProposal && 
          <TwitterShareButton
            url={window.location.href}
            
            via="CigDao" 
            related={["CigDao_"]} 
            hashtags={["CigDao", "ICP"]} 
            title={`CigDao Proposal - ${activeProposal.title} has been posted, come vote`}>
              <button className="btn btn-outline-dark btn-group-dao">Share Proposal <img width={"30px"} src="Logoblue.svg"/></button>
            </TwitterShareButton>
            }
            <WalletConnector className="btn-group-dao"></WalletConnector>
            <OverlayTrigger trigger={["hover", "focus"]} placement="top" overlay={popover}>
              <span>
                <button
                  disabled={!connected || !!activeProposal}
                  onClick={navCreateProposal}
                  className="btn btn-dark btn-group-dao"
                >
                  Create Proposal
                </button>
              </span>
            </OverlayTrigger>

            <a href="#" className="btn btn-outline-dark btn-group-dao btn-group-dao">
              Back
            </a>
          </Col>
          <Col xxs="12">
            {connected ? (
              <span className="text-success">Connected</span>
            ) : (
              <span className="text-danger">Not Connected</span>
            )}
          </Col>
          <Col xxs="12">{"Principal: " + principal}</Col>
          <Col xxs="12">{"Balance: " + ycBalance.getPrettyValue(3, ",")}</Col>
        </Row>
        <Row>
          <Col>
            <Nav fill variant="tabs" defaultActiveKey={"#" + currentLocation.pathname}>
              <Nav.Item>
                <Nav.Link href="#/dao/active">Active Proposal</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link href="#/dao/accepted">Accepted Proposals</Nav.Link>
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
        <Modal show={loading} size="sm" aria-labelledby="contained-modal-title-vcenter" centered>
          <Modal.Header>
            <Modal.Title id="contained-modal-title-vcenter">Don't close Window</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default Dao;
