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

shared({ caller = owner }) actor class Index() {
    var nodes:[Text] = [];

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