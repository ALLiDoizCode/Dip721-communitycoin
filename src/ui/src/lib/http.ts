import axios from "axios";
import { daoCanisterId, treasuryCanisterId, tokensaleCanisterId } from "../declarations/constants";
import { Proposal, TreasuryRequest, Vote } from "./dao";

const urlBuilder = (endpoint: string) => `https://${daoCanisterId}.raw.ic0.app/${endpoint}`;
const TreasuryUrlBuilder = (endpoint: string) => `https://${treasuryCanisterId}.raw.ic0.app/${endpoint}`;
const TokenSaleUrlBuilder = (endpoint: string) => `https://${tokensaleCanisterId}.raw.ic0.app/${endpoint}`;
export type ProposalFunction = () => Promise<Proposal[]>;

export interface TokenSaleRound {
  day: number;
  amount: number;
}

export async function fetchAcceptedProposals(): Promise<Proposal[]> {
  return await (
    await axios.get(urlBuilder("fetchAcceptedProposals"), { responseType: "json" })
  ).data;
}
export async function fetchTreasuryRequests(): Promise<TreasuryRequest[]> {
  return await (
    await axios.get(TreasuryUrlBuilder("fetchRequests"), { responseType: "json" })
  ).data;
}

export async function fetchRejectedProposals(): Promise<Proposal[]> {
  return await (
    await axios.get(urlBuilder("fetchRejectedProposals"), { responseType: "json" })
  ).data;
}

export async function getProposal(): Promise<Proposal> {
  return await (
    await axios.get(urlBuilder("getProposal"), { responseType: "json" })
  ).data;
}

export async function getVote(voteId: number): Promise<Vote> {
  return await (
    await axios.get(urlBuilder(`getVote/${voteId}`), { responseType: "json" })
  ).data;
}

export async function getProposalCost(): Promise<string> {
  return (await axios.get<string>(urlBuilder("proposalCost"))).data;
}

export async function getLastRound(): Promise<number> {
  return (await axios.get<number>(TokenSaleUrlBuilder("getLastRound"))).data;
}

export async function getTokensPerRound(): Promise<number> {
  return (await axios.get<number>(TokenSaleUrlBuilder("getTokensPerRound"))).data;
}

export async function getDistributionStart(): Promise<number> {
  return (await axios.get<number>(TokenSaleUrlBuilder("getStart"))).data;
}

export async function fetchRounds(): Promise<TokenSaleRound[]> {
  return (await axios.get<TokenSaleRound[]>(TokenSaleUrlBuilder("fetchRounds"))).data;
}

export async function fetchRoundsByPrincipal(principal: string): Promise<TokenSaleRound[]> {
  return (await axios.get<TokenSaleRound[]>(TokenSaleUrlBuilder(`fetchRoundsByPrincipal/${principal}`))).data;
}

export default {
  fetchRejectedProposals,
  fetchAcceptedProposals,
  fetchTreasuryRequests,
  getProposal,
  getVote,
  getProposalCost,
};
