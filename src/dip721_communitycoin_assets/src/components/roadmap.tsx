import * as React from "react";
import { Button, Col, Container, Navbar, Row } from "react-bootstrap";
import { PieChart, Pie, LabelList, ResponsiveContainer } from "recharts";

const Description = () => {

    
    return <>
    <div className="padding">
        <h1>Community token that funds the Internet Computer</h1>
        <p>A CryptoIsGood DAO product</p>
        <Row style={{maxWidth: "400px", marginLeft: "auto", marginRight: "auto"}}>
            <Col><Button className="button-size" variant="secondary" size="lg">Buy Now</Button></Col>
            <Col><Button className="button-size" variant="outline-secondary" size="lg">Token Info</Button></Col>
        </Row>
    </div>
    <Container className="darken">
        <Row>
            <Col>
            <h1>Tax System Explained</h1>
            </Col>
        </Row>
        <Row>
            <Col>
        <p>Crypto is good token is a novel defi technology with a tax system that encourages holding.</p>
        <p>Every transaction done with CIG will cost 11% to it's holder.</p>
        <ul>
            <li>Three percent will be burnt</li>
            <li>Three percent distributed as passive income</li>
            <li>Two percent distributed to marketing treasury</li>
            <li>Three percent distributed to VC treasury</li>
        </ul>
            </Col>
        </Row>
    </Container>
    </>
    
}

export default Description