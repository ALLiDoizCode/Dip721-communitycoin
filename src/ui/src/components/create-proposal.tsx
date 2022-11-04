import * as React from "react";
import { Row} from "react-bootstrap";

const CreateProposal = () => {
    const state = {
        step: 1,
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip:'',
    }
    
    switch (state.step) {
        case 1:
            return <></>
        case 2:
            return <></>
    }
    
}

export default CreateProposal