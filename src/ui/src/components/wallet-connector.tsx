import * as React from "react";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import { useRecoilState } from "recoil";
import { agentAtom, connectedAtom, principalAtom } from "../lib/atoms";
import { icpHost, whiteListedCanister } from "../declarations/constants";
import {StoicIdentity} from "ic-stoic-identity";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";

const WalletConnector = (props : {className: string}) => {
    const [connected, setConnected] = useRecoilState(connectedAtom);
    const [agent, setAgent] = useRecoilState(agentAtom);
    const [principal, setPrincipal] = useRecoilState(principalAtom);

    const myWindow = (window as any);


    async function connectPlug() {
        const connected = await myWindow.ic.plug.isConnected();
        await myWindow.ic.plug.requestConnect({ whitelist: whiteListedCanister, host: icpHost });
        setPrincipal(Principal.fromText(myWindow.ic.plug.principalId));
        setAgent(myWindow.ic.plug.agent);
        setConnected(true);
    }

    async function connectStoic() {
        const connected = await StoicIdentity.load(); 
        console.log(connected)

        const identity = await StoicIdentity.connect();
        console.log(identity)

        setAgent(
        new HttpAgent({
            identity,
            host: icpHost
        }));
        console.log(identity.getPrincipal().toText())
        setPrincipal(identity.getPrincipal());
        setConnected(true);
    }

    async function connectIdentity() {
        const authClient = await AuthClient.create();
        authClient.login({
            // 7 days in nanoseconds
            maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
            onSuccess: async () => {
                const identity = await authClient.getIdentity();
                setAgent(
                    new HttpAgent({
                        identity,
                        host: icpHost
                    }));
                setPrincipal(identity.getPrincipal());
                setConnected(true);
            },
          });
    }

    async function connectNfid() {
        const APPLICATION_NAME = "CigDao";
        const APPLICATION_LOGO_URL = "https%3A%2F%2Fs3.amazonaws.com%2Fcdn.cigdao.org%2Fcryptoisgood.png";

  const AUTH_PATH = "/authenticate/?applicationName="+APPLICATION_NAME+"&applicationLogo="+APPLICATION_LOGO_URL+"#authorize";
        const authClient = await AuthClient.create();
        await authClient.login({
            onSuccess: async () => {
                const identity = await authClient.getIdentity();
                setAgent(
                    new HttpAgent({
                        identity,
                        host: icpHost
                    }));
                setPrincipal(identity.getPrincipal());
                setConnected(true);
            },
            identityProvider: `https://nfid.one${AUTH_PATH}`,
            // Maximum authorization expiration is 30 days
            maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
            windowOpenerFeatures: 
              `left=${window.screen.width / 2 - 525 / 2}, `+
              `top=${window.screen.height / 2 - 705 / 2},` +
              `toolbar=0,location=0,menubar=0,width=525,height=705`,
          });
    }
    
    
    return <>
    {!connected &&
    <DropdownButton className={props.className} title={"Sign-in"} >
       <Dropdown.Item onClick={connectPlug} eventKey={"1"}>Plug</Dropdown.Item>
       <Dropdown.Item onClick={connectStoic} eventKey={"2"}>Stoic</Dropdown.Item>
       {/* <Dropdown.Item onClick={connectIdentity} eventKey={"3"}>Identity</Dropdown.Item>
       <Dropdown.Item onClick={connectNfid} eventKey={"4"}>NFID</Dropdown.Item> */}
    </DropdownButton>}
    {connected && <Button onClick={() => {
        setConnected(false);
        setAgent(new HttpAgent({
            host: icpHost
          }));
    }}>Sign Off</Button>}
    </>
    
}

export default WalletConnector