import { Actor, HttpAgent } from "@dfinity/agent";
import { coinCanisterId, daoCanisterId, icpHost } from "./constants";
import  { idlFactory as daoIdl, _SERVICE as daoService } from './dao/dao.did';
import {idlFactory as yourCoinIdl, _SERVICE as YourCoinInterface} from './yourcoin/yourcoin.did';

function createActor<T>(canisterId, idl, options): T {
  const agent = new HttpAgent(options ? { ...options.agentOptions } : {
    host: icpHost
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
