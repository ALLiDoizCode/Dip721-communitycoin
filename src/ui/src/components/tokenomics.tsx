import { Principal } from "@dfinity/principal";
import bigDecimal from "js-big-decimal";
import * as React from "react";
import { Col, Container, Row, Tooltip } from "react-bootstrap";
import { Pie, PieChart, ResponsiveContainer, Sankey } from "recharts";
import actor from "../declarations/actor";
import util from "../lib/util";

const Tokenomics = () => {
  const [maxSupply, setMaxSupply] = React.useState(1n);

  React.useEffect(() => {
    actor.coinCanister().then((canister) => {
      canister.getMetadata().then(data => {
        setMaxSupply(data.totalSupply);
      });
    })
  }, []);

    const data01 = [
        {
          "name": "Token Burn",
          "value": 50
        },
        {
          "name": "Initial Liquidity",
          "value": 20
        },
        {
          "name": "Token Distribution",
          "value": 20
        },
        {
          "name": "Marketing",
          "value": 10
        }
      ];

    
    return <>
        <Container fluid className="darken">
            <Row>
                <Col><h1>Tokenomics</h1></Col>
            </Row>
        <Row>
            <Col style={{minHeight: "250px"}} className="hidden-sm" md="12" lg="6">
            <ResponsiveContainer>
                <PieChart>
                    <Pie data={data01} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#D6CCC2" labelLine        label={({
          cx,
          cy,
          midAngle,
          innerRadius,
          outerRadius,
          value,
          index
        }) => {
          const RADIAN = Math.PI / 180;
          const radius = 25 + innerRadius + (outerRadius - innerRadius);
          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);

          return (
            <text
              x={x}
              y={y}
              fill="#7E7E7E"
              textAnchor={x > cx ? "start" : "end"}
              dominantBaseline="central"
            >
              {data01[index].name} ({value})%
            </text>
          );
        }}
      />
                </PieChart>
                </ResponsiveContainer>
            </Col>
            <Col md="12" lg="6">
        <p>Your Coin is a deflationary token. Tokenomics are designed to empower the average person. No wallet can hold more then 1 percent of the supply. </p>
        <p>Max Supply: {util.bigIntToDecimalPrettyString(maxSupply)}</p>
        <ul>
            <li>50% to Burn</li>
            <li>20% for Initial liquidity</li>
            <li>20% for Token Distribution</li>
            <li>10% for Marketing</li>
        </ul>
            </Col>
        </Row>
    </Container>
    </>
    
}

export default Tokenomics