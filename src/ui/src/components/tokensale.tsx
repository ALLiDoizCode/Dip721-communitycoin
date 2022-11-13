import "../styles/token-sale-styles.css";
import { Principal } from "@dfinity/principal";
import bigDecimal from "js-big-decimal";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Modal, Row, Spinner, Table } from "react-bootstrap";
import { useRecoilState } from "recoil";
import actor from "../declarations/actor";
import { distributionCanisterId, treasuryCanisterId } from "../declarations/constants";
import { _SERVICE } from "../declarations/token/token.did";
import { connectedAtom, identityProviderAtom, principalAtom, ycBalanceAtom } from "../lib/atoms";
import { dateFromNano } from "../lib/dateHelper";
import {
  fetchRounds,
  getLastRound,
  getStart,
  getTokensPerRound,
  TokenSaleRound,
  fetchRoundsByPrincipal,
} from "../lib/http";
import { bigIntToDecimal } from "../lib/util";
import WalletConnector from "./wallet-connector";

export default function Tokensale() {
  const [connected] = useRecoilState(connectedAtom);
  const [principal] = useRecoilState(principalAtom);
  const [provider] = useRecoilState(identityProviderAtom);

  const [maxRounds, setMaxRounds] = useState(0);
  const [tokensPerRound, setTokensPerRound] = useState(0);
  const [rounds, setRounds] = useState<TokenSaleRound[]>([]);
  const [userInvestedRounds, setUserInvestedRounds] = useState<TokenSaleRound[]>([]);
  const [balance, setBalance] = useState("");
  const [investDay, setInvestDay] = useState(0);
  const [investAmount, setInvestAmount] = useState(0.0);
  const [startDate, setStartDate] = useState<DateTime>(DateTime.now());
  const [isLoading, setIsLoading] = useState(false);

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

      const start = await getStart();
      setStartDate(dateFromNano(start));
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
      const wicpActor = await actor.wicpCanister();
      const balance = await wicpActor.balanceOf(Principal.fromText(principal));
      setBalance(new bigDecimal(balance).getPrettyValue(8, ","));
    } catch (error) {
      console.log(error);
    }
  }

  async function wicpTransfer() {
    try {
      setIsLoading(true);
      const wicpActor = await actor.wicpCanister(provider);
      const approve = await wicpActor.approve(Principal.fromText(distributionCanisterId), BigInt(investAmount));
      if ("Ok" in approve) {
        const distributionActor = await actor.distributionCanister(provider);
        await distributionActor.deposit(investDay, BigInt(investAmount));

        await getUserInvestedRounds();
        await getWicpBalance();
        setInvestDay(0);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function renderRow(day: number) {
    const totalTokens = bigIntToDecimal(tokensPerRound).getPrettyValue(3, ",") + " YC";
    const totalInvested = rounds.find((r) => r.day === day)?.amount / 100000000 ?? 0;
    const userInvested = userInvestedRounds.find((r) => r.day === day)?.amount / 100000000 ?? 0;
    const userInvestedPercentage = Number.isNaN((userInvested / totalInvested) * 100)
      ? 0
      : (userInvested / totalInvested) * 100;

    const today = DateTime.now();
    const canInvest = startDate.plus({ days: day }) >= today;
    const currentDate = startDate.plus({ days: day - 1 }).toFormat("dd-MM-yyyy") === today.toFormat("dd-MM-yyyy");
    console.log(currentDate);
    return (
      <tr key={day} className={canInvest ? (currentDate ? "current-date" : "") : "past-date"}>
        <td style={{ verticalAlign: "middle" }}>#{day}</td>
        <td style={{ verticalAlign: "middle" }}>{startDate.plus({ days: day - 1 }).toFormat("dd-MM-yyyy")}</td>
        <td style={{ verticalAlign: "middle" }}>{totalTokens}</td>
        <td style={{ verticalAlign: "middle" }}>{new bigDecimal(totalInvested).getPrettyValue(8, ",")} WICP</td>
        <td style={{ verticalAlign: "middle" }}>
          {isNaN(userInvested)
            ? "Not invested"
            : new bigDecimal(userInvested).getPrettyValue(8, ",") +
              " WICP" +
              ` (${userInvestedPercentage.toFixed(2)}%)`}
        </td>
        <td style={{ verticalAlign: "middle" }}>
          <button disabled={!connected || !canInvest} onClick={() => setInvestDay(day)} className="btn btn-success">
            Buy
          </button>
        </td>
      </tr>
    );
  }

  function renderModal() {
    return (
      <Modal backdrop="static" show={investDay > 0} onHide={() => setInvestDay(0)}>
        <Modal.Header closeButton>
          <Modal.Title>Deposit for day {investDay}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Investment amount in WICP</Form.Label>
              <Form.Control
                onChange={(e) => setInvestAmount(Number(e.target.value) * 100000000)}
                type="number"
                placeholder="0"
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button disabled={isLoading} onClick={() => setInvestDay(0)} variant="secondary">
            Close
          </Button>
          <Button disabled={isLoading} onClick={wicpTransfer} variant="primary">
            {isLoading ? <Spinner animation="border" role="status" size="sm"></Spinner> : "Approve"}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  function renderTable() {
    let days: number[] = [];
    for (let i = 1; i <= maxRounds - 1; i++) {
      days.push(i);
    }
    return (
      <Table hover size="sm">
        <thead>
          <tr>
            <th>Day</th>
            <th>Start date</th>
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
