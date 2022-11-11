import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import bigDecimal from "js-big-decimal";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Modal, Row, Table } from "react-bootstrap";
import { useRecoilState } from "recoil";
import { createActor, idlFactory } from "../declarations/token";
import { _SERVICE } from "../declarations/token/token.did";
import { connectedAtom, principalAtom, ycBalanceAtom } from "../lib/atoms";
import {
  fetchRounds,
  getLastRound,
  getDistributionStart,
  getTokensPerRound,
  TokenSaleRound,
  fetchRoundsByPrincipal,
} from "../lib/http";
import { bigIntToDecimal } from "../lib/util";
import WalletConnector from "./wallet-connector";

export default function Tokensale() {
  const [connected] = useRecoilState(connectedAtom);
  const [principal] = useRecoilState(principalAtom);

  const [maxRounds, setMaxRounds] = useState(0);
  const [tokensPerRound, setTokensPerRound] = useState(0);
  const [rounds, setRounds] = useState<TokenSaleRound[]>([]);
  const [userInvestedRounds, setUserInvestedRounds] = useState<TokenSaleRound[]>([]);
  const [investModalOpen, setInvestModalOpen] = useState(0);
  const [balance, setBalance] = useState("");

  useEffect(() => {
    if (maxRounds === 0) {
      initialize();
    }
  }, []);

  useEffect(() => {
    if (!Principal.fromText(principal).isAnonymous()) {
      getUserInvestedRounds();
      getWicpBalance();
    }
  }, [connected]);

  async function initialize() {
    try {
      const maxRounds = await getLastRound();
      setMaxRounds(maxRounds);

      const tokensPerRound = await getTokensPerRound();
      setTokensPerRound(tokensPerRound);

      const rounds = await fetchRounds();
      setRounds(rounds);
    } catch (error) {
      console.log(error);
    }
  }

  async function getUserInvestedRounds() {
    try {
      const userInvestedRounds = await fetchRoundsByPrincipal(principal.toString());
      setUserInvestedRounds(userInvestedRounds);

      const rounds = await fetchRounds();
      setRounds(rounds);
    } catch (error) {
      console.log(error);
    }
  }

  async function getWicpBalance() {
    try {
      const actor = createActor("utozz-siaaa-aaaam-qaaxq-cai", { agentOptions: { host: "https://ic0.app" } });

      const balance = await actor.balanceOf(Principal.fromText(principal));
      setBalance(new bigDecimal(balance).getPrettyValue(8, ","));
    } catch (error) {
      console.log(error);
    }
  }

  function renderRow(day: number) {
    const totalTokens = bigIntToDecimal(tokensPerRound).getPrettyValue(3, ",") + " YC";
    const totalInvested = rounds.find((r) => r.day === day)?.amount ?? 0;
    const userInvested = userInvestedRounds.find((r) => r.day === day)?.amount ?? 0;
    const userInvestedPercentage = Number.isNaN((userInvested / totalInvested) * 100)
      ? 0
      : (userInvested / totalInvested) * 100;
    return (
      <tr key={day}>
        <td style={{ verticalAlign: "middle" }}>#{day}</td>
        <td style={{ verticalAlign: "middle" }}>{totalTokens}</td>
        <td style={{ verticalAlign: "middle" }}>{totalInvested} WICP</td>
        <td style={{ verticalAlign: "middle" }}>
          {userInvested + " WICP" + ` (${userInvestedPercentage.toFixed(2)}%)`}
        </td>
        <td style={{ verticalAlign: "middle" }}>
          <button disabled={!connected} onClick={() => setInvestModalOpen(day)} className="btn btn-success">
            Buy
          </button>
        </td>
      </tr>
    );
  }

  function renderModal() {
    return (
      <Modal show={investModalOpen > 0} onHide={() => setInvestModalOpen(0)}>
        <Modal.Header closeButton>
          <Modal.Title>Deposit for day {investModalOpen}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Investment amount in WICP</Form.Label>
              <Form.Control type="number" placeholder="0" />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => setInvestModalOpen(0)} variant="secondary">
            Close
          </Button>
          <Button variant="primary">Approve</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  function renderTable() {
    let days: number[] = [];
    for (let i = 1; i <= maxRounds; i++) {
      days.push(i);
    }
    return (
      <Table hover size="sm">
        <thead>
          <tr>
            <th>Day</th>
            <th>Total tokens</th>
            <th>Total invested</th>
            <th>Your investment</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{days.map(renderRow)}</tbody>
      </Table>
    );
  }

  return (
    <div>
      <Container fluid className="darken">
        <Row>
          <Col xxs="6">
            <h1>Cig Dao</h1>
          </Col>
          <Col xxs="6" className="text-right text-end">
            <WalletConnector className="btn-group-dao"></WalletConnector>
          </Col>
          <Col xxs="12">
            {connected ? (
              <span className="text-success">Connected</span>
            ) : (
              <span className="text-danger">Not Connected</span>
            )}
          </Col>
          <Col xxs="12">{"Principal: " + principal}</Col>
          <Col xxs="12">{"WICP Balance: " + balance}</Col>
        </Row>
      </Container>
      <div style={{ background: "#ffffff" }}>{renderTable()}</div>
      {renderModal()}
    </div>
  );
}
