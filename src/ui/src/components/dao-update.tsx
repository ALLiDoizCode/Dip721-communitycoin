import * as React from "react";
import { Button, Form} from "react-bootstrap";
import { useRecoilState } from "recoil";
import { Typeahead } from 'react-bootstrap-typeahead';
import { identityProviderAtom, loadingAtom, proposalCostAtom } from "../lib/atoms";
import { TreasuryRequest } from "../declarations/dao/dao.did";
import { Principal } from "@dfinity/principal";
import actor from "../declarations/actor";
import constants from "../declarations/constants";

const DaoUpdate = () => {
    interface UpgradeRequestForm {
        title: string;
        description: string;
        source: string;
        args: number[];
        hash: string;
        wasm: number[];
        canister: string;
      }

    const [loading, setLoading] = useRecoilState(loadingAtom);
    const [state, setState] = React.useState({} as UpgradeRequestForm);
    const [provider, setProvider] = useRecoilState(identityProviderAtom);
    const [proposalCost, setProposalCost] = useRecoilState(proposalCostAtom);


    function setValue(name, value) {
        state[name] = value;
        setState(state);
    }

    function getFileArray(file): Promise<ArrayBuffer | string>{
        return new Promise((acc, errorReturn) => {
            const reader = new FileReader();
            reader.onload = (event) => { acc(event.target.result) };
            reader.onerror = (err)  => { errorReturn(err) };
            reader.readAsArrayBuffer(file);
        });
     }

    async function fileToByteArray(e) {
        var arrayBuffer = e.target.result;
        var bytes = new Uint8Array(arrayBuffer);
        setValue("wasm", bytes);
    }

    function readFileDataAsBase64(e) {
        const file = e.target.files[0];
    
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
    
            reader.onload = (event) => {
                resolve(event.target.result);
            };
    
            reader.onerror = (err) => {
                reject(err);
            };
    
            reader.readAsDataURL(file);
        });
    }

    async function onFormSubmit(e) {
        e.preventDefault();
        // setLoading(true);
        // const treasuryRequest: TreasuryRequest = {
        //     title: state.title,
        //     description: state.description,
        //     treasuryRequestId: state.treasuryRequestId,
        //     vote: state.vote
        // }
    
        // const coinCanister = await actor.coincanister(provider);
        // await coinCanister.approve(Principal.fromText(constants.daoCanisterId), proposalCost);
        // const daoCanister = await actor.daoCanister(provider);
        // await daoCanister.createProposal({treasury: treasuryRequest});
        // setLoading(false);
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

        <Form.Group className="mb-3" controlId="formBasicTitle">
            <Form.Label>Source</Form.Label>
            <Form.Control required type="text" placeholder="Enter Source" onChange={(e) => setValue("source", e?.target?.value)}/>
            <Form.Text className="text-muted">
                Who are you?
            </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicTitle">
            <Form.Label>Args</Form.Label>
            <Form.Control required type="text" placeholder="Enter Args" onChange={(e) => setValue("args", e?.target?.value.split(","))}/>
            <Form.Text className="text-muted">
                Array of args seperated by comma, example:
                <div>-p,people,-d,/src/s</div>
            </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicTitle">
            <Form.Label>Hash</Form.Label>
            <Form.Control required type="text" placeholder="Enter Hash" onChange={(e) => setValue("args", e?.target?.value)}/>
            <Form.Text className="text-muted">
                Hash of wasm
            </Form.Text>
        </Form.Group>

        <Form.Group controlId="formFileLg" className="mb-3">
            <Form.Label>Wasm</Form.Label>
            <Form.Control accept=".gz" onLoad={fileToByteArray} type="file" size="lg" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formCanister">
        <Form.Label column sm="3">
          Canister
        </Form.Label>
        <Form.Select aria-label="Canister" onChange={(e) => setValue("canister", e?.target?.value)}>
            <option>Canister</option>
            <option value="dao">Dao</option>
            <option value="controller">Controller</option>
            <option value="community">Community</option>
            <option value="treasury">Treasury</option>
        </Form.Select>
        <Form.Text className="text-muted">
            Canister to update
        </Form.Text>
      </Form.Group>

        <Button variant="info" type="submit">
            Submit
        </Button>
        </Form>
    </>
 
}

export default DaoUpdate