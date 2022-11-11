import * as React from "react";
import { Col, Container, Row, Tooltip } from "react-bootstrap";
import { Pie, PieChart, ResponsiveContainer, Sankey } from "recharts";

const Tokenomics = () => {
    const data01 = [
        {
          "name": "Initial Liquidity Pool",
          "value": 75
        },
        {
          "name": "Airdrops",
          "value": 20
        },
        {
          "name": "Marketing",
          "value": 5
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
        <p>Tokenomics are designed to empower the average person. No wallet can hold more then 1 percent of the supply. </p>
        <ul>
            <li>75% for Initial liquidity pool</li>
            <li>20% for Airdrops</li>
            <li>5% for Marketing</li>
        </ul>
            </Col>
        </Row>
    </Container>
    </>
    
}

export default Tokenomics