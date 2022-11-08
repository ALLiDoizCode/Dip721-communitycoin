import * as React from "react";
import { Button, Form} from "react-bootstrap";
import { useRecoilState } from "recoil";
import { Typeahead } from 'react-bootstrap-typeahead';
import { identityProviderAtom, loadingAtom, proposalCostAtom } from "../lib/atoms";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import http from "../lib/http";
import { TreasuryRequest } from "../declarations/dao/dao.did";
import { Principal } from "@dfinity/principal";
import actor from "../declarations/actor";
import constants from "../declarations/constants";

type TypeAheadChoice = {id: number|string, label: string, description: string};


const TreasuryExecution = () => {

    React.useEffect(() => {
        setLoading(true);
        http.fetchAcceptedProposals().then((proposals => {
            const requests = proposals.filter(x=> !!x.request).map(y => {
                return {id: y.id, label: y.title, description: y.description}
            });
            setTypeAheadOtion(requests);
            setLoading(false);
        }));
    }, []);

    interface TreasuryRequestForm {
        title: string;
        description: string;
        vote: boolean;
        treasuryRequestId: number;
      }
    const [typeAheadOption, setTypeAheadOtion] = React.useState(new Array<TypeAheadChoice>);

    const [loading, setLoading] = useRecoilState(loadingAtom);
    const [state, setState] = React.useState({} as TreasuryRequestForm);
    const [provider, setProvider] = useRecoilState(identityProviderAtom);
    const [proposalCost, setProposalCost] = useRecoilState(proposalCostAtom);


    function setValue(name, value) {
        state[name] = value;
        setState(state);
    }

    async function onFormSubmit(e) {
        e.preventDefault();
        setLoading(true);
        const treasuryRequest: TreasuryRequest = {
            title: state.title,
            description: state.description,
            treasuryRequestId: state.treasuryRequestId,
            vote: state.vote
        }
    
        const coinCanister = await actor.coincanister(provider);
        await coinCanister.approve(Principal.fromText(constants.daoCanisterId), proposalCost);
        const daoCanister = await actor.daoCanister(provider);
        await daoCanister.createProposal({treasury: treasuryRequest});
        setLoading(false);
    }

    return <>
        <Form onSubmit={onFormSubmit} className="proposal-form"> 
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
        <Form.Group className="mb-3" controlId="formBasicDescription">
        <Form.Label>Treasury Request</Form.Label>
        <Typeahead
        inputProps={{ required: true }}
        id="treasuryRequests"
        onChange={(selected: Array<TypeAheadChoice>) => {
            if (selected.length > 0) {
                setValue("treasuryRequestId", selected[0]?.id)
            }
        }}
        options={typeAheadOption}
        renderMenuItemChildren={(option: TypeAheadChoice) => (
            <div>
              {option.label}
              <div>
                <small>{option.description}</small>
              </div>
            </div>
          )}
        />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check type="checkbox" label="Approve" onChange={(e) => setValue("vote", e?.target?.checked)} />
        </Form.Group>
        <Button variant="info" type="submit">
            Submit
        </Button>
        </Form>
    </>
 
}

export default TreasuryExecution