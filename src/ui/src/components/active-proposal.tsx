import { Principal } from "@dfinity/principal";
import * as React from "react";
import { Row, Col, Table, Card, ListGroup, Button, Modal, Form, InputGroup, Alert } from "react-bootstrap";
import { Pie, PieChart, ResponsiveContainer } from "recharts";
import { useRecoilState } from "recoil";
import { coincanister, daocanister } from "../declarations/agent";
import { connectedAtom, loadingAtom, ycBalanceAtom } from "../lib/atoms";
import { Proposal } from "../lib/dao";
import { getProposal, ProposalFunction } from "../lib/http";
import "../styles/proposal-styles.css";
import bigDecimal from "js-big-decimal";
import plug from "../declarations/plug";
import { daoCanisterId } from "../declarations/constants";


function isWhatPercentOf(numA, numB) {
    return (numA / numB) * 100;
  }

const ActiveProposalComponent = () => {
    const myWindow = window as any;
    const [connected, setConnected] = useRecoilState(connectedAtom);
    const [loading, setLoading] = useRecoilState(loadingAtom);
    const [ycBalance, setYcBalance] = useRecoilState(ycBalanceAtom);
    const [activeProposal, setActiveProposal] = React.useState({} as Proposal);


    const [votingPercents, setVotingPercents] = React.useState({yay: 1, nay: 1});
    const [votingModal, setVotingModal] = React.useState(false);
    const [approve, setApprove] = React.useState(false);
    const [votingPower, setVotingPower] = React.useState(new bigDecimal(0));


    React.useEffect(() => {
        setLoading(true);
        refreshProposal().then(() => setLoading(false));
        if (connected) {
            coincanister().balanceOf(Principal.fromText(myWindow.ic.plug.principalId)).then(balance => {
                var result = new bigDecimal(balance);
                var decimal = new bigDecimal(100000);
                console.log(result)
                setYcBalance(result.divide(decimal, 5));
            });
        }

    }, [connected]);

    async function refreshProposal() {
        const proposal = await getProposal();
        setActiveProposal(proposal);
        const yayNum = proposal?.yay || 1;
        const nayNum =  proposal?.nay || 1;
        const voteTotal = yayNum + nayNum;
        setVotingPercents({yay: isWhatPercentOf(yayNum, voteTotal), nay: isWhatPercentOf(nayNum, voteTotal)})
    }

    async function vote() {
        setLoading(true);
        console.log("starting")
        const coinCanister = await plug.coincanister();
        const daoCanister = await plug.daoCanister();
        console.log("got canister")
        const workableVotingPower = votingPower.multiply(new bigDecimal(100000)).floor();
        console.log(workableVotingPower.getValue());
        await coinCanister.approve(Principal.fromText(daoCanisterId), BigInt(workableVotingPower.getValue()));
        await daoCanister.vote(activeProposal.id, BigInt(workableVotingPower.getValue()), approve);
        console.log("voted")
        setVotingModal(false);
        await refreshProposal();
        setLoading(false);
    }

    async function showModal(direction: string) {
        setApprove(direction === "yay");
        setVotingModal(true);
    }

    return <>
    <Row>
        <Col>
        <div className="vote-bar" style={{ background: "linear-gradient(to right, green "+votingPercents.yay+"%, red "+votingPercents.nay+"%)"}}>
            <Row className="text-percent">
                <Col><span>{votingPercents.yay}%</span></Col>
                <Col>VS</Col>
                <Col><span>{votingPercents.nay}%</span></Col>
            </Row>
            <Row className="text-percent">
                <Col><span>{activeProposal.yay} YC</span></Col>
                <Col>VS</Col>
                <Col><span>{activeProposal.nay} YC</span></Col>
            </Row>
        </div>
        </Col>
    </Row>
    <Row>
        <Col>
        <Card className="active-proposals">
        <Card.Header as="h5">Title: <span className="proposal-title">{activeProposal.title}</span></Card.Header>
            <Card.Body>
                <h5 className="card-label">Descripton:</h5>
                <Card.Text>
                {activeProposal.description}
                </Card.Text>
            </Card.Body>

            <Card.Body>
                <Row className="vote-buttons">
                    <Col>
                        <button disabled={!connected} onClick={() => showModal("yay")} className="btn btn-success btn-lg vote-button">Yay</button>
                    </Col>
                    <Col>
                        <button disabled={!connected} onClick={() => showModal("nay")} className="btn btn-danger btn-lg  vote-button">Nay</button>
                    </Col>
                </Row>
            </Card.Body>
            <Card.Footer className="text-muted">
            <div><span className="card-label">Creator: </span>{activeProposal.creator} </div>
            <div><span className="card-label">Created At: </span>{new Date(activeProposal.timeStamp/1000000).toLocaleDateString()}</div>
            </Card.Footer>
        </Card>
        </Col>
    </Row>


    <Modal show={votingModal} onHide={() => setVotingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Voting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div>
                <Alert variant={"info"}>
                    <span>YC balance is {ycBalance.getPrettyValue(3, ",")}, every YC is one vote.</span>
                </Alert>
            </div>
        {ycBalance.compareTo(votingPower) < 0 &&
        <div>
            <Alert variant="danger">
                <span>You don't have enough YC</span>
            </Alert>
        </div> 
        }
        <div className="input-group mb-3">
            <div className="input-group-prepend">
                <span className="input-group-text">YC</span>
            </div>
            <input min="0" onChange={event => setVotingPower(new bigDecimal((event?.target?.value || 0)))} data-placement="top" title="Every YC is one vote" type="number" className="form-control" />
        </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setVotingModal(false)}>
            Cancel
          </Button>
          <Button disabled={ycBalance.compareTo(votingPower) < 0} variant="primary" onClick={vote}>
            Vote
          </Button>
        </Modal.Footer>
      </Modal>
    </>
    
}

export default ActiveProposalComponent