#!/bin/bash

dfx deploy --network ic \
	--argument="(
        \"data:image/jpeg;base64,$(base64 icon.png)\",
        \"Crypto Is Good\",
        \"CIG\",
        5,
        50000000000000000,
        principal \"$(dfx identity get-principal)\", 
        0,
        )"

