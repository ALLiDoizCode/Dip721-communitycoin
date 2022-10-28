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
import Crud "./Crud";
import Transaction "../models/Transaction";
import Holder "../models/Holder";

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
    private type Holder = Holder.Holder;

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

    public shared({ caller }) func putHolder(holder: Holder) : async Text {
        let canister = Principal.toText(caller);
        assert(Constants.dip20Canister == canister);
        await Crud.putHolder(db,holder);
        
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
                case ("getHolder") return _holderResponse(path[1]);
                case (_) return return Http.BAD_REQUEST();
            };
        } else if (path.size() == 3) {
            switch (path[0]) {
                case ("fetchHolders") return _fetchHolderResponse(path[1],path[2]);
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

    private func _fetchHolderResponse(start : Text, end : Text) : Http.Response {
        let transactionsHashMap : HashMap.HashMap<Text, JSON> = HashMap.HashMap<Text, JSON>(
            0,
            Text.equal,
            Text.hash,
        );
        let result = _fetchHolders(start, end);
        var transactions:[JSON] = [];

        for (holder in result.holders.vals()) {
            let json = Utils._holderToJson(holder);
            transactions := Array.append(transactions,[json]);
        };
        transactionsHashMap.put("transactions", #Array(transactions));
        switch(result.sk){
            case(?exist){
                transactionsHashMap.put("sk", #String(exist));
            };
            case(null){

            };
        };
        
        let json = #Object(transactionsHashMap);
        let blob = Text.encodeUtf8(JSON.show(json));
        let response : Http.Response = {
            status_code = 200;
            headers = [("Content-Type", "application/json")];
            body = blob;
            streaming_strategy = null;
        };
    };

    private func _holderResponse(value : Text) : Http.Response {
        let exist = _getHolder(value);
        switch(exist) {
            case(?exist){
                let json = Utils._holderToJson(exist);
                let blob = Text.encodeUtf8(JSON.show(json));
                let response : Http.Response = {
                    status_code = 200;
                    headers = [("Content-Type", "application/json")];
                    body = blob;
                    streaming_strategy = null;
                };
            };
            case(null){
                return Http.NOT_FOUND();
            };
        };
    };

    private func _fetchHolders(skLowerBound: Text, skUpperBound: Text): {holders:[Holder]; sk:?Text} {
        var holders : [Holder] = [];
        let result = CanDB.scan(
            db,
            {
                skLowerBound = "holder:" # skLowerBound;
                skUpperBound = "holder:" # skUpperBound;
                limit = 1000;
                ascending = null;
            },
        );

        for (obj in result.entities.vals()) {
            let holder = Crud.unwrapHolder(obj);
            switch (holder) {
                case (?holder) {
                    holders := Array.append(holders, [holder]);
                };
                case (null) {

                };
            };
        };
        {
            holders = holders;
            sk = result.nextKey;
        };
    };

    private func _getHolder(value: Text): ?Holder {
        switch (CanDB.get(db, { sk = "holder:" # value})) {
            case null { null };
            case (?entity) { Crud.unwrapHolder(entity) };
        };
    };

};