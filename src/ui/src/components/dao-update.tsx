import * as React from "react";
import { Button, Form} from "react-bootstrap";
import { useRecoilState } from "recoil";
import { Typeahead } from 'react-bootstrap-typeahead';
import { connectedAtom, identityProviderAtom, loadingAtom, proposalCostAtom, ycBalanceAtom } from "../lib/atoms";
import { TreasuryRequest, UpgradeRequest } from "../declarations/dao/dao.did";
import { Principal } from "@dfinity/principal";
import actor from "../declarations/actor";
import constants from "../declarations/constants";
import axios from "axios";
import { ParseConfig  } from "@dfinity/candid";
import sha256 from "sha256";
import bigDecimal from "js-big-decimal";

const DaoUpdate = (param: {proposalCost: bigDecimal}) => {
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
    const [ycBalance, setYcBalance] = useRecoilState(ycBalanceAtom);
    const [connected, setConnected] = useRecoilState(connectedAtom);


    function setValue(name, value) {
        state[name] = value;
        setState(state);
    }

    async function fileToByteArray(e) {
        const data = await readFileDataAsBase64(e);
        let arrayBuffer = data;
        if (typeof data === 'string' || data instanceof String) {
            const response = await axios.get(data as string, {
                responseType: 'arraybuffer'
            });

            arrayBuffer = response.data;
        }

        const bytes = Array.from(new Uint8Array(arrayBuffer as ArrayBuffer));
        setValue("wasm", bytes);
    }

    function readFileDataAsBase64(e): Promise<ArrayBuffer | string> {
        const file = e.target.files[0];
        console.log(file);
    
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
    
            reader.onload = (event) => {
                if (event)
                    resolve(event?.target?.result as any);
            };
    
            reader.onerror = (err) => {
                reject(err);
            };
    
            reader.readAsDataURL(file);
        });
    }

    async function onFormSubmit(e) {
        e.preventDefault();
        console.log(state);
        setLoading(true);

        const canisterObj = (() => {
            switch (state.canister) {
                case "dao":
                    return {"dao": null}
                case "controller":
                    return {"controller": null}
                case "community":
                    return {"community": null}
                case "treasury":
                    return {"treasury": null}
            }
        })();

        const upgrade: UpgradeRequest = {
            title: state.title,
            description: state.description,
            args: [],
            hash: sha256(state.wasm).toString(),
            wasm: state.wasm,
            canister: canisterObj as any,
            source: state.source
        }
            
        const coinCanister = await actor.coincanister(provider);
        await coinCanister.approve(Principal.fromText(constants.daoCanisterId), proposalCost);
        const daoCanister = await actor.daoCanister(provider);
        await daoCanister.createProposal({upgrade: upgrade});
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

        <Form.Group className="mb-3" controlId="formBasicTitle">
            <Form.Label>Github Link</Form.Label>
            <Form.Control required type="text" placeholder="Enter Source" onChange={(e) => setValue("source", e?.target?.value)}/>
            <Form.Text className="text-muted">
                Github Link
            </Form.Text>
        </Form.Group>

        <Form.Group controlId="formFileLg" className="mb-3">
            <Form.Label>Wasm</Form.Label>
            <Form.Control accept=".wasm" onChange={fileToByteArray} type="file" size="lg" />
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

        {param.proposalCost.compareTo(ycBalance) > 1  || !connected && <>
        <span className="text-danger">
            You don't have enough YC to make a proposal or you are not connected
        </span>
        <br/>
        </>}

        <Button disabled={param.proposalCost.compareTo(ycBalance) > 1  || !connected} variant="info" type="submit">
            Submit
        </Button>
        </Form>
    </>
 
}

export default DaoUpdate