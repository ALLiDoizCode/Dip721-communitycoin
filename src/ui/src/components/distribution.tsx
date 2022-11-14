import bigDecimal from "js-big-decimal";
import * as React from "react";
import { Button, Col, Container, Navbar, Row } from "react-bootstrap";

const Distributions = (param: {distribuptionTime: Date, tokenDistributedCount: bigDecimal, distributionLength: number}) => {

    
    return <>
     <Container fluid className="darken">
        <h1>Distribution</h1>
        <Row>
            <Col md="12" lg="6">
            <p>{`The Your Token distribution will take place over 6 months starting on
                ${param.distribuptionTime.toLocaleDateString() + " at " + param.distribuptionTime.toLocaleTimeString()}. 
                ${param.tokenDistributedCount.getPrettyValue(3, ",")} of Your Tokens will be distributed according to the schedule below:`}
                </p>
 <p>{`${param.tokenDistributedCount.getPrettyValue(3, ",")} of Your Tokens will then be split evenly into ${param.distributionLength} consecutive 23 hour periods of 
 ${(param.tokenDistributedCount.divide(new bigDecimal(param.distributionLength), 8)).getPrettyValue(3, ",")}
  Your tokens each beginning on date and time UTC. 
At the end of each 23 hour period referred to above, the respective set number of Your Tokens set forth above will be
 distributed pro rata amongst all authorized purchasers, based on the total ether (“$ICP”) contributed during those periods, respectively, as follows: 
Number of Your Tokens distributed to a purchaser = a * (b/c)`}</p>

<ul>
    <li>a = Total $ICP contributed by a purchaser during the period.</li>
    <li>b = Total number of Your Tokens available for distribution in the period.</li>
    <li>c = Total $ICP contributed by all authorized purchasers during the period.</li>
</ul>
            </Col>
            <Col className="text-center" md="12" lg="6">
            <img width={"70%"} src="cigdaodis.svg" />

            </Col>
        </Row>


     </Container>
    </>
    
}

export default Distributions