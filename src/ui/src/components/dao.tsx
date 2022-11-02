import * as React from "react";
import { Col, Container, Row} from "react-bootstrap";
import { daocanister } from "../declarations/agent";

const Dao = () => {

    const [activeProposal, setActiveProposal] = React.useState({});

    React.useEffect(() => {
      
    }, []);
    
    return <>
     <Container className="darken">
        <Row>
            <Col xxs="10"><h1>Crypto is Good Dao</h1></Col>
            <Col xxs="2" className="text-right text-end"><a href="#" className="btn btn-dark" >Back</a></Col>
        </Row>
        <Row>
            <Col>1 of 3</Col>
            <Col>2 of 3</Col>
        </Row>
     </Container>
    </>
    
}

export default Dao