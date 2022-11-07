import { Principal } from "@dfinity/principal";
import * as React from "react";
import { Button, Form} from "react-bootstrap";
import { MemberDraft } from "../declarations/dao/dao.did";
import { consumer } from "../lib/util";

const MemberDraftComponent = (param: {setConsumer: consumer<MemberDraft>}) => {

    const [state, setState] = React.useState({} as MemberDraft);

    function setValue(name, value) {
        state[name] = value;
        setState(state);
    }

    async function onFormSubmit(e) {
        e.preventDefault();
        param.setConsumer(state);
    }

    return <>
    <Form className="proposal-form" validated onSubmit={onFormSubmit}>
        <Form.Group className="mb-3" controlId="formBasicPrincipal">
            <Form.Label>Principal</Form.Label>
            <Form.Control required type="text" onChange={(e) => setValue("principal", e?.target?.value)} placeholder="Enter Principal" />
            <Form.Text className="text-muted">
            Enter a valid Principal
            </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control required type="text" placeholder="Description"  onChange={(e) => setValue("description", e?.target?.value)}/>
            <Form.Text className="text-muted">
            Who is this person?
            </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPower">
            <Form.Label>Power</Form.Label>
            <Form.Control required min={0} type="number" placeholder="Enter power" onChange={(e) => setValue("power", e?.target?.value)} />
            <Form.Text className="text-muted">
            How much power does this person have?
            </Form.Text>
        </Form.Group>
        <Button variant="info" type="submit">
            Submit
        </Button>
    </Form>
    </>
 
}

export default MemberDraftComponent