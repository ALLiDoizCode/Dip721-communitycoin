import { Principal } from "@dfinity/principal";
import * as React from "react";
import { Button, Form} from "react-bootstrap";
import { MemberDraft } from "../declarations/dao/dao.did";
import { consumer } from "../lib/util";

const TransferDraftComponent = (param: {setConsumer: consumer<MemberDraft>}) => {

    const [state, setState] = React.useState({} as MemberDraft);
    const [isInvalidPrincipal, setIsInvalidPrincipal] = React.useState(true);

    function setValue(name, value, e?) {
        state[name] = value;
        setState(state);
    }

    async function onFormSubmit(e) {
        e.preventDefault();
        param.setConsumer(state);
    }

    return <>
    <Form className="proposal-form" onSubmit={onFormSubmit}>
        <Form.Group className="mb-3" controlId="formBasicPrincipal">
            <Form.Label>Recipient</Form.Label>
            <Form.Control isValid={!isInvalidPrincipal} isInvalid={isInvalidPrincipal} required type="text" onChange={(e) => {

                try {
                    const princ = Principal.fromText(e?.target?.value);
                    setIsInvalidPrincipal(!princ._isPrincipal);
                } catch (e) {
                    setIsInvalidPrincipal(true);
                }
                
                setValue("recipient", e?.target?.value, e);
                
                }} placeholder="Enter Principal" />
            <Form.Text className="text-muted">
            Enter a Recipient Principal
            </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control required type="text" placeholder="Description"  onChange={(e) => setValue("description", e?.target?.value, e)}/>
            <Form.Text className="text-muted">
            Who is this person?
            </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formAmount">
            <Form.Label>Amount</Form.Label>
            <Form.Control required min={0} type="number" placeholder="Enter amount" onChange={(e) => setValue("amount", Number(e?.target?.value), e)} />
            <Form.Text className="text-muted">
            How much money to transfer?
            </Form.Text>
        </Form.Group>
        <Button variant="info" type="submit">
            Submit
        </Button>
    </Form>
    </>
 
}

export default TransferDraftComponent