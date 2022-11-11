import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import { coinCanisterId, daoCanisterId, icpHost, wicpCanister } from "./constants";
import { idlFactory as daoIdl, _SERVICE as daoService } from "./dao/dao.did";
import { idlFactory as yourCoinIdl, _SERVICE as YourCoinInterface } from "./yourcoin/yourcoin.did";
import { getProvider } from "../lib/util";
import { _SERVICE as WicpService, idlFactory as wicpFactory } from "./token/token.did";

async function createActor<T>(canisterId, idl): Promise<T> {
  return Actor.createActor(idl, {
    agent: new HttpAgent({
      host: icpHost,
    }),
    canisterId,
  });
}

async function createActorWrapper<T>(cid, idl, icConnector?: string) {
  if (icConnector) {
    const provider = getProvider(icConnector);
    await provider.init();
    const conn = await provider.createActor<T>(cid, idl);
    if (conn.isErr()) {
      throw Error("unable to create actor");
    }

    return conn.unwrapOr(null as T);
  }

  return await createActor<T>(cid, idl);
}

export default {
  daoCanister: (icConnector?: string) => createActorWrapper<daoService>(daoCanisterId, daoIdl, icConnector),
  coincanister: (icConnector?: string) =>
    createActorWrapper<YourCoinInterface>(coinCanisterId, yourCoinIdl, icConnector),
  wicpcanister: (icConnector?: string) => createActorWrapper<WicpService>(wicpCanister, wicpFactory, icConnector),
};
