import { Actor, HttpAgent } from "@dfinity/agent";
import { coinCanisterId, daoCanisterId } from "./constants";
import  { idlFactory as daoIdl, _SERVICE as daoService } from './dao/dao.did';
import {idlFactory as yourCoinIdl, _SERVICE as YourCoinInterface} from './yourcoin/yourcoin.did';

function createActor<T>(canisterId, idl, options, agent): T {
  return Actor.createActor(idl, {
    agent: agent,
    canisterId,
    ...(options ? options.actorOptions : {}),
  });
}

export default { 
  daoCanister: (agent: HttpAgent, options?) => createActor<daoService>(daoCanisterId, daoIdl, options, agent),
  coincanister: (agent: HttpAgent, options?) => createActor<YourCoinInterface>(coinCanisterId, yourCoinIdl, options, agent)
};