/**
 * Module     : token.mo
 * Copyright  : 2021 DFinance Team
 * License    : Apache 2.0 with LLVM Exception
 * Maintainer : DFinance Team <hello@dfinance.ai>
 * Stability  : Experimental
 */

import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Types "../models/types";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Float "mo:base/Float";
import Array "mo:base/Array";
import List "mo:base/List";
import Option "mo:base/Option";
import Blob "mo:base/Blob";
import Order "mo:base/Order";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Result "mo:base/Result";
import Int "mo:base/Int";
import Text "mo:base/Text";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import Cap "./cap/Cap";
import Root "./cap/Root";
import Holder "../models/Holder";
import Constants "../Constants";
import DatabaseService "../services/DatabaseService";
import ReflectionDatabaseService "../services/ReflectionDatabaseService";
import Utils "../helpers/Utils";
import SHA256 "mo:crypto/SHA/SHA256";
import JSON "../helpers/JSON";
import Transaction "../models/Transaction";
import Http "../helpers/http";
import Response "../models/Response";
import Reflection "../models/Reflection";
import TopUpService "../services/TopUpService";
import Cycles "mo:base/ExperimentalCycles";
import Prim "mo:prim";
import Burner "../models/Burner";
import { recurringTimer; cancelTimer; setTimer } = "mo:base/Timer";

shared (msg) actor class Token(
    _logo : Text,
    _name : Text,
    _symbol : Text,
    _decimals : Nat8,
    _totalSupply : Nat,
    _owner : Principal,
    _fee : Nat,
) = this {

    private stable var burnPercentage : Float = 0.03;
    private stable var reflectionPercentage : Float = 0.03;
    private stable var treasuryPercentage : Float = 0.03;
    private stable var marketingPercentage : Float = 0.02;

    private stable var burnPercentageFull : Float = 3 / 11;
    private stable var reflectionPercentageFull : Float = 3 / 11;
    private stable var treasuryPercentageFull : Float = 3 / 11;
    private stable var marketingPercentageFull : Float = 2 / 11;

    private type Burner = Burner.Burner;
    private type Reflection = Reflection.Reflection;
    private type Transaction = Transaction.Transaction;
    type Holder = Holder.Holder;
    type Operation = Types.Operation;
    type TransactionStatus = Types.TransactionStatus;
    type TxRecord = Types.TxRecord;
    type Metadata = {
        logo : Text;
        name : Text;
        symbol : Text;
        decimals : Nat8;
        totalSupply : Nat;
        owner : Principal;
        fee : Nat;
    };
    // returns tx index or error msg
    public type TxReceipt = Types.TxReceipt;
    private type JSON = JSON.JSON;
    private stable var transactionPercentage : Float = 0.11;
    private stable var owner_ : Principal = _owner;
    private stable var logo_ : Text = _logo;
    private stable var name_ : Text = _name;
    private stable var decimals_ : Nat8 = _decimals;
    private stable var symbol_ : Text = _symbol;
    private stable var totalSupply_ : Nat = _totalSupply;
    private stable var blackhole : Principal = Principal.fromText("aaaaa-aa");
    private stable var feeTo : Principal = owner_;
    private stable var fee : Nat = _fee;
    private stable var balanceEntries : [(Principal, Nat)] = [];
    private stable var allowanceEntries : [(Principal, [(Principal, Nat)])] = [];

    private var balances = HashMap.HashMap<Principal, Nat>(1, Principal.equal, Principal.hash);
    private var allowances = HashMap.HashMap<Principal, HashMap.HashMap<Principal, Nat>>(1, Principal.equal, Principal.hash);

    private stable var creditorEntries : [(Principal, Principal)] = [];
    private var creditors = HashMap.fromIter<Principal, Principal>(creditorEntries.vals(), 0, Principal.equal, Principal.hash);

    private stable var burnedEntries : [(Principal, Burner)] = [];
    private var burned = HashMap.fromIter<Principal, Burner>(burnedEntries.vals(), 0, Principal.equal, Principal.hash);

    private stable var transactionArray : [Transaction] = [];
    private var transactions = Buffer.fromArray<Transaction>(transactionArray);

    private stable var reflectionArray : [Reflection] = [];
    private var reflectionsData = Buffer.fromArray<Reflection>(reflectionArray);

    private stable var transactionClock : Nat = 0;
    private stable var reflectionTransactionClock : Nat = 0;
    private stable var timerStart = false;
    private stable var reflectiontimerStart = false;
    private stable var transactionChunkCount = 2000;
    private stable var transactionQueueTime = 30;
    private stable var lastReflectionAmount = 0;

    private stable var reflectionCount : Nat = 0;
    private stable var reflectionAmount : Nat = 0;

    /*public shared({caller}) func setData(_reflectionCount:Nat,_reflectionAmount:Nat): async () {
        let taxCanister = Principal.fromText(Constants.taxCollectorCanister);
        assert(caller == taxCanister);
        reflectionCount := (reflectionCount - _reflectionAmount) + _reflectionCount;
        reflectionAmount := reflectionAmount + _reflectionAmount;
    };*/

    private let supply = Utils.natToFloat(totalSupply_);
    private stable var isBurnt = false;

    private var distributionWallet = Principal.fromText(Constants.distributionCanister);
    private var liquidityWallet = Principal.fromText(Constants.liquidityWallet);
    private var burnWallet = Principal.fromText(Constants.burnWallet);
    private var teamWallet = Principal.fromText(Constants.teamWallet);
    private var marketingWallet = Principal.fromText(Constants.marketingWallet);

    private var log = "";

    let burnAmount : Nat = 50000000000000000000;
    let distributionWalletAmount = Float.mul(supply, 0.2);
    let liquidityWalletAmount = Float.mul(supply, 0.2);
    let marketingWalletAmount = Float.mul(supply, 0.01);
    let teamWalletAmount = Float.mul(supply, 0.09);

    private stable let genesis : TxRecord = {
        caller = ?owner_;
        op = #mint;
        index = 0;
        from = blackhole;
        to = burnWallet;
        amount = totalSupply_;
        fee = 0;
        timestamp = Time.now();
        status = #succeeded;
    };

    private stable var txcounter : Nat = 0;
    private stable var burnt : Nat = 0;
    private var cap : ?Cap.Cap = null;
    private func addRecord(
        caller : Principal,
        op : Text,
        details : [(Text, Root.DetailValue)],
    ) : async () {
        let c = switch (cap) {
            case (?c) { c };
            case (_) { Cap.Cap(Principal.fromActor(this), 2_000_000_000_000) };
        };
        cap := ?c;
        let record : Root.IndefiniteEvent = {
            operation = op;
            details = details;
            caller = caller;
        };
        // don't wait for result, faster
        let _ = await c.insert(record);
    };

    public query func getMemorySize() : async Nat {
        let size = Prim.rts_memory_size();
        size;
    };

    public query func getHeapSize() : async Nat {
        let size = Prim.rts_heap_size();
        size;
    };

    public query func getCycles() : async Nat {
        Prim.cyclesBalance();
    };

    private func _getMemorySize() : Nat {
        let size = Prim.rts_memory_size();
        size;
    };

    private func _getHeapSize() : Nat {
        let size = Prim.rts_heap_size();
        size;
    };

    private func _getCycles() : Nat {
        Prim.cyclesBalance();
    };

    private func _topUp() : async () {
        if (_getCycles() <= Constants.cyclesThreshold) {
            await TopUpService.topUp();
        };
    };

    private func _chargeFee(from : Principal, fee : Nat) {
        if (fee > 0) {
            _transfer(from, feeTo, fee);
        };
    };

    private func _transfer(from : Principal, to : Principal, value : Nat) {
        let from_balance = _balanceOf(from);
        let from_balance_new : Nat = from_balance - value;
        if (from_balance_new != 0) { balances.put(from, from_balance_new) } else {
            balances.delete(from);
        };

        let to_balance = _balanceOf(to);
        let to_balance_new : Nat = to_balance + value;
        if (to_balance_new != 0) { balances.put(to, to_balance_new) };
    };

    private func _transactonFactory(amount : Int, sender : Text, receiver : Text, tax : Int, transactionType : Text) : Transaction {
        let now = Time.now();

        let _transaction = {
            sender = sender;
            receiver = receiver;
            amount = amount;
            fee = tax;
            timeStamp = now;
            hash = "";
            transactionType = transactionType;
        };

        let hash = Utils._transactionToHash(_transaction);

        {
            sender = sender;
            receiver = receiver;
            amount = amount;
            fee = tax;
            timeStamp = now;
            hash = hash;
            transactionType = transactionType;
        };
    };

    private func _putTransacton(transaction : Transaction) : async () {
        // Use a loop to initiate each asynchronous call
        let _canisters = await DatabaseService.canister.getCanistersByPK("group#ledger");
        let canisters = List.fromArray<Text>(_canisters);
        let exist = List.last(canisters);

        switch (exist) {
            case (?exist) {
                ignore await DatabaseService.putTransaction(exist, transaction);
            };
            case (null) {

            };
        };
        //transactions.add(transaction);
    };

    /*private func _reflectionFactory(amount:Nat) : Reflection {
        let now = Time.now();

        {
            amount = amount;
            timestamp = now;
        };

    };*/

    private func _putReflection(amount : Nat) {
        let now = Time.now();

        let reflection = {
            amount = amount;
            timestamp = now;
        };

        reflectionsData.add(reflection);
    };

    private func _balanceOf(who : Principal) : Nat {
        switch (balances.get(who)) {
            case (?balance) { return balance };
            case (_) { return 0 };
        };
    };

    private func _allowance(owner : Principal, spender : Principal) : Nat {
        switch (allowances.get(owner)) {
            case (?allowance_owner) {
                switch (allowance_owner.get(spender)) {
                    case (?allowance) { return allowance };
                    case (_) { return 0 };
                };
            };
            case (_) { return 0 };
        };
    };

    private func u64(i : Nat) : Nat64 {
        Nat64.fromNat(i);
    };

    /*
    *   Core interfaces:
    *       update calls:
    *           transfer/transferFrom/approve
    *       query calls:
    *           logo/name/symbol/decimal/totalSupply/balanceOf/allowance/getMetadata
    *           historySize/getTransaction/getTransactions
    */

    public shared ({ caller }) func updateTransactionPercentage(value : Float) : async () {
        assert (caller == Principal.fromText(Constants.daoCanister));
        transactionPercentage := value;
    };

    public shared ({ caller }) func setCreditors(creditor : Principal) : async () {
        creditors.put(caller, creditor);
    };

    public query func getBurner(owner : Principal) : async ?Burner {
        burned.get(owner);
    };

    public query func getBurnerCount() : async Nat {
        burned.size();
    };

    public query func fetchTopBurners() : async [(Principal, Burner)] {
        _fetchTopBurners();
    };

    public query func fetchBurners(start : Nat, limit : Nat) : async [(Principal, Burner)] {
        let temp = Iter.toArray(burned.entries());
        func order(a : (Principal, Burner), b : (Principal, Burner)) : Order.Order {
            return Nat.compare(b.1.burnedAmount, a.1.burnedAmount);
        };
        let sorted = Array.sort(temp, order);
        let limit_ : Nat = if (start + limit > temp.size()) {
            temp.size() - start;
        } else {
            limit;
        };
        let res = Array.init<(Principal, Burner)>(limit_, (Principal.fromText(Constants.treasuryWallet), { burnedAmount = 0; earnedAmount = 0 }));
        for (i in Iter.range(0, limit_ - 1)) {
            res[i] := sorted[i +start];
        };
        return Array.freeze(res);
    };

    private func _fetchTopBurners() : [(Principal, Burner)] {
        let count = 50;
        var result : [(Principal, Burner)] = [];
        func order(a : (Principal, Burner), b : (Principal, Burner)) : Order.Order {
            return Nat.compare(b.1.burnedAmount, a.1.burnedAmount);
        };
        for ((spender, data) in burned.entries()) {
            if (result.size() < count) {
                let temp = Array.append(result, [(spender, data)]);
                result := Array.sort(temp, order);
            } else {
                let temp = Array.append(result, [(spender, data)]);
                let sort = Array.sort(temp, order);
                var tempList = List.fromArray(sort);
                var tempTopList = List.take(tempList, count);
                result := List.toArray(tempTopList);
            };
        };
        result;
    };

    private func _burnIt(owner : Principal, amount : Nat) {
        let _owner = Principal.toText(owner);
        if (
            _owner != Constants.distributionCanister and _owner != Constants.swapCanister and _owner != Constants.taxCollectorCanister and _owner != Constants.teamWallet and _owner != Constants.marketingWallet and _owner != Constants.liquidityWallet and _owner != Constants.treasuryWallet and _owner != Constants.cigDaoWallet,
        ) {
            let exist = burned.get(owner);
            switch (exist) {
                case (?exist) {
                    let burnerObject = {
                        burnedAmount = amount +exist.burnedAmount;
                        earnedAmount = exist.earnedAmount;
                    };
                    burned.put(owner, burnerObject);
                };
                case (null) {
                    let burnerObject = {
                        burnedAmount = amount;
                        earnedAmount = 0;
                    };
                    burned.put(owner, burnerObject);
                };
            };
        };
    };

    public shared ({ caller }) func chargeTax(sender : Principal, amount : Nat) : async TxReceipt {
        log := "chargeTax";
        var holder_amount = amount;
        let cigDaoWallet = Principal.fromText(Constants.cigDaoWallet);
        let liquidityWallet = Principal.fromText(Constants.liquidityWallet);
        let treasuryWallet = Principal.fromText(Constants.treasuryWallet);
        assert (sender != cigDaoWallet and sender != liquidityWallet and sender != treasuryWallet);
        let topBurners = _fetchTopBurners();
        var burners : [Holder] = [];
        var sum = totalSupply_;
        assert (_balanceOf(sender) >= amount);
        txcounter := txcounter + 1;
        var _txcounter = txcounter;
        try {

            let burnAmount = Utils.natToFloat(amount) * burnPercentageFull;
            let treasuryAmount = Utils.natToFloat(amount) * treasuryPercentageFull;
            let marketingAmount = Utils.natToFloat(amount) * marketingPercentageFull;

            holder_amount := holder_amount - Utils.floatToNat(burnAmount);
            holder_amount := holder_amount - Utils.floatToNat(treasuryAmount);
            holder_amount := holder_amount - Utils.floatToNat(marketingAmount);

            await* burnFee(sender, Utils.floatToNat(burnAmount));
            await* treasuryFee(sender, Utils.floatToNat(treasuryAmount));
            await* marketingFee(sender, Utils.floatToNat(marketingAmount));

        } catch (e) {
            log := Error.message(e);
        };
        let transaction = Utils._transactionFactory(amount, Principal.toText(sender), "", 0, "tax");
        let hash = _transactionToHash(transaction);

        sum := sum - _balanceOf(Principal.fromText(Constants.burnWallet));
        sum := sum - _balanceOf(Principal.fromText(Constants.distributionCanister));
        sum := sum - _balanceOf(Principal.fromText(Constants.taxCollectorCanister));
        sum := sum - _balanceOf(Principal.fromText(Constants.teamWallet));
        sum := sum - _balanceOf(Principal.fromText(Constants.marketingWallet));
        sum := sum - _balanceOf(Principal.fromText(Constants.liquidityWallet));
        sum := sum - _balanceOf(Principal.fromText(Constants.cigDaoWallet));
        sum := sum - _balanceOf(Principal.fromText(Constants.swapCanister));

        for ((holder_principal, holder_balance) in balances.entries()) {
            let holder_principal_text = Principal.toText(holder_principal);
            if (
                holder_principal_text != Constants.burnWallet and holder_principal_text != Constants.distributionCanister and holder_principal_text != Constants.taxCollectorCanister and holder_principal_text != Constants.teamWallet and holder_principal_text != Constants.marketingWallet and holder_principal_text != Constants.liquidityWallet and holder_principal_text != Constants.cigDaoWallet and holder_principal_text != Constants.swapCanister and holder_principal != sender,
            ) {
                if (holder_principal_text == Constants.treasuryWallet) {
                    let percentage : Float = Float.div(Utils.natToFloat(holder_balance), Utils.natToFloat(sum));
                    let earnings = Float.mul(Utils.natToFloat(holder_amount), percentage);
                    let share = Float.div(earnings, Utils.natToFloat(topBurners.size()));
                    reflectionAmount := reflectionAmount + Utils.floatToNat(earnings);
                    for ((spender, data) in topBurners.vals()) {
                        reflectionCount := reflectionCount + 1;
                        let exist = burned.get(spender);
                        switch (exist) {
                            case (?exist) {
                                let burnerObject = {
                                    burnedAmount = exist.burnedAmount;
                                    earnedAmount = exist.earnedAmount + Utils.floatToNat(share);
                                };
                                burned.put(spender, burnerObject);
                            };
                            case (null) {

                            };
                        };
                        let _holder : Holder = {
                            holder = Principal.toText(spender);
                            amount = Utils.floatToNat(share);
                        };
                        burners := Array.append(burners, [_holder]);
                        _transfer(sender, _getCreditor(spender), Utils.floatToNat(share));
                    };
                } else {
                    reflectionCount := reflectionCount + 1;
                    let percentage : Float = Float.div(Utils.natToFloat(holder_balance), Utils.natToFloat(sum));
                    let earnings = Float.mul(Utils.natToFloat(holder_amount), percentage);
                    _transfer(sender, _getCreditor(holder_principal), Utils.floatToNat(earnings));
                    reflectionAmount := reflectionAmount + Utils.floatToNat(earnings);
                };
            };
        };
        let reflectionTransaction = Utils._transactionFactory(holder_amount, Principal.toText(sender), Principal.toText(Principal.fromActor(this)), 0, "reflections");
        ignore _putTransacton(reflectionTransaction);
        #Ok(hash);
    };

    private func _chargeTax(sender : Principal, amount : Nat) : async () {
        log := "_chargeTax";
        var holder_amount = amount;
        let cigDaoWallet = Principal.fromText(Constants.cigDaoWallet);
        let liquidityWallet = Principal.fromText(Constants.liquidityWallet);
        let treasuryWallet = Principal.fromText(Constants.treasuryWallet);
        assert (sender != cigDaoWallet and sender != liquidityWallet and sender != treasuryWallet);
        let topBurners = _fetchTopBurners();
        var burners : [Holder] = [];
        var sum = totalSupply_;
        assert (_balanceOf(sender) > amount);
        txcounter := txcounter + 1;
        var _txcounter = txcounter;
        try {
            let burnAmount = Utils.natToFloat(amount) * burnPercentage;
            let treasuryAmount = Utils.natToFloat(amount) * treasuryPercentage;
            let marketingAmount = Utils.natToFloat(amount) * marketingPercentage;

            holder_amount := holder_amount - Utils.floatToNat(burnAmount);
            holder_amount := holder_amount - Utils.floatToNat(treasuryAmount);
            holder_amount := holder_amount - Utils.floatToNat(marketingAmount);

            await* burnFee(sender, Utils.floatToNat(burnAmount));
            await* treasuryFee(sender, Utils.floatToNat(treasuryAmount));
            await* marketingFee(sender, Utils.floatToNat(marketingAmount));
        } catch (e) {
            log := Error.message(e);
        };
        let transaction = Utils._transactionFactory(amount, Principal.toText(sender), "", 0, "tax");
        let hash = _transactionToHash(transaction);
        ignore _putTransacton(transaction);

        sum := sum - _balanceOf(Principal.fromText(Constants.burnWallet));
        sum := sum - _balanceOf(Principal.fromText(Constants.distributionCanister));
        sum := sum - _balanceOf(Principal.fromText(Constants.taxCollectorCanister));
        sum := sum - _balanceOf(Principal.fromText(Constants.teamWallet));
        sum := sum - _balanceOf(Principal.fromText(Constants.marketingWallet));
        sum := sum - _balanceOf(Principal.fromText(Constants.liquidityWallet));
        sum := sum - _balanceOf(Principal.fromText(Constants.cigDaoWallet));
        sum := sum - _balanceOf(Principal.fromText(Constants.swapCanister));

        for ((holder_principal, holder_balance) in balances.entries()) {
            let holder_principal_text = Principal.toText(holder_principal);
            if (
                holder_principal_text != Constants.burnWallet and holder_principal_text != Constants.distributionCanister and holder_principal_text != Constants.taxCollectorCanister and holder_principal_text != Constants.teamWallet and holder_principal_text != Constants.marketingWallet and holder_principal_text != Constants.liquidityWallet and holder_principal_text != Constants.cigDaoWallet and holder_principal_text != Constants.swapCanister and holder_principal != sender,
            ) {
                if (holder_principal_text == Constants.treasuryWallet) {
                    let percentage : Float = Float.div(Utils.natToFloat(holder_balance), Utils.natToFloat(sum));
                    let earnings = Float.mul(Utils.natToFloat(holder_amount), percentage);
                    let share = Float.div(earnings, Utils.natToFloat(topBurners.size()));
                    reflectionAmount := reflectionAmount + Utils.floatToNat(earnings);
                    for ((spender, data) in topBurners.vals()) {
                        reflectionCount := reflectionCount + 1;
                        let exist = burned.get(spender);
                        switch (exist) {
                            case (?exist) {
                                let burnerObject = {
                                    burnedAmount = exist.burnedAmount;
                                    earnedAmount = exist.earnedAmount + Utils.floatToNat(share);
                                };
                                burned.put(spender, burnerObject);
                            };
                            case (null) {

                            };
                        };
                        let _holder : Holder = {
                            holder = Principal.toText(spender);
                            amount = Utils.floatToNat(share);
                        };
                        burners := Array.append(burners, [_holder]);
                        _transfer(sender, _getCreditor(spender), Utils.floatToNat(share));
                    };
                } else {
                    reflectionCount := reflectionCount + 1;
                    let percentage : Float = Float.div(Utils.natToFloat(holder_balance), Utils.natToFloat(sum));
                    let earnings = Float.mul(Utils.natToFloat(holder_amount), percentage);
                    _transfer(sender, _getCreditor(holder_principal), Utils.floatToNat(earnings));
                    reflectionAmount := reflectionAmount + Utils.floatToNat(earnings);
                };
            };
        };
        let reflectionTransaction = Utils._transactionFactory(holder_amount, Principal.toText(sender), Principal.toText(Principal.fromActor(this)), 0, "reflections");
        ignore _putTransacton(reflectionTransaction);
    };

    public query ({ caller }) func getCreditor() : async Principal {
        _getCreditor(caller);
    };

    private func _getCreditor(owner : Principal) : Principal {
        let exist = creditors.get(owner);
        switch (exist) {
            case (?exist) {
                exist;
            };
            case (null) {
                owner;
            };
        };
    };

    private func treasuryFee(sender : Principal, value : Nat) : async* () {
        let wallet = Principal.fromText(Constants.treasuryWallet);
        _transfer(sender, wallet, value);
        let transaction = Utils._transactionFactory(value, Principal.toText(msg.caller), Principal.toText(Principal.fromActor(this)), 0, "dao");
        ignore _putTransacton(transaction);
    };

    private func marketingFee(sender : Principal, value : Nat) : async* () {
        let wallet = Principal.fromText(Constants.marketingWallet);
        _transfer(sender, wallet, value);
        let transaction = Utils._transactionFactory(value, Principal.toText(msg.caller), Principal.toText(Principal.fromActor(this)), 0, "dao");
        ignore _putTransacton(transaction);
    };

    private func burnFee(sender : Principal, value : Nat) : async* () {
        ignore await* _burn(sender, value);
    };

    private func _transactionToHash(transaction : Transaction) : Text {
        let json = Utils._transactionToJson(transaction);
        JSON.show(json);
    };

    /// Transfers value amount of tokens to Principal to.
    public shared (msg) func taxTransfer(to : Principal, value : Nat) : async TxReceipt {
        let taxCanister = Principal.fromText(Constants.taxCollectorCanister);
        if (msg.caller != taxCanister) { return #Err(#Unauthorized) };
        if (_balanceOf(msg.caller) < value) {
            return #Err(#InsufficientBalance);
        };
        txcounter := txcounter + 1;
        var _txcounter = txcounter;
        _transfer(msg.caller, to, value);
        let transaction = Utils._transactionFactory(value, Constants.taxCollectorCanister, Principal.toText(to), 0, "dao");
        let hash = _transactionToHash(transaction);
        ignore _putTransacton(transaction);
        return #Ok(hash);
    };

    public shared (msg) func transfer(to : Principal, value : Nat) : async TxReceipt {
        try {
            let _tax : Float = Float.mul(Utils.natToFloat(value), transactionPercentage);
            let tax = Utils.floatToNat(_tax);
            if (_balanceOf(msg.caller) < value + fee) {
                return #Err(#InsufficientBalance);
            };
            txcounter := txcounter + 1;
            var _txcounter = txcounter;
            _transfer(msg.caller, to, value - tax);
            let transaction = Utils._transactionFactory(value, Principal.toText(msg.caller), Principal.toText(to), tax, "transfer");
            let hash = _transactionToHash(transaction);
            ignore _tranferLog(msg.caller : Principal, transaction : Transaction, tax : Nat);
            return #Ok(hash);
        } catch (e) {
            log := "transfer:" #Error.message(e);
            return #Err(#Other(""));
        };
    };

    private func _tranferLog(caller : Principal, transaction : Transaction, tax : Nat) : async () {
        await _putTransacton(transaction);
        await _chargeTax(caller, tax);
    };

    private func _bulkTransfer(sender : Principal, holders : [Holder]) {
        //ignore _topUp();
        log := "bulk Transfer " # Nat.toText(holders.size());
        var response : [Holder] = [];
        //var transactions:[Transaction] = [];
        //var reflections:[Reflection] = [];
        //let taxCollectorCanister = Principal.fromText(Constants.taxCollectorCanister);
        //if(msg.caller != taxCollectorCanister) {return response};
        for (value in holders.vals()) {
            log := "start loop";
            assert (_balanceOf(sender) > value.amount);
            txcounter := txcounter + 1;
            var _txcounter = txcounter;
            _transfer(sender, Principal.fromText(value.holder), value.amount);
            let _holder : Holder = {
                holder = value.holder;
                amount = value.amount;
                receipt = #Ok(_txcounter);
            };
            response := Array.append(response, [_holder]);
            log := "reflection Worked";
        };
    };

    /// Transfers value amount of tokens from Principal from to Principal to.
    public shared (msg) func transferFrom(from : Principal, to : Principal, value : Nat) : async TxReceipt {
        ignore _topUp();
        let _tax : Float = Float.mul(Utils.natToFloat(value), transactionPercentage);
        let tax = Utils.floatToNat(_tax);
        if (_balanceOf(from) < value + fee) {
            return #Err(#InsufficientBalance);
        };
        let allowed : Nat = _allowance(from, msg.caller);
        if (allowed < value + fee) { return #Err(#InsufficientAllowance) };
        txcounter := txcounter + 1;
        var _txcounter = txcounter;
        _transfer(from, to, value - tax);
        let allowed_new : Nat = allowed - value - fee;
        if (allowed_new != 0) {
            let allowance_from = Types.unwrap(allowances.get(from));
            allowance_from.put(msg.caller, allowed_new);
            allowances.put(from, allowance_from);
        } else {
            if (allowed != 0) {
                let allowance_from = Types.unwrap(allowances.get(from));
                allowance_from.delete(msg.caller);
                if (allowance_from.size() == 0) { allowances.delete(from) } else {
                    allowances.put(from, allowance_from);
                };
            };
        };
        let transaction = Utils._transactionFactory(value, Principal.toText(from), Principal.toText(to), tax, "transferFrom");
        let hash = _transactionToHash(transaction);
        ignore _transferFromLog(from,transaction,tax);
        return #Ok(hash);
    };

    private func _transferFromLog(from:Principal,transaction:Transaction,tax:Nat): async () {
        await _putTransacton(transaction);
        await _chargeTax(from, tax);
    };

    /// Allows spender to withdraw from your account multiple times, up to the value amount.
    /// If this function is called again it overwrites the current allowance with value.
    public shared (msg) func approve(spender : Principal, value : Nat) : async TxReceipt {
        await _topUp();
        if (_balanceOf(msg.caller) < fee) { return #Err(#InsufficientBalance) };
        txcounter := txcounter + 1;
        var _txcounter = txcounter;
        let v = value + fee;
        if (value == 0 and Option.isSome(allowances.get(msg.caller))) {
            let allowance_caller = Types.unwrap(allowances.get(msg.caller));
            allowance_caller.delete(spender);
            if (allowance_caller.size() == 0) { allowances.delete(msg.caller) } else {
                allowances.put(msg.caller, allowance_caller);
            };
        } else if (value != 0 and Option.isNull(allowances.get(msg.caller))) {
            var temp = HashMap.HashMap<Principal, Nat>(1, Principal.equal, Principal.hash);
            temp.put(spender, v);
            allowances.put(msg.caller, temp);
        } else if (value != 0 and Option.isSome(allowances.get(msg.caller))) {
            let allowance_caller = Types.unwrap(allowances.get(msg.caller));
            allowance_caller.put(spender, v);
            allowances.put(msg.caller, allowance_caller);
        };
        let transaction = Utils._transactionFactory(value, Principal.toText(msg.caller), Principal.toText(spender), 0, "approve");
        let hash = _transactionToHash(transaction);
        ignore _putTransacton(transaction);
        return #Ok(hash);
    };

    public shared (msg) func mint(to : Principal, value : Nat) : async TxReceipt {
        if (msg.caller != owner_) {
            return #Err(#Unauthorized);
        };
        txcounter := txcounter + 1;
        var _txcounter = txcounter;
        let to_balance = _balanceOf(to);
        totalSupply_ += value;
        balances.put(to, to_balance + value);
        let transaction = Utils._transactionFactory(value, Principal.toText(msg.caller), Principal.toText(to), 0, "mint");
        let hash = _transactionToHash(transaction);
        ignore _putTransacton(transaction);
        return #Ok(hash);
    };

    public shared (msg) func burn(amount : Nat) : async TxReceipt {
        await* _burn(msg.caller, amount);
    };

    private func _burn(caller : Principal, amount : Nat) : async* TxReceipt {
        let from_balance = _balanceOf(caller);
        if (from_balance < amount) {
            return #Err(#InsufficientBalance);
        };
        txcounter := txcounter + 1;
        var _txcounter = txcounter;
        totalSupply_ -= amount;
        balances.put(caller, from_balance - amount);
        burnt := burnt + amount;
        _burnIt(caller, amount);
        let transaction = Utils._transactionFactory(amount, Principal.toText(caller), "", 0, "burn");
        let hash = Utils._transactionToHash(transaction);
        ignore _putTransacton(transaction);
        return #Ok(hash);
    };

    public shared ({ caller }) func setup() : async TxReceipt {
        assert (caller == owner_);
        assert (isBurnt == false);
        txcounter := txcounter + 1;
        var _txcounter = txcounter;
        balances.put(distributionWallet, Utils.floatToNat(distributionWalletAmount));
        balances.put(liquidityWallet, Utils.floatToNat(liquidityWalletAmount));
        balances.put(teamWallet, Utils.floatToNat(teamWalletAmount));
        balances.put(marketingWallet, Utils.floatToNat(marketingWalletAmount));
        totalSupply_ -= burnAmount;
        burnt := burnt + burnAmount;
        isBurnt := true;
        let transaction = Utils._transactionFactory(burnAmount, "", "", 0, "burn");
        let hash = Utils._transactionToHash(transaction);
        ignore _putTransacton(transaction);
        return #Ok(hash);
    };

    public query func logo() : async Text {
        return logo_;
    };

    public query func name() : async Text {
        return name_;
    };

    public query func symbol() : async Text {
        return symbol_;
    };

    public query func decimals() : async Nat8 {
        return decimals_;
    };

    public query func totalSupply() : async Nat {
        return Utils.floatToNat(supply);
    };

    public query func getTokenFee() : async Nat {
        return fee;
    };

    public query func balanceOf(who : Principal) : async Nat {
        return _balanceOf(who);
    };

    public query func allowance(owner : Principal, spender : Principal) : async Nat {
        return _allowance(owner, spender);
    };

    public query func getMetadata() : async Metadata {
        return {
            logo = logo_;
            name = name_;
            symbol = symbol_;
            decimals = decimals_;
            totalSupply = totalSupply_;
            owner = owner_;
            fee = fee;
        };
    };

    /// Get transaction history size
    public query func historySize() : async Nat {
        return txcounter;
    };

    /*
    *   Optional interfaces:
    *       setName/setLogo/setFee/setFeeTo/setOwner
    *       getUserTransactionsAmount/getUserTransactions
    *       getTokenInfo/getHolders/getUserApprovals
    */
    public shared (msg) func setName(name : Text) {
        assert (msg.caller == owner_);
        name_ := name;
    };

    public shared (msg) func setLogo(logo : Text) {
        assert (msg.caller == owner_);
        logo_ := logo;
    };

    public shared (msg) func setFeeTo(to : Principal) {
        assert (msg.caller == owner_);
        feeTo := to;
    };

    public shared (msg) func setFee(_fee : Nat) {
        assert (msg.caller == owner_);
        fee := _fee;
    };

    public shared (msg) func setOwner(_owner : Principal) {
        assert (msg.caller == owner_);
        owner_ := _owner;
    };

    public type TokenInfo = {
        metadata : Metadata;
        feeTo : Principal;
        // status info
        historySize : Nat;
        deployTime : Time.Time;
        holderNumber : Nat;
        cycles : Nat;
    };
    public query func getTokenInfo() : async TokenInfo {
        {
            metadata = {
                logo = logo_;
                name = name_;
                symbol = symbol_;
                decimals = decimals_;
                totalSupply = totalSupply_;
                owner = owner_;
                fee = fee;
            };
            feeTo = feeTo;
            historySize = txcounter;
            deployTime = genesis.timestamp;
            holderNumber = balances.size();
            cycles = Cycles.balance();
        };
    };

    public query func getHolders(start : Nat, limit : Nat) : async [(Principal, Nat)] {
        let temp = Iter.toArray(balances.entries());
        func order(a : (Principal, Nat), b : (Principal, Nat)) : Order.Order {
            return Nat.compare(b.1, a.1);
        };
        let sorted = Array.sort(temp, order);
        let limit_ : Nat = if (start + limit > temp.size()) {
            temp.size() - start;
        } else {
            limit;
        };
        let res = Array.init<(Principal, Nat)>(limit_, (owner_, 0));
        for (i in Iter.range(0, limit_ - 1)) {
            res[i] := sorted[i +start];
        };
        return Array.freeze(res);
    };

    public query func getAllowanceSize() : async Nat {
        var size : Nat = 0;
        for ((k, v) in allowances.entries()) {
            size += v.size();
        };
        return size;
    };

    public query func getUserApprovals(who : Principal) : async [(Principal, Nat)] {
        switch (allowances.get(who)) {
            case (?allowance_who) {
                return Iter.toArray(allowance_who.entries());
            };
            case (_) {
                return [];
            };
        };
    };

    /*
    * upgrade functions
    */
    system func preupgrade() {
        burnedEntries := Iter.toArray(burned.entries());
        creditorEntries := Iter.toArray(creditors.entries());
        balanceEntries := Iter.toArray(balances.entries());
        transactionArray := Buffer.toArray(transactions);
        reflectionArray := Buffer.toArray(reflectionsData);
        var size : Nat = allowances.size();
        var temp : [var (Principal, [(Principal, Nat)])] = Array.init<(Principal, [(Principal, Nat)])>(size, (owner_, []));
        size := 0;
        for ((k, v) in allowances.entries()) {
            temp[size] := (k, Iter.toArray(v.entries()));
            size += 1;
        };
        allowanceEntries := Array.freeze(temp);
    };

    system func postupgrade() {
        balances := HashMap.fromIter<Principal, Nat>(balanceEntries.vals(), 1, Principal.equal, Principal.hash);
        balanceEntries := [];
        for ((k, v) in allowanceEntries.vals()) {
            let allowed_temp = HashMap.fromIter<Principal, Nat>(v.vals(), 1, Principal.equal, Principal.hash);
            allowances.put(k, allowed_temp);
        };
        allowanceEntries := [];
        creditorEntries := [];
        burnedEntries := [];
        transactionArray := [];
        reflectionArray := [];
    };

    public query func http_request(request : Http.Request) : async Http.Response {
        let path = Iter.toArray(Text.tokens(request.url, #text("/")));
        if (path.size() == 1) {
            switch (path[0]) {
                case ("totalsupply") return _natResponse(Utils.floatToNat(supply));
                case ("burnt") return _natResponse(burnt);
                case ("log") return _textResponse(log);
                case ("queue") return _natResponse(transactions.size());
                case ("queue_count") return _natResponse(transactionChunkCount);
                case ("queue_time") return _natResponse(transactionQueueTime);
                case ("reflection_queue") return _natResponse(reflectionsData.size());
                case ("reflection_Amount") return _natResponse(lastReflectionAmount);
                case ("reflectionCount") return _natResponse(reflectionCount);
                case ("reflectionAmount") return _natResponse(reflectionAmount);
                case (_) return return Http.BAD_REQUEST();
            };
        } else if (path.size() == 2) {
            switch (path[0]) {
                case ("balance") return _natResponse(_balanceOf(Principal.fromText(path[1])));
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

    public shared ({ caller }) func distributeTransactions() : async () {
        assert (caller == owner_);
        ignore _distributeTransactions();
    };

    public shared ({ caller }) func setTransactionChunkCount(value : Nat) : async () {
        assert (caller == owner_);
        transactionChunkCount := value;
    };

    public shared ({ caller }) func setTransactionQueueDuration(value : Nat) : async () {
        assert (caller == owner_);
        transactionQueueTime := value;
    }; /*public shared({caller}) func distributeReflections(): async () {
        assert(caller == owner_);
        ignore _distributeReflections()
    };*/

    private func _getTransactionChunks() : [Transaction] {
        let _transactions = List.fromArray(Buffer.toArray(transactions));
        List.toArray(List.take(_transactions, transactionChunkCount));
    };

    private func _dropTransactionChunks() {
        let _transactions = List.fromArray(Buffer.toArray(transactions));
        if (transactions.size() < transactionChunkCount) {
            if (transactions.size() > 0) {
                transactions := Buffer.fromArray(List.toArray(List.drop(_transactions, transactions.size())));
            };
        } else {
            transactions := Buffer.fromArray(List.toArray(List.drop(_transactions, transactionChunkCount)));
        };
    };

    /*public shared({caller}) func stopTimers(): async () {
        assert(caller == owner_);
        cancelTimer(transactionClock);
        cancelTimer(reflectionTransactionClock);
    };*/

    private func _distributeTransactions() : async () {
        log := "preparing transactions";
        let _transactions = _getTransactionChunks();
        if (transactions.size() > 0) {
            try {
                ignore setTimer(#seconds(transactionQueueTime), _distributeTransactions);
                log := "sending transactions";
                await Utils._loadBalanceTransactons(_transactions);
                log := "dropping transactions";
                _dropTransactionChunks();
            } catch (e) {
                log := "distributeTransaction: " # Error.message(e);
            };
        } else {

        };
    };
};
