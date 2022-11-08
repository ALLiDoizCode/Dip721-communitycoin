import * as React from "react";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import { useRecoilState } from "recoil";
import { identityProviderAtom, connectedAtom, principalAtom } from "../lib/atoms";
import { icpHost, whiteListedCanister } from "../declarations/constants";
import { Principal } from "@dfinity/principal";
import { AstroX } from "@connect2ic/core/providers/astrox"
import { PlugWallet } from "@connect2ic/core/providers/plug-wallet"
import { StoicWallet } from "@connect2ic/core/providers/stoic-wallet"

const WalletConnector = (props : {className: string}) => {
    const [connected, setConnected] = useRecoilState(connectedAtom);
    const [provider, setProvider] = useRecoilState(identityProviderAtom);
    const [principal, setPrincipal] = useRecoilState(principalAtom);

    const myWindow = (window as any);

    async function connect(connector: string) {
        const provider = (() => {
            switch(connector) {
                case "plug":
                    return new PlugWallet({
                        whitelist: whiteListedCanister,
                        host: icpHost,
                    });
                case "astro":
                    return new AstroX({
                        whitelist: whiteListedCanister,
                        host: icpHost,
                        providerUrl: "https://ccmhe-vqaaa-aaaai-acmoq-cai.raw.ic0.app"
                      });
                case "stoic": 
                    return new StoicWallet({
                        whitelist: whiteListedCanister,
                        providerUrl: "https://www.stoicwallet.com",
                        host: icpHost,
                      });
            }
        })();

        await provider.init();
        await provider.connect();

        setPrincipal(Principal.fromText(provider.principal));
        setProvider(provider);
        setConnected(true);
    }
    
    
    
    return <>
    {!connected &&
    <DropdownButton className={props.className} title={"Sign-in"} >
       <Dropdown.Item onClick={() => connect("plug")} eventKey={"1"}>Plug</Dropdown.Item>
       <Dropdown.Item onClick={() => connect("stoic")} eventKey={"2"}>Stoic</Dropdown.Item>
       <Dropdown.Item onClick={() => connect("astro")} eventKey={"5"}>Astro</Dropdown.Item>
    </DropdownButton>}
    {connected && <Button onClick={() => {
        setConnected(false);
        setProvider(null);
    }}>Sign Off</Button>}
    </>
    
}

export default WalletConnector