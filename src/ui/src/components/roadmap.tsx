import * as React from "react";
import { Button, Col, Container, Navbar, Row } from "react-bootstrap";
import { PieChart, Pie, LabelList, ResponsiveContainer } from "recharts";

const RoadMap = () => {

    
    return <>
     <Container fluid className="darken">
        <h1>Road Map</h1>
        <p>The future of Cig Dao is not clear but our goals are concrete. 
            We want to create, fund and deploy tools that will help fund projects in the IC ecosystem. 
            This is a casual list of functionalities we are calling a road map. 
            Our methods will probably be misunderstood by some but most of web3 is misunderstood and that's ok. 
            All great crypto projects started with a little bit of degen!</p>

        <p>Without further ado in no particular order, these are the projects we plan to develop</p>
        <ol>
            <li>Novel token launch</li>
            <li>DAO for governance on CryptoIsGood named neuron</li>
            <li>DAO integration with social media</li>
            <li>DAO integration with NFT trading</li>
            <li>Meme Coin Factory for coins modeled directly like "Your Coin"</li>
            <li>DAO frame work similar to SNS for meme coins</li>
            <li>DAO launch pad similar to DaoMaker</li>
        </ol>

     </Container>
    </>
    
}

export default RoadMap