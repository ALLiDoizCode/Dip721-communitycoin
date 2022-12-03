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
import Reflection "../models/Reflection";
import TopUpService "../services/TopUpService";
import Holder "../models/Holder";

shared ({ caller = owner }) actor class Collection({
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
    private type ReflectionTransaction = Reflection.ReflectionTransaction;
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
    public shared ({ caller = caller }) func transferCycles() : async () {
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

    public shared ({ caller }) func putReflections(parentHash:Text, transactions : [ReflectionTransaction]) : async Text {
        ignore _topUp();
        let canister = Principal.toText(caller);
        assert (Constants.dip20Canister == canister);
        await Crud.putReflections(db, parentHash, transactions);

    };

    private func _topUp(): async () {
        if (_getCycles() <= Constants.cyclesThreshold){
            await TopUpService.topUp();
        }
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
                case ("fetchReflections") return _reflectionsResponse(path[1]);
                case (_) return return Http.BAD_REQUEST();
            };
        }else {
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

    private func _reflectionsResponse(value : Text) : Http.Response {
        let exist = _fetchTransaction(value);
        var jsonArray:[JSON] = []; 
        switch (exist) {
            case (?exist) {
                for(reflection in exist.vals()) {
                    jsonArray := Array.append(jsonArray,[#String(reflection)]);
                };
                let blob = Text.encodeUtf8(JSON.show(#Array(jsonArray)));
                let response : Http.Response = {
                    status_code = 200;
                    headers = [("Content-Type", "application/json")];
                    body = blob;
                    streaming_strategy = null;
                };
            };
            case (null) {
                return Http.NOT_FOUND();
            };
        };
    };

    private func _fetchTransaction(value : Text) : ?[Text] {
        switch (CanDB.get(db, { sk = "reflectons:" # value })) {
            case null { null };
            case (?entity) { Crud.unwrapReflections(entity) };
        };
    };

};
