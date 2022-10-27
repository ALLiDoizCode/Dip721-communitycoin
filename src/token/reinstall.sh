#!/bin/bash

dfx canister --network ic install database --mode reinstall

dfx canister --network ic install community --mode reinstall

dfx canister --network ic install token\
	--argument="(
        \"data:image/jpeg;base64,$(base64 icon.png)\",
        \"Crypto Is Good\",
        \"CIG\",
        5,
        50000000000000000,
        principal \"$(dfx identity get-principal)\", 
        0, 
        )" \
    --mode reinstall    
