import "../styles/token-sale-styles.css";
import { Principal } from "@dfinity/principal";
import bigDecimal from "js-big-decimal";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Dropdown,
  DropdownButton,
  Form,
  InputGroup,
  ListGroup,
  Row,
  Spinner,
} from "react-bootstrap";
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
  fetchClaimedRoundsByPrincipal,
} from "../lib/http";
import { bigIntToDecimal } from "../lib/util";
import WalletConnector from "./wallet-connector";
import { orderBy } from "lodash";

const decimals = 100000000;

interface IRoundData {
  round: number;
  totalTokens: number;
  totalInvested: number;
  userTotalInvested: number;
  unrealisedInvestment: string;
  investRoundStart: DateTime;
  investRoundEnd: DateTime;
  isClaimed: boolean;
}

export default function Tokensale() {
  const [connected] = useRecoilState(connectedAtom);
  const [principal] = useRecoilState(principalAtom);
  const [provider] = useRecoilState(identityProviderAtom);

  const [wicpBalance, setWicpBalance] = useState(0);
  const [ycBalance, setYcBalance] = useState(0);
  const [roundsData, setRoundsData] = useState<{ [value: number]: IRoundData }>([]);
  const [filteredRoundsData, setFilteredRoundsData] = useState<number[]>([]);
  const [roundsInitialized, setRoundsInitialized] = useState(false);

  const [filter, setFilter] = useState<"all" | "participated" | "active" | "unclaimed">("active");
  const [sort, setSort] = useState<{ name: "Date" | "Total invested"; sort: "asc" | "desc" }>({
    name: "Date",
    sort: "asc",
  });

  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [isLoadingTransfer, setIsLoadingTransfer] = useState<{ [value: number]: boolean }>([]);
  const [isLoadingClaim, setIsLoadingClaim] = useState<{ [value: number]: boolean }>([]);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (roundsInitialized && connected) {
      getUserData();
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

      for (let i = 1; i < maxRounds + 1; i++) {
        const totalInvested = rounds.find((r) => r.day === i)?.amount;
        roundsData[i] = {
          round: i,
          totalInvested: !totalInvested ? 0 : totalInvested / decimals,
          totalTokens: tokensPerRound,
          userTotalInvested: 0,
          unrealisedInvestment: "",
          investRoundStart: dateFromNano(BigInt(startTime + roundTime * (i - 1))),
          investRoundEnd: dateFromNano(BigInt(startTime + roundTime * i)),
          isClaimed: false,
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
    try {
      setIsLoadingUserData(true);
      const userInvestedRounds = await fetchRoundsByPrincipal(principal);
      const userClaimedRounds = await fetchClaimedRoundsByPrincipal(principal);
      const rounds = await fetchRounds();
      await getBalances();

      userInvestedRounds.forEach((u) => {
        setRoundsData((prevState) => ({
          ...prevState,
          [u.day]: {
            ...roundsData[u.day],
            totalInvested: rounds.find((r) => r.day === u.day).amount / decimals ?? 0,
            userTotalInvested: u.amount / decimals ?? 0,
            isClaimed: userClaimedRounds.some((r) => r === u.day),
          },
        }));
      });
      handleRoundsFilter("active");
    } catch (error) {
      console.group(error);
    } finally {
      setIsLoadingUserData(false);
    }
  }

  function setUnrealizedInvestmentForRound(round: number, amount: string) {
    setRoundsData((prevState) => ({ ...prevState, [round]: { ...prevState[round], unrealisedInvestment: amount } }));
  }

  async function getBalances() {
    try {
      const wicpActor = await actor.wicpCanister();
      const wicpBalance = await wicpActor.balanceOf(Principal.fromText(principal));
      setWicpBalance(Number(wicpBalance) / decimals);

      const ycBalance = await (await actor.coinCanister(provider)).balanceOf(Principal.fromText(principal));
      setYcBalance(Number(ycBalance));
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
        await getBalances();
        setUnrealizedInvestmentForRound(round, "");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingTransfer((prevState) => ({ ...prevState, [round]: false }));
    }
  }

  async function tokenClaim(round: number) {
    try {
      setIsLoadingClaim((prevState) => ({ ...prevState, [round]: true }));
      const distributionActor = await actor.distributionCanister(provider);
      const response = await distributionActor.claim(round);
      await getUserData();
      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingClaim((prevState) => ({ ...prevState, [round]: false }));
    }
  }

  function handleWicpInputChange(round: number, amount: string) {
    if (!amount || amount.match(/^\d{1,}(\.\d{0,8})?$/)) {
      setUnrealizedInvestmentForRound(round, amount);
    }
  }

  function handleRoundsFilter(filter: "all" | "participated" | "active" | "unclaimed") {
    if (filter === "all") {
      setFilter("all");
      setFilteredRoundsData(Object.values(roundsData).map((r) => r.round));
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
    }

    if (filter === "unclaimed") {
      setFilter("unclaimed");
      setFilteredRoundsData(
        Object.values(roundsData)
          .filter((r) => r.userTotalInvested > 0 && !r.isClaimed && r.investRoundEnd < DateTime.now())
          .map((r) => r.round)
      );
    } else {
      setFilter("active");
      setFilteredRoundsData(
        Object.values(roundsData)
          .filter((r) => r.investRoundEnd > DateTime.now())
          .map((r) => r.round)
      );
    }
  }

  function renderCardButton(data: IRoundData, canInvest: boolean) {
    if (canInvest && connected) {
      return (
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
              isLoadingTransfer[data.round] || data.unrealisedInvestment === "0" || data.unrealisedInvestment === ""
            }
            onClick={() => wicpTransfer(data.round)}
            className="btn btn-success"
          >
            {isLoadingTransfer[data.round] ? <Spinner animation="border" role="status" size="sm"></Spinner> : "Invest"}
          </Button>
        </div>
      );
    }

    if (data.userTotalInvested > 0 && !canInvest) {
      return (
        <Button
          disabled={isLoadingClaim[data.round] || data.isClaimed}
          style={{ width: "100%" }}
          onClick={() => tokenClaim(data.round)}
          className="btn btn-warning"
        >
          {isLoadingClaim[data.round] ? (
            <Spinner animation="border" role="status" size="sm"></Spinner>
          ) : data.isClaimed ? (
            "Already claimed"
          ) : (
            "Claim"
          )}
        </Button>
      );
    }

    if (!connected && canInvest) {
      return (
        <div className="pt-1 pb-1 custom-full-width">
          <Button style={{ width: "100%" }} variant="light" disabled>
            Not connected
          </Button>
        </div>
      );
    }

    return (
      <div className="pt-1 pb-1 custom-full-width">
        <Button style={{ width: "100%" }} variant="light" disabled>
          Expired
        </Button>
      </div>
    );
  }

  function renderCard(data: IRoundData) {
    const totalTokens = bigIntToDecimal(data.totalTokens).getPrettyValue(3, ",") + " YC";
    const userWicpInvestedPercentage = isNaN(data.userTotalInvested / data.totalInvested)
      ? 0
      : (data.userTotalInvested / data.totalInvested) * 100;
    const userYcClaim = data.totalTokens * (userWicpInvestedPercentage / 100);

    let format = "yyyyMMddHHmm";
    const currentDate = Number(DateTime.now().toFormat(format));
    const investRoundStart = Number(data.investRoundStart.toFormat(format));
    const investRoundEnd = Number(data.investRoundEnd.toFormat(format));
    const canInvest = investRoundEnd >= currentDate;
    const activeRound = currentDate >= investRoundStart && currentDate <= investRoundEnd;
    return (
      <Col key={data.round}>
        <Card
          style={{ textAlign: "left" }}
          border={activeRound ? "success" : userWicpInvestedPercentage ? "warning" : ""}
          className={canInvest ? "" : userWicpInvestedPercentage ? "" : "past-date-card"}
        >
          <Card.Header
            as="h6"
            className="custom-card-header"
            style={{
              background: activeRound ? "#198755" : "",
            }}
          >
            <div className="custom-full-width" style={{ color: activeRound ? "#ffffff" : "" }}>
              #{data.round}
            </div>
            <div style={{ color: activeRound ? "#ffffff" : "" }}>
              {data.investRoundEnd.toFormat("dd-MM-yyyy HH:mm")}
            </div>
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
                  <div className="custom-list-group-item">
                    <span>{new bigDecimal(data.userTotalInvested).getPrettyValue(8, ",")} WICP</span>
                    {!!userWicpInvestedPercentage && <span>({userWicpInvestedPercentage.toFixed(2)}%)</span>}
                  </div>
                </div>
              </ListGroup.Item>
              <ListGroup.Item as="li">
                <div>
                  <div className="fw-bold">Your claim</div>
                  <span>{bigIntToDecimal(userYcClaim).getPrettyValue(3, ",")} YC</span>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
          <Card.Footer className="text-muted">{renderCardButton(data, canInvest)}</Card.Footer>
        </Card>
      </Col>
    );
  }

  function renderFilters() {
    return (
      <>
        <ButtonGroup className="pb-5 custom-full-width">
          <Button
            className="custom-filter-button"
            onClick={() => handleRoundsFilter("active")}
            active={filter === "active"}
            variant="outline-secondary"
          >
            Active rounds
          </Button>
          <Button
            className="custom-filter-button"
            onClick={() => handleRoundsFilter("participated")}
            active={filter === "participated"}
            variant="outline-secondary"
          >
            participated rounds
          </Button>
          <Button
            className="custom-filter-button"
            onClick={() => handleRoundsFilter("unclaimed")}
            active={filter === "unclaimed"}
            variant="outline-secondary"
          >
            Unclaimed
          </Button>
          <Button
            className="custom-filter-button"
            onClick={() => handleRoundsFilter("all")}
            active={filter === "all"}
            variant="outline-secondary"
          >
            All rounds
          </Button>
        </ButtonGroup>
        {renderSorting()}
      </>
    );
  }

  function renderSorting() {
    return (
      <ButtonGroup style={{ paddingLeft: 16 }} className="pb-5">
        <DropdownButton
          as={ButtonGroup}
          title={sort.name}
          active
          variant="outline-secondary"
          className="custom-filter-button"
        >
          <Dropdown.Item onClick={() => setSort((prevState) => ({ name: "Date", sort: prevState.sort }))}>
            Date
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setSort((prevState) => ({ name: "Total invested", sort: prevState.sort }))}>
            Total invested
          </Dropdown.Item>
        </DropdownButton>
        <Button
          active
          className="custom-filter-button"
          onClick={() =>
            setSort((prevState) => ({ name: prevState.name, sort: prevState.sort === "asc" ? "desc" : "asc" }))
          }
          variant="outline-secondary"
        >
          {sort.sort}
        </Button>
      </ButtonGroup>
    );
  }

  function renderCards() {
    const rounds = Object.values(roundsData);
    const filteredRounds = rounds.filter((r) => (!connected ? r : filteredRoundsData.includes(r.round)));
    const orderedRounds = orderBy(
      filteredRounds,
      (f) => {
        if (sort.name === "Date") {
          return f.investRoundEnd;
        }

        if (sort.name === "Total invested") {
          return f.totalInvested;
        }
        return f.round;
      },
      sort.sort
    );
    return (
      <Container>
        <Row xs={1} md={2} lg={3} className="g-4">
          {orderedRounds.map(renderCard)}
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
    <div className="pb-4">
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
          <Col xxs="12">{"YC Balance: " + bigIntToDecimal(ycBalance).getPrettyValue(3, ",")}</Col>
        </Row>
      </Container>

      <Container>
        <div
          style={{ justifyContent: isLoadingUserData ? "center" : "flex-end" }}
          className={`custom-full-width ${isLoadingUserData ? "pb-5" : ""}`}
        >
          {isLoadingUserData ? (
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          ) : (
            connected && renderFilters()
          )}
        </div>
      </Container>

      {renderCards()}
    </div>
  );
}
