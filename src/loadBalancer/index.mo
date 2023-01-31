import Http "../helpers/http";
import Response "../models/Response";
import JSON "../helpers/JSON";
import Constants "../Constants";
import Error "mo:base/Error";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Transaction "../models/Transaction";
import Reflection "../models/Reflection";
import Buffer "mo:base/Buffer";
import Utils "../helpers/Utils";

shared({ caller = owner }) actor class Index() {

    private type Reflection = Reflection.Reflection;
    private type Transaction = Transaction.Transaction;

    private stable var transactionArray:[Transaction] = [];
    private var transactions = Buffer.fromArray<Transaction>(transactionArray);

    private stable var reflectionArray:[Reflection] = [];
    private var reflectionsData = Buffer.fromArray<Reflection>(reflectionArray);

    var nodes:[Text] = [];

    system func preupgrade() {
       transactionArray := Buffer.toArray(transactions);
        reflectionArray := Buffer.toArray(reflectionsData);
    };

    system func postupgrade() {
        transactionArray := [];
        reflectionArray := [];
    };

    public shared(msg) func addNode(node:Text): async () {
        assert(msg.caller == owner);
        nodes := Array.append(nodes,[node]);
    };

    public shared(msg) func removeNode(node:Text): async () {
        assert(msg.caller == owner);
        nodes := Array.filter(nodes,func(e:Text):Bool{e != node});
    };

    public query func fetchNodes(): async [Text] {
        nodes
    };
}