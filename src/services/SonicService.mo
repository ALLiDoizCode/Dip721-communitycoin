import Constants "../Constants";
import Principal "mo:base/Principal";
import Swap "../helpers/Swap";
import Nat64 "mo:base/Nat64";

module {

    private type TxReceipt = { #ok : Nat; #err : Text };

    private type PairInfoExt = {
        id : Text;
        price0CumulativeLast : Nat;
        creator : Principal;
        reserve0 : Nat;
        reserve1 : Nat;
        lptoken : Text;
        totalSupply : Nat;
        token0 : Text;
        token1 : Text;
        price1CumulativeLast : Nat;
        kLast : Nat;
        blockTimestampLast : Int;
    };

    private type UserInfo = {
        lpBalances : [(Text, Nat)];
        balances : [(Text, Nat)];
    };

    public let canister = actor(Constants.sonicCanister) : actor { 
        swapExactTokensForTokens : shared (
            Nat,
            Nat,
            [Text],
            Principal,
            Int,
        ) -> async TxReceipt;

        swapTokensForExactTokens : shared (
            Nat,
            Nat,
            [Text],
            Principal,
            Int,
        ) -> async TxReceipt;

        addLiquidity : shared (
            Principal,
            Principal,
            Nat,
            Nat,
            Nat,
            Nat,
            Int,
        ) -> async TxReceipt;

        removeLiquidity : shared (
            Principal,
            Principal,
            Nat,
            Nat,
            Nat,
            Principal,
            Int,
        ) -> async TxReceipt;

        getNumPairs : shared query () -> async Nat;
        getPair : shared query (Principal, Principal) -> async ?PairInfoExt;
        getPairs : shared query (Nat, Nat) -> async ([PairInfoExt], Nat);
        getAllPairs : shared query () -> async [PairInfoExt];
        getUserInfo : shared query Principal -> async UserInfo;
    };
}