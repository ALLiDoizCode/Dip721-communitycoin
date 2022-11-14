import { Principal } from "@dfinity/principal";
import bigDecimal from "js-big-decimal";
import * as React from "react";
import { Button, Col, Container, Navbar, Row } from "react-bootstrap";
import actor from "../declarations/actor";
import { bigIntToDecimal } from "../lib/util";

const Distributions = (param: {distribuptionTime: Date, distributionLength: number}) => {


    const [distributedAmount, setDistributedAmount] = React.useState<bigDecimal>(new bigDecimal(1));

    React.useEffect(() => {
        actor.coinCanister().then((canister) => {
            canister.balanceOf(Principal.fromText("cjzlc-riaaa-aaaal-qbgwa-cai")).then(amount => {
                setDistributedAmount(bigIntToDecimal(amount));
            });
        })
      }, []);
    
    return <>
     <Container fluid className="darken">
        <h1>Distribution</h1>
        <Row>
            <Col md="12" lg="6">
                <p>{`The Your Token distribution will take place over 1 year starting on
                    ${param.distribuptionTime.toLocaleDateString()} at 
                    ${param.distribuptionTime.toLocaleTimeString()}. 
                    ${distributedAmount.getPrettyValue(3, ",")} of Your Tokens 
                    will be distributed according to the schedule below:`}
                    </p>
                    <p>{`${distributedAmount.getPrettyValue(3, ",")} 
                    of Your Tokens will then be split evenly into ${param.distributionLength}
                    consecutive 23 hour periods of 
                    ${(distributedAmount.divide(new bigDecimal(param.distributionLength), 0)).getPrettyValue(3, ",")}
                    Your tokens each beginning on date and time UTC. 
                    At the end of each 23 hour period referred to above, 
                    the respective set number of Your Tokens 
                    set forth above will be distributed pro 
                    rata amongst all purchasers, based on the total 
                    $ICP contributed during those periods, respectively, 
                    as follows: Number of Your Tokens distributed to a purchaser = a * (b/c) `}</p>

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