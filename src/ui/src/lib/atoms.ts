import {atom} from "recoil";
import bigDecimal from "js-big-decimal";
import { Principal } from "@dfinity/principal";
import { StoicWallet } from "@connect2ic/core/providers/stoic-wallet"
import type { IConnector } from "@connect2ic/core/dist/declarations/src/providers/connectors";

const localStorageEffect = key => ({setSelf, onSet}) => {
    const savedValue = localStorage.getItem(key)
    if (savedValue != null) {
        setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
        isReset
            ? localStorage.removeItem(key)
            : localStorage.setItem(key, JSON.stringify(newValue));
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
    default: false
});

export const identityProviderAtom = atom<IConnector | undefined>({
    key: 'identityProvider',
    default: undefined
});

export const principalAtom = atom({
    key: 'principal',
    default: Principal.anonymous()
});

export const proposalCostAtom = atom({
    key: 'proposalcost',
    default:  BigInt(0)
});


export const canisterAtom = atom({
    key: 'canisters',
    default: []
});

export const isAdminAtom = atom({
    key: 'is_admin',
    default: false
});
