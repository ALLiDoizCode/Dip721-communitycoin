import axios from "axios";
import { daoCanisterId, treasuryCanisterId } from "../declarations/constants";
import { Proposal, TreasuryRequest, Vote } from "./dao";

const urlBuilder = (endpoint: string) => `https://${daoCanisterId}.raw.ic0.app/${endpoint}`;
const TreasuryUrlBuilder = (endpoint: string) => `https://${treasuryCanisterId}.raw.ic0.app/${endpoint}`;
export type ProposalFunction = () => Promise<Proposal[]>;
export async function fetchAcceptedProposals(): Promise<Proposal[]> {
    return await (await axios.get(urlBuilder("fetchAcceptedProposals"), { responseType: "json" })).data;
}
export async function fetchTreasuryRequests(): Promise<TreasuryRequest[]> {
    return await (await axios.get(TreasuryUrlBuilder("fetchRequests"), { responseType: "json" })).data;
}

export async function fetchRejectedProposals(): Promise<Proposal[]> {
    return await (await axios.get(urlBuilder("fetchRejectedProposals"), { responseType: "json" })).data;
}

export async function getProposal(): Promise<Proposal> {
    return await (await axios.get(urlBuilder("getProposal"), { responseType: "json" })).data;
}

export async function getVote(voteId: number): Promise<Vote> {
    return await (await axios.get(urlBuilder(`getVote/${voteId}`), { responseType: "json" })).data;
}

export async function getProposalCost(): Promise<string> {
    return (await axios.get<string>(urlBuilder('proposalCost'))).data
}

export default {
    fetchRejectedProposals,
    fetchAcceptedProposals,
    fetchTreasuryRequests,
    getProposal,
    getVote,
    getProposalCost
}