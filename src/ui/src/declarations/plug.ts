import { Actor } from "@dfinity/agent";
import { coinCanisterId, daoCanisterId, icpHost, whiteListedCanister } from "./constants";
import  { idlFactory as daoIdl, _SERVICE as daoService } from './dao/dao.did';
import {idlFactory as yourCoinIdl, _SERVICE as YourCoinInterface} from './yourcoin/yourcoin.did';
const myWindow = (window as any);
async function createActor<T>(canisterId, idl, options): Promise<T> {
    const connected = await myWindow.ic.plug.isConnected();
    if (!connected) 
        await myWindow.ic.plug.requestConnect({ whitelist: whiteListedCanister, host: icpHost });
    if (connected && !myWindow.ic.plug.agent) {
        await myWindow.ic.plug.createAgent({ whitelist: whiteListedCanister, host: icpHost })
    }
    

    return Actor.createActor(idl, {
        agent: myWindow.ic.plug.agent,
        canisterId,
        ...(options ? options.actorOptions : {}),
      });
    }
    
  export default { 
    daoCanister: (options?) => createActor<Promise<daoService>>(daoCanisterId, daoIdl, options),
    coincanister: (options?) => createActor<Promise<YourCoinInterface>>(coinCanisterId, yourCoinIdl, options)
  };
    
  