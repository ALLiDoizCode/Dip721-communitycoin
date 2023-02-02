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
import Types "../models/types";
import Http "../helpers/http";
import Response "../models/Response";
import JSON "../helpers/JSON";
import Cycles "mo:base/ExperimentalCycles";
import TopUpService "../services/TopUpService";

actor {

    private type TxReceipt = Types.TxReceipt;

    //private stable var transactionPercentage:Float = 0.11;
    private stable var burnPercentage:Float = 0.03;
    private stable var reflectionPercentage:Float = 0.03;
    private stable var treasuryPercentage:Float = 0.03;
    private stable var marketingPercentage:Float = 0.02;
    //private stable var maxHoldingPercentage:Float = 0.01;

    private stable var reflectionCount:Nat = 0;
    private stable var reflectionAmount:Nat = 0;

    private type Holder = Holder.Holder;

    /*public shared({caller}) func updateTransactionPercentage(value:Float): async() {
        assert(caller == Principal.fromText(Constants.daoCanister));
        transactionPercentage := value;
    };*/

    public query func getMemorySize(): async Nat {
        let size = Prim.rts_memory_size();
        size;
    };

    public query func getHeapSize(): async Nat {
        let size = Prim.rts_heap_size();
        size;
    };

    public query func getCycles(): async Nat {
        Cycles.balance();
    };

    private func _getMemorySize(): Nat {
        let size = Prim.rts_memory_size();
        size;
    };

    private func _getHeapSize(): Nat {
        let size = Prim.rts_heap_size();
        size;
    };

    private func _getCycles(): Nat {
        Cycles.balance();
    };

    private func _topUp(): async () {
      if (_getCycles() <= Constants.cyclesThreshold){
          await TopUpService.topUp();
      }
    };

    public shared({caller}) func updateBurnPercentage(value:Float): async() {
        ignore _topUp();
        assert(caller == Principal.fromText(Constants.daoCanister));
        burnPercentage := value;
    };

    public shared({caller}) func updateReflectionPercentage(value:Float): async() {
        ignore _topUp();
        assert(caller == Principal.fromText(Constants.daoCanister));
        reflectionPercentage := value;
    };

    public shared({caller}) func updateTreasuryPercentage(value:Float): async() {
        ignore _topUp();
        assert(caller == Principal.fromText(Constants.daoCanister));
        treasuryPercentage := value;
    };

    public shared({caller}) func updateMarketingPercentage(value:Float): async() {
        ignore _topUp();
        assert(caller == Principal.fromText(Constants.daoCanister));
        marketingPercentage := value;
    };

    /*public shared({caller}) func updateMaxHoldingPercentage(value:Float): async() {
        assert(caller == Principal.fromText(Constants.daoCanister));
        maxHoldingPercentage := value;
    };*/

    public shared({caller}) func distribute(amount:Nat,holders:[Holder]): async () {
        ignore _topUp();
        assert(caller == Principal.fromText(Constants.dip20Canister));
        var recipents:[Holder] = [];
        //var community_amount = Float.mul(Utils.natToFloat(amount), transactionPercentage);
        var holder_amount = Float.mul(Utils.natToFloat(amount), reflectionPercentage);
        var sum:Nat = 0;
        await treasuryFee(Utils.natToFloat(amount));
        await marketingFee(Utils.natToFloat(amount));
        await burnFee(Utils.natToFloat(amount));
        for (holding in holders.vals()) {
            if(holding.holder != Constants.burnWallet and holding.holder != Constants.distributionCanister and holding.holder != Constants.taxCollectorCanister and holding.holder != Constants.treasuryWallet and holding.holder != Constants.teamWallet and holding.holder != Constants.marketingWallet){
                sum := sum + holding.amount;
            };
        };
       
        //christmas: var totalReflectionPayout = 0;
        for (holding in holders.vals()) {
            if(holding.holder != Constants.burnWallet and holding.holder != Constants.distributionCanister and holding.holder != Constants.taxCollectorCanister and holding.holder != Constants.treasuryWallet and holding.holder != Constants.teamWallet and holding.holder != Constants.marketingWallet){
                reflectionCount := reflectionCount + 1;
                let percentage:Float = Float.div(Utils.natToFloat(holding.amount), Utils.natToFloat(sum));
                let earnings = Float.mul(holder_amount,percentage);
                let recipent:Holder = { holder = holding.holder; amount = Utils.floatToNat(earnings); receipt = #Err(#Other(""))};
                totalReflectionPayout += earnings;
                //christmas: dear god use a buffer man!!!!
                recipents := Array.append(recipents,[recipent]);
                reflectionAmount := reflectionAmount + Utils.floatToNat(earnings);
            };
        };
        //christmas: let christmasAmount = amount - Utils.floatToNat(totalReflectionPayout);
        //christmas:if(christmasAmount > 0){
            //christmas: let recipent:Holder = { holder = Constants.christmasAccont; amount = christmasAmount; receipt = #Err(#Other(""))};
            //christmas: recipents := Array.append(recipents,[recipent]);
        //christmas:};
        ignore await TokenService.bulkTransfer(recipents);
    };

    public shared({caller}) func treasuryFee(value:Float): async () {
        let _amount = Utils.floatToNat(Float.mul(value, treasuryPercentage));
        let wallet = Principal.fromText(Constants.treasuryWallet);
        ignore await TokenService.taxTransfer(wallet,_amount);
    };

    public shared({caller}) func marketingFee(value:Float): async () {
        let _amount = Utils.floatToNat(Float.mul(value, marketingPercentage));
        let wallet = Principal.fromText(Constants.marketingWallet);
        ignore await TokenService.taxTransfer(wallet,_amount);
    };

    public shared({caller}) func burnFee(value:Float): async () {
        let _amount = Utils.floatToNat(Float.mul(value, burnPercentage));
        let wallet = Principal.fromText(Constants.burnWallet);
        ignore await TokenService.burn(_amount);
    };

    public query func http_request(request : Http.Request) : async Http.Response {
        let path = Iter.toArray(Text.tokens(request.url, #text("/")));
        if (path.size() == 1) {
            switch (path[0]) {
                case ("reflectionCount") return _natResponse(reflectionCount);
                case ("reflectionAmount") return _natResponse(reflectionAmount);
                case (_) return return Http.BAD_REQUEST();
            };
        } else {
            return Http.BAD_REQUEST();
        };
    };

    private func _natResponse(value : Nat) : Http.Response {
        let json = #Number(value);
        let blob = Text.encodeUtf8(JSON.show(json));
        let response : Http.Response = {
            status_code = 200;
            headers = [("Content-Type", "application/json")];
            body = blob;
            streaming_strategy = null;
        };
    };

};
