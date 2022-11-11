import {atom} from "recoil";
import bigDecimal from "js-big-decimal";
import { Principal } from "@dfinity/principal";
import type { IConnector } from "@connect2ic/core/dist/declarations/src/providers/connectors";

const storageEffect = (key, storageType) => ({setSelf, onSet}) => {
    const savedValue = storageType.getItem(key)
    if (savedValue != null) {
        setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
        isReset
            ? storageType.removeItem(key)
            : storageType.setItem(key, JSON.stringify(newValue));
    });
};


export const loadingAtom = atom({
    key: 'loading',
    default: false
});

export const ycBalanceAtom = atom({
    key: 'ycBalance',
    default: new bigDecimal(0)
});

export const connectedAtom = atom({
    key: 'connected',
    default: false,
    effects: [
        storageEffect("connected", sessionStorage)
    ]
});

export const identityProviderAtom = atom<IConnector | undefined>({
    key: 'identityProvider',
    default: undefined,
    effects: [
        storageEffect("identityProvider", sessionStorage)
    ]
});

export const principalAtom = atom({
    key: 'principal',
    default: Principal.anonymous(),
    effects: [
        storageEffect("identityProvider", sessionStorage)
    ]
});

export const proposalCostAtom = atom({
    key: 'proposalcost',
    default:  BigInt(0)
});