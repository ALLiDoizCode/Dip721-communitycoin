import { Principal } from "@dfinity/principal";
import * as React from "react";
import { Button, Col, Container, Navbar, Row } from "react-bootstrap";
import { PieChart, Pie, LabelList, ResponsiveContainer } from "recharts";
import { daocanister, coincanister } from "../declarations/agent";
import LaunchTimer from "./launch-timer";
const Description = () => {
  const [vcTreasury, setVcTreasury] = React.useState(BigInt(0));
  const [burnWallet, setBurnWallet] = React.useState(BigInt(0));
  const [marketingTresury, setMarketingTreasury] = React.useState(BigInt(0));

  React.useEffect(() => {
    coincanister().balanceOf(Principal.fromText("unwqb-kyaaa-aaaak-ac5aa-cai")).then(result => {
      setVcTreasury(result);
    });
    coincanister().balanceOf(Principal.fromText("wrzvo-gu4p7-nshc5-hx4mk-rtzx2-vrkpa-i2sge-3h2gh-xh5mc-33wqm-mae")).then(result => {
      setBurnWallet(result);
    });
    coincanister().balanceOf(Principal.fromText("765oi-n47ml-w577g-qxh4n-uooko-kclh2-mfwar-5ico6-wx67f-z7jqv-3qe")).then(result => {
      setMarketingTreasury(result);
    });
    
  }, []);


    const data01 = [
        {
          "name": "Burnt",
          "value": 3
        },
        {
          "name": "Passive Income",
          "value": 3
        },
        {
          "name": "Marketing Treasury",
          "value": 2
        },
        {
          "name": "Venture Capital Treasury",
          "value": 3
        },
        {
          "name": "Untaxed",
          "value": 89
        }
      ];


    
    return <>
    <div className="padding">
        <h1>Your Token</h1>
        <h3 className="silenced">A token that funds the Internet Computer</h3>
        <Row style={{maxWidth: "600px", marginLeft: "auto", marginRight: "auto"}}>
            <Col><Button disabled className="button-size" variant="success" size="lg">Buy Now</Button></Col>
            <Col><Button disabled className="button-size" variant="secondary" size="lg">Token Info</Button></Col>
            <Col><Button disabled href="#/dao" className="btn btn-lg button-size btn-outline-dark" >Enter Dao</Button></Col>
        </Row>
        <br></br>
        <LaunchTimer></LaunchTimer>
        {/* <div style={{maxWidth: "400px", marginLeft: "auto", marginRight: "auto"}} className="darken container-sm"> 
        <h1>Treasuries</h1>
        <Row >
          <Col>
          <label className="label">VC:</label>
          </Col>
          <Col>
          <label className="value">{(vcTreasury/BigInt(100000)).toString() + " YC"}</label>
          </Col>
        </Row>

        <Row >
          <Col>
          <label className="label">Marketing:</label>
          </Col>
          <Col>
          <label className="value">{(marketingTresury/BigInt(100000)).toString() + " YC"}</label>
          </Col>
        </Row>
        <Row >
          <Col>
          <label className="label">Burnt:</label>
          </Col>
          <Col>
          <label className="value">{(burnWallet/BigInt(100000)).toString() + " YC"}</label>
          </Col>
        </Row>
        </div> */}
        
    </div>
    <Container className="darken">
        <Row>
            <Col >
            <h1>Token Explained</h1>
            </Col>
        </Row>
        <Row>
            <Col md="12" lg="6">
        <p>Your token is the governance token for the Crypto is Good Dao.
        Your Token is also a novel defi self staking technology with a tax system that encourages holding.</p>
        <p>Every transaction done with YC will cost 11% distributing passive income to holders.</p>
        <ul>
            <li>Three percent will be burnt</li>
            <li>Three percent distributed as passive income</li>
            <li>Two percent distributed to marketing treasury</li>
            <li>Three percent distributed to VC treasury</li>
        </ul>
            </Col>
            <Col md="12"  lg="6">
            <ResponsiveContainer >
                <PieChart height={250}>
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
        </Row>
    </Container>
    </>
    
}

export default Description