import { Principal } from "@dfinity/principal";
import * as React from "react";
import { Button, Form} from "react-bootstrap";
import { ThresholdDraft } from "../declarations/dao/dao.did";
import { consumer } from "../lib/util";

const ThresholdDraftComponent = (param: {setConsumer: consumer<ThresholdDraft>}) => {

    const [state, setState] = React.useState({} as ThresholdDraft);

    function setValue(name, value) {
        state[name] = value;
        setState(state);
    }

    async function onFormSubmit(e) {
        e.preventDefault();
        param.setConsumer(state);
    }

    return <>
    <Form className="proposal-form" onSubmit={onFormSubmit}>
        <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control required type="text" placeholder="Description"  onChange={(e) => setValue("description", e?.target?.value)}/>
            <Form.Text className="text-muted">
            Who is this person?
            </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPower">
            <Form.Label>Power</Form.Label>
            <Form.Control required min={0} type="number" placeholder="Enter power" onChange={(e) => setValue("power", Number(e?.target?.value))} />
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

export default ThresholdDraftComponent