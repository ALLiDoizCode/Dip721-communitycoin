import { IConnector } from "@connect2ic/core";
import { AstroX } from "@connect2ic/core/providers/astrox";
import { PlugWallet } from "@connect2ic/core/providers/plug-wallet";
import { StoicWallet } from "@connect2ic/core/providers/stoic-wallet";
import bigDecimal from "js-big-decimal";
import { icpHost, whiteListedCanister } from "../declarations/constants";
export type consumer<T> = (t:T) => void;
export const DECIMALS = 100000000;

export function bigIntToDecimal(big: BigInt | number) {
    var result = new bigDecimal(big?.toString() || 1);
    var decimal = new bigDecimal(DECIMALS);
    return result.divide(decimal, 8);
}

export function bigIntToDecimalPrettyString(big: BigInt | number) {
    return bigIntToDecimal(big).getPrettyValue(3, ",");
}

export function getProvider(connector: string) {
    return (() => {
        switch(connector) {
            case "plug":
                return new PlugWallet({
                    whitelist: whiteListedCanister,
                    host: icpHost,
                });
            case "astro":
                return new AstroX({
                    whitelist: whiteListedCanister,
                    host: icpHost
                  });
            case "stoic": 
                return new StoicWallet({
                    whitelist: whiteListedCanister,
                    providerUrl: "https://www.stoicwallet.com",
                    host: icpHost,
                  });
        }
    })() as IConnector;
}


export default {
    bigIntToDecimal,
    bigIntToDecimalPrettyString,
    getProvider
}