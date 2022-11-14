import "../styles/token-sale-styles.css";
import { Principal } from "@dfinity/principal";
import bigDecimal from "js-big-decimal";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, Card, Col, Container, Form, InputGroup, ListGroup, Row, Spinner } from "react-bootstrap";
import { useRecoilState } from "recoil";
import actor from "../declarations/actor";
import { distributionCanisterId } from "../declarations/constants";
import { _SERVICE } from "../declarations/token/token.did";
import { connectedAtom, identityProviderAtom, principalAtom } from "../lib/atoms";
import { dateFromNano } from "../lib/dateHelper";
import {
  fetchRounds,
  getLastRound,
  getStart,
  getTokensPerRound,
  fetchRoundsByPrincipal,
  getRoundTime,
} from "../lib/http";
import { bigIntToDecimal } from "../lib/util";
import WalletConnector from "./wallet-connector";

const decimals = 100000000;

interface IRoundData {
  round: number;
  totalTokens: number;
  totalInvested: number;
  userTotalInvested: number;
  unrealisedInvestment: string;
  expired: DateTime;
}

export default function Tokensale() {
  const [connected] = useRecoilState(connectedAtom);
  const [principal] = useRecoilState(principalAtom);
  const [provider] = useRecoilState(identityProviderAtom);

  const [wicpBalance, setWicpBalance] = useState(0);
  const [roundsData, setRoundsData] = useState<{ [value: number]: IRoundData }>([]);
  const [filteredRoundsData, setFilteredRoundsData] = useState<number[]>([]);
  const [roundsInitialized, setRoundsInitialized] = useState(false);

  const [filter, setFilter] = useState<"all" | "participated" | "active">("all");

  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [isLoadingTransfer, setIsLoadingTransfer] = useState<{ [value: number]: boolean }>([]);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (roundsInitialized && connected) {
      getUserData();
      getWicpBalance();
    }

    if (!connected) {
      getRoundsData();
    }
  }, [roundsInitialized, connected]);

  async function initialize() {
    try {
      await getRoundsData();
    } catch (error) {
      console.log(error);
    }
  }

  async function getRoundsData() {
    try {
      setIsLoadingPage(true);
      const maxRounds = await getLastRound();
      const tokensPerRound = await getTokensPerRound();
      const rounds = await fetchRounds();
      const startTime = await getStart();
      const roundTime = await getRoundTime();
      let roundsData: { [value: number]: IRoundData } = [];

      for (let i = 1; i < maxRounds; i++) {
        const totalInvested = rounds.find((r) => r.day === i)?.amount;
        roundsData[i] = {
          round: i,
          totalInvested: !totalInvested ? 0 : totalInvested / decimals,
          totalTokens: tokensPerRound,
          userTotalInvested: 0,
          unrealisedInvestment: "",
          expired: dateFromNano(BigInt(startTime + roundTime * i)),
        };
      }

      setRoundsData(roundsData);
      setRoundsInitialized(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingPage(false);
    }
  }

  async function getUserData() {
    const userInvestedRounds = await fetchRoundsByPrincipal(principal.toString());
    const rounds = await fetchRounds();

    userInvestedRounds.forEach((u) => {
      setRoundsData((prevState) => ({
        ...prevState,
        [u.day]: {
          ...roundsData[u.day],
          totalInvested: rounds.find((r) => r.day === u.day).amount / decimals ?? 0,
          userTotalInvested: u.amount / decimals ?? 0,
        },
      }));
    });
  }

  function setUnrealizedInvestmentForRound(round: number, amount: string) {
    setRoundsData((prevState) => ({ ...prevState, [round]: { ...prevState[round], unrealisedInvestment: amount } }));
  }

  async function getWicpBalance() {
    try {
      const wicpActor = await actor.wicpCanister();
      const balance = await wicpActor.balanceOf(Principal.fromText(principal));
      setWicpBalance(Number(balance) / decimals);
    } catch (error) {
      console.log(error);
    }
  }

  async function wicpTransfer(round: number) {
    try {
      setIsLoadingTransfer((prevState) => ({ ...prevState, [round]: true }));
      const dayInvestAmount = roundsData[round].unrealisedInvestment;
      console.log(dayInvestAmount);
      if (!dayInvestAmount) {
        console.log("Please specify a valid amount");
        return;
      }

      const investment = BigInt(Number(dayInvestAmount) * decimals);
      const wicpActor = await actor.wicpCanister(provider);
      const approve = await wicpActor.approve(Principal.fromText(distributionCanisterId), investment);
      if ("Ok" in approve) {
        const distributionActor = await actor.distributionCanister(provider);
        const response = await distributionActor.deposit(round, investment);
        console.log(response);

        await getUserData();
        await getWicpBalance();
        setUnrealizedInvestmentForRound(round, "");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingTransfer((prevState) => ({ ...prevState, [round]: false }));
    }
  }

  function handleWicpInputChange(round: number, amount: string) {
    if (!amount || amount.match(/^\d{1,}(\.\d{0,8})?$/)) {
      setUnrealizedInvestmentForRound(round, amount);
    }
  }

  function handleRoundsFilter(filter: "all" | "participated" | "active") {
    if (filter === "active") {
      setFilter("active");
      setFilteredRoundsData(
        Object.values(roundsData)
          .filter((r) => r.expired > DateTime.now())
          .map((r) => r.round)
      );
      return;
    }

    if (filter === "participated") {
      setFilter("participated");
      setFilteredRoundsData(
        Object.values(roundsData)
          .filter((r) => r.userTotalInvested > 0)
          .map((r) => r.round)
      );
      return;
    } else {
      setFilter("all");
      setFilteredRoundsData([]);
    }
  }

  function renderCard(data: IRoundData) {
    const totalTokens = bigIntToDecimal(data.totalTokens).getPrettyValue(3, ",") + " YC";
    const userWicpInvestedPercentage = isNaN(data.userTotalInvested / data.totalInvested)
      ? 0
      : (data.userTotalInvested / data.totalInvested) * 100;
    const userYcClaim = data.totalTokens * (userWicpInvestedPercentage / 100);

    let format = "yyyyMMddHHmm";
    const todayFormat = Number(DateTime.now().toFormat(format));
    const investDayFormat = Number(data.expired.toFormat(format));
    const canInvest = investDayFormat >= todayFormat;
    const currentDate = investDayFormat === todayFormat;
    return (
      <Col key={data.round}>
        <Card
          style={{ textAlign: "left" }}
          border={currentDate ? "success" : userWicpInvestedPercentage ? "warning" : ""}
          className={canInvest ? "" : userWicpInvestedPercentage ? "" : "past-date-card"}
        >
          <Card.Header
            as="h6"
            className="custom-card-header"
            style={{
              background: currentDate ? "#198755" : "",
            }}
          >
            <div className="custom-full-width" style={{ color: currentDate ? "#ffffff" : "" }}>
              #{data.round}
            </div>
            <div style={{ color: currentDate ? "#ffffff" : "" }}>{data.expired.toFormat("dd-MM-yyyy HH:mm")}</div>
          </Card.Header>
          <Card.Body>
            <ListGroup>
              <ListGroup.Item as="li">
                <div>
                  <div className="fw-bold">Total tokens</div>
                  {totalTokens}
                </div>
              </ListGroup.Item>
              <ListGroup.Item as="li">
                <div>
                  <div className="fw-bold">Total invested</div>
                  {isNaN(data.totalInvested) ? 0 : new bigDecimal(data.totalInvested).getPrettyValue(8, ",")} WICP
                </div>
              </ListGroup.Item>
              <ListGroup.Item as="li">
                <div>
                  <div className="fw-bold">Your investment</div>
                  {new bigDecimal(data.userTotalInvested).getPrettyValue(8, ",")} WICP
                </div>
              </ListGroup.Item>
              <ListGroup.Item as="li">
                <div>
                  <div className="fw-bold">Your claim</div>
                  <div className="custom-list-group-item">
                    <span>{bigIntToDecimal(userYcClaim).getPrettyValue(3, ",")} YC</span>
                    <span>({userWicpInvestedPercentage.toFixed(2)}%)</span>
                  </div>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
          <Card.Footer className="text-muted">
            {canInvest && connected ? (
              <div className="pt-1 pb-1 custom-full-width">
                <InputGroup style={{ marginRight: 8 }}>
                  <Form.Control
                    disabled={isLoadingTransfer[data.round]}
                    onChange={(e) => handleWicpInputChange(data.round, e.target.value)}
                    type="text"
                    value={data.unrealisedInvestment}
                    placeholder="0"
                  />
                  <InputGroup.Text id="basic-addon2">WICP</InputGroup.Text>
                </InputGroup>
                <Button
                  disabled={
                    isLoadingTransfer[data.round] ||
                    data.unrealisedInvestment === "0" ||
                    data.unrealisedInvestment === ""
                  }
                  onClick={() => wicpTransfer(data.round)}
                  className="btn btn-success"
                >
                  {isLoadingTransfer[data.round] ? (
                    <Spinner animation="border" role="status" size="sm"></Spinner>
                  ) : (
                    "Invest"
                  )}
                </Button>
              </div>
            ) : !connected && canInvest ? (
              <div className="pt-1 pb-1 custom-full-width">
                <Button style={{ width: "100%" }} variant="light" disabled>
                  Not connected
                </Button>
              </div>
            ) : (
              <div className="pt-1 pb-1 custom-full-width">
                <Button style={{ width: "100%" }} variant="light" disabled>
                  Expired
                </Button>
              </div>
            )}
          </Card.Footer>
        </Card>
      </Col>
    );
  }

  function renderFilters() {
    return (
      <ButtonGroup className="pb-5">
        <Button onClick={() => handleRoundsFilter("all")} active={filter === "all"} variant="secondary">
          All rounds
        </Button>
        <Button
          onClick={() => handleRoundsFilter("participated")}
          active={filter === "participated"}
          variant="secondary"
        >
          participated rounds
        </Button>
        <Button onClick={() => handleRoundsFilter("active")} active={filter === "active"} variant="secondary">
          Active rounds
        </Button>
      </ButtonGroup>
    );
  }

  function renderCards() {
    return (
      <Container>
        <Row xs={1} md={2} lg={3} className="g-4">
          {Object.values(roundsData)
            .filter((r) => (filteredRoundsData.length === 0 ? r : filteredRoundsData.includes(r.round)))
            .map(renderCard)}
        </Row>
      </Container>
    );
  }

  if (isLoadingPage) {
    return (
      <Container>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
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
          <Col xxs="12">{"WICP Balance: " + wicpBalance}</Col>
        </Row>
      </Container>
      <Container>
        <div style={{ justifyContent: "flex-end" }} className="custom-full-width">
          {renderFilters()}
        </div>
      </Container>
      {renderCards()}
    </div>
  );
}
