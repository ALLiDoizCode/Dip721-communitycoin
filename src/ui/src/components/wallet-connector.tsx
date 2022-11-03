import * as React from "react";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import { useRecoilState } from "recoil";
import { connectedAtom } from "../lib/atoms";
import { icpHost, whiteListedCanister } from "../declarations/constants";
const WalletConnector = (props : {className: string}) => {
    const [connected, setConnected] = useRecoilState(connectedAtom);
    const myWindow = (window as any);


    async function connectPlug() {
        const connected = await myWindow.ic.plug.isConnected();
        if (!connected) 
            await myWindow.ic.plug.requestConnect({ whitelist: whiteListedCanister, host: icpHost });

        setConnected(true);
    }
    
    return <>
    {!connected &&
    <DropdownButton className={props.className} title={"Sign-in"} >
       <Dropdown.Item onClick={connectPlug} eventKey={"1"}>Plug</Dropdown.Item>
    </DropdownButton>}
    {connected && <Button onClick={() => setConnected(false)}>Sign Off</Button>}
    </>
    
}

export default WalletConnector