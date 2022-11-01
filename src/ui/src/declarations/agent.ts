import { Actor, HttpAgent } from "@dfinity/agent";
import  { idlFactory as daoIdl, _SERVICE as daoService } from './dao/dao.did';
import {idlFactory as yourCoinIdl, _SERVICE as YourCoinInterface} from './yourcoin/yourcoin.did';

export const daoCanisterId = "7tac7-rqaaa-aaaak-ac47q-cai";
export const coinCanisterId = "5gxp5-jyaaa-aaaag-qarma-cai";

function createActor<T>(canisterId, idl, options): T {
  const agent = new HttpAgent(options ? { ...options.agentOptions } : {
    host: "https://ic0.app"
  });
  
  if (process.env.NODE_ENV !== "production") {
    agent.fetchRootKey().catch(err => {
      console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
      console.error(err);
    });
  }

  return Actor.createActor(idl, {
    agent,
    canisterId,
    ...(options ? options.actorOptions : {}),
  });
}

export const daocanister = (options?) => createActor<daoService>(daoCanisterId, daoIdl, options);
export const coincanister = (options?) => createActor<YourCoinInterface>(coinCanisterId, yourCoinIdl, options);
