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
import Utils "../helpers/Utils";
import Holder "../models/Holder";
import Constants "./Constants";

actor {

    public type Holder = Holder.Holder;

    public shared({caller}) func distribute(amount:Nat,holders:[Holder]): async () {
        var recipents:[Holder] = [];
        var community_amount = Utils.natToFloat(amount) * Constants.transactionPercentage;
        var holder_amount = community_amount * Constants.holdersPercentage;
        var sum:Nat = 0;
        ignore devFee(community_amount);
        ignore marketingFee(community_amount);
        ignore burnFee(community_amount);
        for (holding in holders.vals()) {
            sum := sum + holding.amount;
        };
        for (holding in holders.vals()) {
            let percentage:Float = Utils.natToFloat(holding.amount) / Utils.natToFloat(sum);
            let earnings = holder_amount * percentage;
            let recipent:Holder = { holder = holding.holder; amount = Utils.floatToNat(earnings)};
            recipents := Array.append(recipents,[recipent]);
        };
        //send list of recipents to bulktransfer call
    };

    public shared({caller}) func devFee(value:Float): async () {
        var amount = value * Constants.developerPercentage;
        //send amount to canister
    };

    public shared({caller}) func marketingFee(value:Float): async () {
        var amount = value * Constants.marketingPercentage;
        //send amount to canister
    };

    public shared({caller}) func burnFee(value:Float): async () {
        var amount = value * Constants.burnPercentage;
        //send amount to canister
    };

};
