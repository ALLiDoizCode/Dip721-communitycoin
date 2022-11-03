import { coinCanisterId, daoCanisterId, icpHost } from "./constants";
import  { idlFactory as daoIdl, _SERVICE as daoService } from './dao/dao.did';
import {idlFactory as yourCoinIdl, _SERVICE as YourCoinInterface} from './yourcoin/yourcoin.did';

async function createActor<T>(canisterId, idl): Promise<T> {
    return await (window as any).ic.plug.createActor({
        canisterId: canisterId,
        interfaceFactory: idl,
    }) as T;
  }
  
  export default { 
    daoCanister: () => createActor<Promise<daoService>>(daoCanisterId, daoIdl),
    coincanister: () => createActor<Promise<YourCoinInterface>>(coinCanisterId, yourCoinIdl)
  };
    
  