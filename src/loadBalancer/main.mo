import DatabaseBatch "../helpers/DatabaseBatch";
import ReflectionDatabaseBatch "../helpers/ReflectionDatabaseBatch";
import Transaction "../models/Transaction";
import Reflection "../models/Reflection";
import Http "../helpers/http";
import Response "../models/Response";
import JSON "../helpers/JSON";
import Constants "../Constants";
import Error "mo:base/Error";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";

actor class Node() {

    private var log = "";

    private type Reflection = Reflection.Reflection;
    private type Transaction = Transaction.Transaction;
    private type JSON = JSON.JSON;

    public shared({caller}) func putTransactions(transactions:[Transaction]): async() {
        let _transactions = Array.filter<Transaction>(transactions,func(e:Transaction):Bool{e.amount > 0});
        log := "transaction database started work " #Nat.toText(_transactions.size());
        let tokenCanister = Principal.fromText(Constants.dip20Canister);
        assert(caller == tokenCanister);
        try{
            await DatabaseBatch.batchAwaitAllCanisterStatuses(_transactions, 300);
            log := "database Worked " #Nat.toText(_transactions.size());
        }catch(e){
            log := "transaction:" #"Size: " #Nat.toText(_transactions.size()) #" " #Error.message(e);
        };
    };

    public shared({caller}) func putReflections(reflections:[Reflection]): async() {
        let _reflections = Array.filter<Reflection>(reflections,func(e:Reflection):Bool{e.amount > 0});
        log := "reflection database started work " #Nat.toText(_reflections.size());
        let tokenCanister = Principal.fromText(Constants.dip20Canister);
        assert(caller == tokenCanister);
        try{
            await ReflectionDatabaseBatch.batchAwaitAllCanisterStatuses(_reflections, 300);
            log := "database Worked " #Nat.toText(_reflections.size());
        }catch(e){
            log := "refelction:" #"Size: " #Nat.toText(_reflections.size()) #" " #Error.message(e) ;
        };
    };

    public query func http_request(request : Http.Request) : async Http.Response {
        let path = Iter.toArray(Text.tokens(request.url, #text("/")));
        if (path.size() == 1) {
            switch (path[0]) {
                case ("log") return _textResponse(log);
                case (_) return return Http.BAD_REQUEST();
            };
        }else {
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
}