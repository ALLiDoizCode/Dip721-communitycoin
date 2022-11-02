import axios from "axios";
import { daoCanisterId } from "../declarations/agent";
import { Proposal, Vote } from "./dao";

const urlBuilder = (endpoint: string) => `https://${daoCanisterId}.raw.ic0.app/${endpoint}`;

export async function fetchAcceptedProposals(): Promise<Proposal[]> {
    return await axios.get(urlBuilder("fetchAcceptedProposals"));
}

export async function fetchRejectedProposals(): Promise<Proposal[]> {
    return await axios.get(urlBuilder("fetchRejectedProposals"));
}

export async function getVote(voteId: number): Promise<Vote> {
    return await axios.get(urlBuilder(`getVote/${voteId}`));
}