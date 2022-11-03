import axios from "axios";
import { daoCanisterId } from "../declarations/constants";
import { Proposal, Vote } from "./dao";

const urlBuilder = (endpoint: string) => `https://${daoCanisterId}.raw.ic0.app/${endpoint}`;
export type ProposalFunction = () => Promise<Proposal[]>;
export async function fetchAcceptedProposals(): Promise<Proposal[]> {
    return await (await axios.get(urlBuilder("fetchAcceptedProposals"))).data;
}

export async function fetchRejectedProposals(): Promise<Proposal[]> {
    return await (await axios.get(urlBuilder("fetchRejectedProposals"))).data;
}

export async function getProposal(): Promise<Proposal> {
    return await (await axios.get(urlBuilder("getProposal"))).data;
}

export async function getVote(voteId: number): Promise<Vote> {
    return await (await axios.get(urlBuilder(`getVote/${voteId}`))).data;
}