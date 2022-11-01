import * as React from "react";
import { Col, Container, Row} from "react-bootstrap";

const Dao = () => {

    const [activeProposal, setActiveProposal] = React.useState({});

    React.useEffect(() => {
      
    }, []);
    
    return <>
     <Container className="darken">
        <Row>
            <Col><h1>Crypto is Good Dao</h1></Col>
        </Row>
        <Row>
            <Col>1 of 3</Col>
            <Col>2 of 3</Col>
        </Row>
     </Container>
    </>
    
}

export default Dao