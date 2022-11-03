import * as React from "react";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import { useRecoilState } from "recoil";
import { connectedAtom } from "../lib/atoms";
import PlugConnect from '@psychedelic/plug-connect';
import { icpHost, whiteListedCanister } from "../declarations/constants";
const WalletConnector = (props : {className: string}) => {
    const [connected, setConnected] = useRecoilState(connectedAtom);
    
    return <>
    {!connected &&
    <DropdownButton className={props.className} title={"Sign-in"} >
      <PlugConnect
            dark
            title="Plug Connect"
            host={icpHost}
            whitelist={whiteListedCanister}
            onConnectCallback={() =>  setConnected(true)}
            />
    </DropdownButton>}
    {connected && <Button onClick={() => setConnected(false)}>Sign Off</Button>}
    </>
    
}

export default WalletConnector