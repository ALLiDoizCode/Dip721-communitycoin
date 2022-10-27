#!/bin/bash

WALLET='principal "j26ec-ix7zw-kiwcx-ixw6w-72irq-zsbyr-4t7fk-alils-u33an-kh6rk-7qe"'

dfx deploy \
	--argument="(
        \"data:image/jpeg;base64,$(base64 icon.png)\",
        \"Crypto Is Good\",
        \"CIG\",
        5,
        500000000000,
        principal \"$(dfx identity get-principal)\", 
        0, 
        $WALLET, 
        )" \
    $MODE
