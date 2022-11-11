import { Principal } from "@dfinity/principal";
import * as React from "react";
import { Row, Col, Card,  Modal, Alert, Button } from "react-bootstrap";
import { useRecoilState } from "recoil";
import { identityProviderAtom, connectedAtom, loadingAtom, ycBalanceAtom } from "../lib/atoms";
import { Proposal } from "../lib/dao";
import { getProposal } from "../lib/http";
import "../styles/proposal-styles.css";
import bigDecimal from "js-big-decimal";
import { daoCanisterId } from "../declarations/constants";
import { bigIntToDecimal } from "../lib/util";
import actor from "../declarations/actor";

function money_round(num) {
    return Math.round(num * 100) / 100;
}

function isWhatPercentOf(numA, numB) {
    return money_round((numA / numB) * 100);
  }

const ActiveProposalComponent = () => {
    const myWindow = window as any;
    const [connected, setConnected] = useRecoilState(connectedAtom);
    const [loading, setLoading] = useRecoilState(loadingAtom);
    const [ycBalance, setYcBalance] = useRecoilState(ycBalanceAtom);
    const [activeProposal, setActiveProposal] = React.useState<undefined | Proposal>();
    const [provider, setProvider] = useRecoilState(identityProviderAtom);

    const [votingPercents, setVotingPercents] = React.useState({yay: 1, nay: 1});
    const [votingModal, setVotingModal] = React.useState(false);
    const [approve, setApprove] = React.useState(false);
    const [votingPower, setVotingPower] = React.useState(new bigDecimal(0));


    React.useEffect(() => {
        setLoading(true);
        refreshProposal().then(() => setLoading(false));
    }, [connected]);


    async function refreshProposal() {
        try {
            const proposal = await getProposal();
            console.log(typeof proposal)
            setActiveProposal(proposal);
            const yayNum = proposal?.yay === undefined ? 1 : proposal.yay;
            const nayNum =  proposal?.nay === undefined ?  1 : proposal.nay;
            const voteTotal = Number(yayNum) + Number(nayNum);
            setVotingPercents({yay: isWhatPercentOf(yayNum, voteTotal) || 0, nay: isWhatPercentOf(nayNum, voteTotal) || 0})
        } catch(e) {
            if (e.response.status === 404) {
                setActiveProposal(undefined);
            }
        }
    }

    async function vote() {
        if (activeProposal) {
            setLoading(true);
            const coinCanister = await actor.coincanister(provider);
            const daoCanister = await actor.daoCanister(provider);
            const workableVotingPower = votingPower.multiply(new bigDecimal(100000)).floor();
            await coinCanister.approve(Principal.fromText(daoCanisterId), BigInt(workableVotingPower.getValue()));
            await daoCanister.vote(activeProposal.id, BigInt(workableVotingPower.getValue()), approve);
            setVotingModal(false);
            await refreshProposal();
            setLoading(false);
        } else {
            alert("no active proposal");
        }
    }

    async function showModal(direction: string) {
        setApprove(direction === "yay");
        setVotingModal(true);
    }

    return <>
    {activeProposal && <>
    
    <Row className="tabs">
        <Col>
        <div className="vote-bar" style={{ background: "linear-gradient(to right, green "+votingPercents.yay+"%, red "+votingPercents.yay+"%)"}}>
            <Row className="text-percent">
                <Col><span>{votingPercents.yay}%</span></Col>
                <Col>VS</Col>
                <Col><span>{votingPercents.nay}%</span></Col>
            </Row>
            <Row className="text-percent">
                <Col><span>{bigIntToDecimal(activeProposal.yay).getPrettyValue(3, ",")} YC</span></Col>
                <Col>VS</Col>
                <Col><span>{bigIntToDecimal(activeProposal.nay).getPrettyValue(3, ",")} YC</span></Col>
            </Row>
        </div>
        </Col>
    </Row>
    <Row className="tabs">
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
            <div><span className="card-label">Created At: </span>{new Date(Number(activeProposal.timeStamp/1000000)).toLocaleDateString()}</div>
            </Card.Footer>
        </Card>
        </Col>
    </Row>
    </>
}
    {!activeProposal && <>
        <Row className="tabs">
            <Col className="text-center"><h2>No Active Proposal</h2></Col>
        </Row>
    </>}

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