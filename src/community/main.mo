import Array "mo:base/Array";
import Blob "mo:base/Deque";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
//import Http "./Helpers/http";
import Int32 "mo:base/Int32";
import Iter "mo:base/Iter";
//import JSON "./Helpers/JSON";
import Nat32 "mo:base/Nat32";
import Prim "mo:prim";
import Principal "mo:base/Principal";
//import Response "./Models/Response";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Float "mo:base/Float";
import Utils "../helpers/Utils";
import Holder "../models/Holder";
import Constants "../Constants";
import TokenService "../services/TokenService";

actor {

    private type Holder = Holder.Holder;

    public shared({caller}) func distribute(amount:Nat,holders:[Holder]): async () {
        assert(caller == Principal.fromText(Constants.dip20Canister));
        var recipents:[Holder] = [];
        var community_amount = Float.mul(Utils.natToFloat(amount), Constants.transactionPercentage);
        var holder_amount = Float.mul(community_amount, Constants.holdersPercentage);
        var sum:Nat = 0;
        ignore treasuryFee(community_amount);
        ignore marketingFee(community_amount);
        ignore burnFee(community_amount);
        for (holding in holders.vals()) {
            sum := sum + holding.amount;
        };
        for (holding in holders.vals()) {
            let percentage:Float = Float.div(Utils.natToFloat(holding.amount), Utils.natToFloat(sum));
            let earnings = holder_amount * percentage;
            let recipent:Holder = { holder = holding.holder; amount = Utils.floatToNat(earnings); receipt = #Err(#Other(""))};
            recipents := Array.append(recipents,[recipent]);
        };
        ignore TokenService.bulkTransfer(recipents);
    };

    private func treasuryFee(value:Float): async () {
        let _amount = Utils.floatToNat(Float.mul(value, Constants.treasuryPercentage));
        let wallet = Principal.fromText(Constants.treasuryWallet);
        ignore TokenService.communityTransfer(wallet,_amount);
    };

    private func marketingFee(value:Float): async () {
        let _amount = Utils.floatToNat(Float.mul(value, Constants.marketingPercentage));
        let wallet = Principal.fromText(Constants.marketWallet);
        let _ = TokenService.communityTransfer(wallet,_amount);
    };

    private func burnFee(value:Float): async () {
        let _amount = Utils.floatToNat(Float.mul(value, Constants.burnPercentage));
        let wallet = Principal.fromText(Constants.burnWallet);
        let _ = TokenService.communityTransfer(wallet,_amount);
    };

    public shared({caller}) func test(amount:Nat,holders:[Holder]): async () {};

};
