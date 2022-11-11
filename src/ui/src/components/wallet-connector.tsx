import { IConnector } from "@connect2ic/core";
import { InterfaceFactory } from "@dfinity/candid/lib/cjs/idl";
import { Principal } from "@dfinity/principal";
import bigDecimal from "js-big-decimal";
import * as React from "react";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import { useRecoilState } from "recoil";
import { icpHost } from "../declarations/constants.js";
import { idlFactory } from "../declarations/token/index.js";
import { _SERVICE } from "../declarations/token/token.did.js";
import { identityProviderAtom, connectedAtom, principalAtom } from "../lib/atoms";
import { getProvider } from "../lib/util";

export default function WalletConnector(props: { className: string }) {
  const [connected, setConnected] = useRecoilState(connectedAtom);
  const [provider, setIdentityProvider] = useRecoilState(identityProviderAtom);
  const [principal, setPrincipal] = useRecoilState(principalAtom);

  async function connect(connector: string) {
    const provider = getProvider(connector);

    await provider.init();
    await provider.connect();

    if (provider) {
      if (provider.principal) {
        setPrincipal(provider.principal);
        setIdentityProvider(connector);
        setConnected(true);
      }
    }
  }

  return (
    <>
      {!connected && (
        <DropdownButton className={props.className} title={"Sign-in"}>
          <Dropdown.Item onClick={() => connect("plug")} eventKey={"1"}>
            Plug
          </Dropdown.Item>
          <Dropdown.Item onClick={() => connect("stoic")} eventKey={"2"}>
            Stoic
          </Dropdown.Item>
          <Dropdown.Item onClick={() => connect("astro")} eventKey={"5"}>
            Astro
          </Dropdown.Item>
        </DropdownButton>
      )}
      {connected && (
        <Button
          onClick={() => {
            setConnected(false);
            setIdentityProvider(undefined);
          }}
        >
          Sign Off
        </Button>
      )}
    </>
  );
}
