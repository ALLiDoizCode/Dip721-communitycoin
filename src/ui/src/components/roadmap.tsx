import * as React from "react";
import { Button, Col, Container, Navbar, Row } from "react-bootstrap";
import { PieChart, Pie, LabelList, ResponsiveContainer } from "recharts";

const RoadMap = () => {

    
    return <>
     <Container className="darken">
        <h1>Road Map</h1>
        <p>Crypto is Good dao is a fluid dao and what you see here is not promies. 
            These is a casual list of functinalities we are calling a road map we hope to bring that we think would
            help the IC community long term. Our true goal is to increase liquidity within the ecosystem and foster development for the greater good.
            Our methods will probably be misunderstood by some but most of web3 is misunderstood and that is a reality. All great crypto projects started with a little bit of degen.</p>

        <p>Without further ado in no particular order, these are the projects we plan to develop</p>
        <ol>
            <li>DAO for governance on Crypto is Good named neuron</li>
            <li>DAO functionality for funding projects (Shark Tank)</li>
            <li>DAO integration with social media</li>
            <li>Meme Coin Factory for coins modeled directly like "Your Coin"</li>
            <li>Microcap specific swap</li>
            <li>DEX aggregator within the IC</li>
            <li>DEX aggregator with Ethereum</li>
        </ol>

     </Container>
    </>
    
}

export default RoadMap