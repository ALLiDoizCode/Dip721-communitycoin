import { Principal } from "@dfinity/principal";
import bigDecimal from "js-big-decimal";
import * as React from "react";
import { Button, Form} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import actor from "../declarations/actor";
import constants from "../declarations/constants";
import { MemberDraft, RequestDraft, ThresholdDraft, TreasuryActionRequest } from "../declarations/dao/dao.did";
import { connectedAtom, identityProviderAtom, loadingAtom, proposalCostAtom, successAtom, ycBalanceAtom } from "../lib/atoms";
import MemberDraftComponent from "./member-draft-component";
import ThresholdDraftComponent from "./threshhold-draft-component";
import TransferDraftComponent from "./trahsfer-draft-component";

const TreasuryConsideration = (param: {proposalCost: bigDecimal}) => {

    interface TreasuryConsiderationForm {
        title: string;
        description: string;
        draftType: string;
        request: RequestDraft;
      }

    const [loading, setLoading] = useRecoilState(loadingAtom);

    const [step, setStep] = React.useState(0);
    const [state, setState] = React.useState({} as TreasuryConsiderationForm);
    const [provider, setProvider] = useRecoilState(identityProviderAtom);
    const [proposalCost, setProposalCost] = useRecoilState(proposalCostAtom);
    const [ycBalance, setYcBalance] = useRecoilState(ycBalanceAtom);
    const [connected, setConnected] = useRecoilState(connectedAtom);
    const [success, setSuccess] = useRecoilState(successAtom);
    const navigate = useNavigate();


    function setValue(name, value) {
        state[name] = value;
        setState(state);
    }

    async function onFullFormSubmit() {
        setLoading(true);
        const treasuryActionRequest: TreasuryActionRequest = {
            title: state.title,
            description: state.description,
            request: state.request
        }

        const sanatizedTreasuryActionRequest = JSON.parse(JSON.stringify(treasuryActionRequest));
    
        const coinCanister = await actor.coincanister(provider);
        await coinCanister.approve(Principal.fromText(constants.daoCanisterId), proposalCost);
        const daoCanister = await actor.daoCanister(provider);
        await daoCanister.createProposal({treasuryAction: sanatizedTreasuryActionRequest});
        setLoading(false);
        setSuccess(true);
        navigate("/dao/active");
        setTimeout(() => setSuccess(false), 4000);
    }

    function setMember(key: string, member: MemberDraft | ThresholdDraft) {
        setValue("request", {[key]: member});
        onFullFormSubmit();
    }

    function onFormSubmit(e) {
        e.preventDefault();
        setStep(1);
    }

    function draftTypeRendered() {
        switch (state.draftType) {
            case "addMember":
            case "removeMember":
                return <MemberDraftComponent setConsumer={(mem) => setMember(state.draftType, mem)}></MemberDraftComponent>
            case "threshold":
                return <ThresholdDraftComponent setConsumer={(mem) => setMember(state.draftType, mem)}></ThresholdDraftComponent>
            case "transfer":
                return <TransferDraftComponent setConsumer={(mem) => setMember(state.draftType, mem)}></TransferDraftComponent>
        }
    }
    

    return <>
    {step == 0 && 
        <Form onSubmit={onFormSubmit} className="proposal-form" > 
        <Form.Group className="mb-3" controlId="formBasicTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control required type="text" placeholder="Enter Title" onChange={(e) => setValue("title", e?.target?.value)}/>
            <Form.Text className="text-muted">
                This is the title for your proposal
            </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
            required
            as="textarea"
            placeholder="What is your proposal about?"
            style={{ height: '100px' }}
            onChange={(e) => setValue("description", e?.target?.value)}
            />
            <Form.Text className="text-muted">
                Please enter in detail what about the tokenomics you want to change and why.
            </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formTaxType">
            <Form.Select required aria-label="Change Type" onChange={(e) => setValue("draftType", e?.target?.value)}>
                <option value="">Treasury Action</option>
                <option value="threshold">Change Power Threshold</option>
                <option value="removeMember">Remove Controlling Member</option>
                <option value="addMember">Add Controlling Member</option>
                <option value="transfer">Transfer</option> 
            </Form.Select>
            <Form.Text className="text-muted">
                What treasury action would you like to take?
            </Form.Text>
        </Form.Group>
        {(param.proposalCost.compareTo(ycBalance) === 1  || !connected) && <>
        <span className="text-danger">
            You don't have enough YC to make a proposal or you are not connected
        </span>
        <br/>
        </>}

        <Button disabled={param.proposalCost.compareTo(ycBalance) === 1  || !connected} variant="info" type="submit">
            Next
        </Button>
        </Form>
    }
    {step == 1 && draftTypeRendered()}
    </>
 
}

export default TreasuryConsideration