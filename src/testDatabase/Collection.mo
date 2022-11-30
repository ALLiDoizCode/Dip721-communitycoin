import CA "mo:candb/CanisterActions";
import CanDB "mo:candb/CanDB";
import Entity "mo:candb/Entity";
import Array "mo:base/Array";
import Blob "mo:base/Deque";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Http "../helpers/http";
import Int "mo:base/Int";
import Int32 "mo:base/Int32";
import Iter "mo:base/Iter";
import JSON "../helpers/JSON";
import Nat32 "mo:base/Nat32";
import Nat "mo:base/Nat";
import Prim "mo:prim";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import List "mo:base/List";
import Utils "../helpers/Utils";
import Cycles "mo:base/ExperimentalCycles";
import Response "../models/Response";
import Constants "../Constants";
import Transaction "../models/Transaction";
import Reflection "../models/Reflection";

shared({ caller = owner }) actor class Collection({
    // the primary key of this canister
    partitionKey : Text;
    // the scaling options that determine when to auto-scale out this canister storage partition
    scalingOptions : CanDB.ScalingOptions;
    // (optional) allows the developer to specify additional owners (i.e. for allowing admin or backfill access to specific endpoints)
    owners : ?[Principal];
}) {

    private stable var transactiontId : Int = 1;
  
    private type JSON = JSON.JSON;
    private type ApiError = Response.ApiError;
    private type Transaction = Transaction.Transaction;
    private type Reflection = Reflection.Reflection;

    /// @required (may wrap, but must be present in some form in the canister)
    stable let db = CanDB.init({
        pk = partitionKey;
        scalingOptions = scalingOptions;
    });

    /// @recommended (not required) public API
    public query func getPK() : async Text { db.pk };

    /// @required public API (Do not delete or change)
    public query func skExists(sk : Text) : async Bool {
        CanDB.skExists(db, sk);
    };

    private func _skExists(sk : Text) : Bool {
        CanDB.skExists(db, sk);
    };

    /// @required public API (Do not delete or change)
    public shared({ caller = caller }) func transferCycles() : async () {
        if (caller == owner) {
            return await CA.transferCycles(caller);
        };
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
        Cycles.balance();
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
        Cycles.balance();
    };

    public query func http_request(request : Http.Request) : async Http.Response {
        let path = Iter.toArray(Text.tokens(request.url, #text("/")));

        if (path.size() == 1) {
            let value = path[1];
            switch (path[0]) {
                case ("getMemorySize") return _natResponse(_getMemorySize());
                case ("getHeapSize") return _natResponse(_getHeapSize());
                case ("getCycles") return _natResponse(_getCycles());
                case (_) return return Http.BAD_REQUEST();
            };
        } else if (path.size() == 2) {
            switch (path[0]) {
                case ("skExists") return _skExistsResponse(path[1]);
                case (_) return return Http.BAD_REQUEST();
            };
        } else {
            return Http.BAD_REQUEST();
        };
    };

    private func _skExistsResponse(sk : Text) : Http.Response {
        let json = #Boolean(_skExists(sk));
        let blob = Text.encodeUtf8(JSON.show(json));
        let response : Http.Response = {
            status_code = 200;
            headers = [("Content-Type", "application/json")];
            body = blob;
            streaming_strategy = null;
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

    public func test(startSkSuffix: Nat, count: Nat): async Nat {
        let transaction: Transaction = {
            sender = "";
            receiver = "";
            amount = 0;
            fee = 0;
            timeStamp = 0;
            hash = "";
            transactionType = "";
        };

        let skPrefix = "mockSk";
        var i = startSkSuffix;
        var end = startSkSuffix + count;
        while (i < end) {
            let attributes:[(Entity.AttributeKey, Entity.AttributeValue)] = [
                ("sender", #text(transaction.sender)),
                ("receiver", #text(transaction.receiver)),
                ("amount", #int(transaction.amount)),
                ("fee", #int(transaction.fee)),
                ("timeStamp", #int(transaction.timeStamp)),
                ("hash", #text(transaction.hash)),
                ("transactionType", #text(transaction.transactionType))
            ];
            let sk = "test#" # Nat.toText(i);
            try {
                await CanDB.put(db,{sk = sk; attributes = attributes});
                i += 1;
            }catch(e){
                return end
            };
        };
        end
    };
};