import Array "mo:base/Array";
import List "mo:base/List";
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
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Float "mo:base/Float";
import Error "mo:base/Error";
import Utils "../helpers/Utils";
import Holder "../models/Holder";
import Constants "../Constants";
import TokenService "../services/TokenService";
import Types "../models/types";
import Http "../helpers/http";
import Response "../models/Response";
import Burner "../models/Burner";
import JSON "../helpers/JSON";
import Cycles "mo:base/ExperimentalCycles";
import TopUpService "../services/TopUpService";
import Order "mo:base/Order";

actor {

    private type TxReceipt = Types.TxReceipt;
    private type Burner = Burner.Burner;

    //private stable var transactionPercentage:Float = 0.11;
    private stable var burnPercentage:Float = 0.03;
    private stable var reflectionPercentage:Float = 0.03;
    private stable var treasuryPercentage:Float = 0.03;
    private stable var marketingPercentage:Float = 0.02;

    private stable var burnPercentageFull:Float = 3/11;
    private stable var reflectionPercentageFull:Float = 3/11;
    private stable var treasuryPercentageFull:Float = 3/11;
    private stable var marketingPercentageFull:Float = 2/11;
    //private stable var maxHoldingPercentage:Float = 0.01;

    private stable var reflectionCount:Nat = 0;
    private stable var reflectionAmount:Nat = 0;
    private var log = "";

    private stable var burnedEntries : [(Principal,Burner)] = [];
    private var burned = HashMap.fromIter<Principal,Burner>(burnedEntries.vals(), 0, Principal.equal, Principal.hash);

    private stable var creditorEntries : [(Principal,Principal)] = [];
    private var creditors = HashMap.fromIter<Principal,Principal>(creditorEntries.vals(), 0, Principal.equal, Principal.hash);

    private type Holder = Holder.Holder;

    system func preupgrade() {
        burnedEntries := Iter.toArray(burned.entries());
        creditorEntries := Iter.toArray(creditors.entries());
    };

    system func postupgrade() {
        burnedEntries := [];
        creditorEntries := [];
    };

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

    public query func getBurnerCount(): async Nat {
        burned.size()
    };

    public query func fetchTopBurners(): async [(Principal,Burner)] {
        _fetchTopBurners()
    };

    public shared({caller}) func setCreditors(creditor:Principal): async () {
        creditors.put(caller,creditor);
    };

    public query({caller}) func getCreditor(): async Principal {
        _getCreditor(caller)
    };

    private func _getCreditor(owner:Principal):Principal {
        let exist = creditors.get(owner);
        switch(exist){
            case(?exist){
                exist
            };
            case(null){
                owner
            };
        };
    };

    public query func fetchBurners(start: Nat, limit: Nat) : async [(Principal, Burner)] {
        let temp =  Iter.toArray(burned.entries());
        func order (a: (Principal, Burner), b: (Principal, Burner)) : Order.Order {
            return Nat.compare(b.1.burnedAmount, a.1.burnedAmount);
        };
        let sorted = Array.sort(temp, order);
        let limit_: Nat = if(start + limit > temp.size()) {
            temp.size() - start
        } else {
            limit
        };
        let res = Array.init<(Principal, Burner)>(limit_, (Principal.fromText(Constants.treasuryWallet), {burnedAmount = 0;earnedAmount = 0;}));
        for (i in Iter.range(0, limit_ - 1)) {
            res[i] := sorted[i+start];
        };
        return Array.freeze(res);
    };

    public query func getBurner(owner:Principal): async ?Burner {
        burned.get(owner);
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

    public shared({caller}) func chargeTax(sender:Principal,amount:Nat,holders:[Holder]): async () {
        log := Nat.toText(holders.size());
        ignore _topUp();
        assert(caller == Principal.fromText(Constants.dip20Canister));
        var recipents:[Holder] = [];
        //var community_amount = Float.mul(Utils.natToFloat(amount), transactionPercentage);
        var holder_amount = Float.mul(Utils.natToFloat(amount), reflectionPercentageFull);
        var sum:Nat = 0;
        await treasuryFee(Utils.natToFloat(amount),treasuryPercentageFull);
        await marketingFee(Utils.natToFloat(amount),marketingPercentageFull);
        await burnFee(sender,Utils.natToFloat(amount),burnPercentageFull);
        for (holding in holders.vals()) {
            log := "loop 1";
            if(holding.holder != Constants.burnWallet 
            and holding.holder != Constants.distributionCanister
            and holding.holder != Constants.taxCollectorCanister 
            and holding.holder != Constants.teamWallet 
            and holding.holder != Constants.marketingWallet
            and holding.holder != Constants.liquidityWallet
            and holding.holder != Constants.cigDaoWallet
            and holding.holder != Constants.swapCanister
            ){
                sum := sum + holding.amount;
            };
        };
        log := "loop 1 end";
        for (holding in holders.vals()) {
            log := "loop 2";
            try {
                if(holding.holder != Constants.burnWallet 
                and holding.holder != Constants.distributionCanister 
                and holding.holder != Constants.taxCollectorCanister  
                and holding.holder != Constants.teamWallet 
                and holding.holder != Constants.marketingWallet
                and holding.holder != Constants.liquidityWallet
                and holding.holder != Constants.cigDaoWallet
                and holding.holder != Constants.swapCanister
                ){
                    if(holding.holder == Constants.treasuryWallet){
                        let topBurners = _fetchTopBurners();
                        reflectionCount := reflectionCount + topBurners.size();
                        let percentage:Float = Float.div(Utils.natToFloat(holding.amount), Utils.natToFloat(sum));
                        let earnings = Float.mul(holder_amount,percentage);
                        let share = Float.div(earnings, Utils.natToFloat(topBurners.size()));
                        for((spender, data) in topBurners.vals() ){
                            _updateBurner(spender,Utils.floatToNat(share));
                            let recipent:Holder = { holder = Principal.toText(_getCreditor(spender)); amount = Utils.floatToNat(share); receipt = #Err(#Other(""))};
                            recipents := Array.append(recipents,[recipent]);
                        }
                    }else {
                        reflectionCount := reflectionCount + 1;
                        let percentage:Float = Float.div(Utils.natToFloat(holding.amount), Utils.natToFloat(sum));
                        let earnings = Float.mul(holder_amount,percentage);
                        let recipent:Holder = { holder = Principal.toText(_getCreditor(Principal.fromText(holding.holder))); amount = Utils.floatToNat(earnings); receipt = #Err(#Other(""))};
                        recipents := Array.append(recipents,[recipent]);
                        reflectionAmount := reflectionAmount + Utils.floatToNat(earnings);
                    };
                };
                log := "worked";
            }catch(e){
                log := "loop error" #Error.message(e);
            }
        };
        try{
            let _ = await TokenService.bulkTransfer(recipents);
        }catch(e){
            log := Error.message(e);
        };
    };

    public shared({caller}) func distribute(sender:Principal,amount:Nat,holders:[Holder]): async () {
        log := Nat.toText(holders.size());
        ignore _topUp();
        assert(caller == Principal.fromText(Constants.dip20Canister));
        var recipents:[Holder] = [];
        //var community_amount = Float.mul(Utils.natToFloat(amount), transactionPercentage);
        var holder_amount = Float.mul(Utils.natToFloat(amount), reflectionPercentage);
        var sum:Nat = 0;
        await treasuryFee(Utils.natToFloat(amount),treasuryPercentage);
        await marketingFee(Utils.natToFloat(amount),marketingPercentage);
        await burnFee(sender,Utils.natToFloat(amount),burnPercentage);
        for (holding in holders.vals()) {
            log := "loop 1";
            if(holding.holder != Constants.burnWallet 
            and holding.holder != Constants.distributionCanister
            and holding.holder != Constants.taxCollectorCanister 
            and holding.holder != Constants.teamWallet 
            and holding.holder != Constants.marketingWallet
            and holding.holder != Constants.liquidityWallet
            and holding.holder != Constants.cigDaoWallet
            and holding.holder != Constants.swapCanister
            ){
                sum := sum + holding.amount;
            };
        };
        log := "loop 1 end";
        for (holding in holders.vals()) {
            log := "loop 2";
            try {
                if(holding.holder != Constants.burnWallet 
                and holding.holder != Constants.distributionCanister 
                and holding.holder != Constants.taxCollectorCanister  
                and holding.holder != Constants.teamWallet 
                and holding.holder != Constants.marketingWallet
                and holding.holder != Constants.liquidityWallet
                and holding.holder != Constants.cigDaoWallet
                and holding.holder != Constants.swapCanister
                ){
                    if(holding.holder == Constants.treasuryWallet){
                        let topBurners = _fetchTopBurners();
                        reflectionCount := reflectionCount + topBurners.size();
                        let percentage:Float = Float.div(Utils.natToFloat(holding.amount), Utils.natToFloat(sum));
                        let earnings = Float.mul(holder_amount,percentage);
                        let share = Float.div(earnings, Utils.natToFloat(topBurners.size()));
                        for((spender, data) in topBurners.vals() ){
                            _updateBurner(spender,Utils.floatToNat(share));
                            let recipent:Holder = { holder = Principal.toText(_getCreditor(spender)); amount = Utils.floatToNat(share); receipt = #Err(#Other(""))};
                            recipents := Array.append(recipents,[recipent]);
                        }
                    }else {
                        reflectionCount := reflectionCount + 1;
                        let percentage:Float = Float.div(Utils.natToFloat(holding.amount), Utils.natToFloat(sum));
                        let earnings = Float.mul(holder_amount,percentage);
                        let recipent:Holder = { holder = Principal.toText(_getCreditor(Principal.fromText(holding.holder))); amount = Utils.floatToNat(earnings); receipt = #Err(#Other(""))};
                        recipents := Array.append(recipents,[recipent]);
                        reflectionAmount := reflectionAmount + Utils.floatToNat(earnings);
                    };
                };
                log := "worked";
            }catch(e){
                log := "loop error" #Error.message(e);
            }
        };
        try{
            let _ = await TokenService.bulkTransfer(recipents);
        }catch(e){
            log := Error.message(e);
        };
    };

    public shared({caller}) func treasuryFee(value:Float,percentage:Float): async () {
        let _amount = Utils.floatToNat(Float.mul(value, percentage));
        let wallet = Principal.fromText(Constants.treasuryWallet);
        ignore await TokenService.taxTransfer(wallet,_amount);
    };

    public shared({caller}) func marketingFee(value:Float,percentage:Float): async () {
        let _amount = Utils.floatToNat(Float.mul(value, percentage));
        let wallet = Principal.fromText(Constants.marketingWallet);
        ignore await TokenService.taxTransfer(wallet,_amount);
    };

    public shared({caller}) func burnFee(sender:Principal,value:Float,percentage:Float): async () {
        let _amount = Utils.floatToNat(Float.mul(value, percentage));
        ignore await TokenService.burn(_amount);
        _burnIt(sender,_amount);
    };

    public shared({caller}) func burnIt(sender:Principal, amount:Nat): async () {
        ignore _topUp();
        let dip20Canister = Principal.fromText(Constants.dip20Canister);
        assert(caller == dip20Canister);
        _burnIt(sender,amount);
    };

    private func _fetchTopBurners(): [(Principal,Burner)] {
        let count = 50;
        var result:[(Principal,Burner)] = [];
        func order (a: (Principal, Burner), b: (Principal, Burner)) : Order.Order {
            return Nat.compare(b.1.burnedAmount, a.1.burnedAmount);
        };
        for((spender,data) in burned.entries()){
            if(result.size() < count){
                let temp = Array.append(result,[(spender,data)]);
                result := Array.sort(temp, order);
            }else {
                let temp = Array.append(result,[(spender,data)]);
                let sort = Array.sort(temp, order);
                var tempList = List.fromArray(sort);
                var tempTopList = List.take(tempList,count);
                result := List.toArray(tempTopList)
            };
        };
        result;
    };

    private func _updateBurner(owner:Principal,earnings:Nat) {
        let taxCollector = Principal.fromText("fppg4-cyaaa-aaaap-aanza-cai");
        if(owner != taxCollector){
            let exist = burned.get(owner);
            switch(exist){
                case(?exist){
                    let burnerObject = {
                        burnedAmount = exist.burnedAmount;
                        earnedAmount = exist.earnedAmount + earnings;
                    };
                    burned.put(owner,burnerObject);
                };
                case(null){
                    
                };
            }; 
        };
    };

    private func _burnIt(owner:Principal,amount:Nat) {
        let _owner = Principal.toText(owner);
        if(_owner != Constants.distributionCanister
            and _owner != Constants.swapCanister 
            and _owner != Constants.taxCollectorCanister 
            and _owner != Constants.teamWallet 
            and _owner != Constants.marketingWallet
            and _owner != Constants.liquidityWallet
            and _owner != Constants.treasuryWallet
            and _owner != Constants.cigDaoWallet){
            let exist = burned.get(owner);
            switch(exist){
                case(?exist){
                    let burnerObject = {
                        burnedAmount = amount+exist.burnedAmount;
                        earnedAmount = exist.earnedAmount;
                    };
                    burned.put(owner,burnerObject);
                };
                case(null){
                    let burnerObject = {
                        burnedAmount = amount;
                        earnedAmount = 0;
                    };
                    burned.put(owner,burnerObject);
                };
            }; 
        };
    };

    public query func http_request(request : Http.Request) : async Http.Response {
        let path = Iter.toArray(Text.tokens(request.url, #text("/")));
        if (path.size() == 1) {
            switch (path[0]) {
                case ("reflectionCount") return _natResponse(reflectionCount);
                case ("reflectionAmount") return _natResponse(reflectionAmount);
                case ("log") return _textResponse(log);
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

    private func _textResponse(value : Text) : Http.Response {
        let json = #String(value);
        let blob = Text.encodeUtf8(JSON.show(json));
        let response : Http.Response = {
            status_code = 200;
            headers = [("Content-Type", "application/json")];
            body = blob;
            streaming_strategy = null;
        };
    };

};
