import CanDB "mo:candb/CanDB";
import Entity "mo:candb/Entity";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Int "mo:base/Int";
import Int32 "mo:base/Int32";
import Iter "mo:base/Iter";
import Nat32 "mo:base/Nat32";
import Prim "mo:prim";
import Principal "mo:base/Principal";
import Response "../models/Response";
import Reflection "../models/Reflection";
import Holder "../models/Holder";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Utils "../helpers/Utils";
import ULID "mo:ulid/ULID";
import JSON "../helpers/JSON";

module {

    private type ReflectionTransaction = Reflection.ReflectionTransaction;
    private type Holder = Holder.Holder;

    public func putReflections(db:CanDB.DB, parentHash:Text, transactions: [ReflectionTransaction]) : async Text {
        let now = Time.now();
        var reflections:[Text] = [];
        for(transaction in transactions.vals()){
            let json = Utils._reflectionTransactionToJson(transaction);
            let stringValue = JSON.show(json);
            reflections := Array.append(reflections,[stringValue]);
        };
        let timeStamp = Int.toText(now);
        let _sk = "reflectons:" # parentHash;
        let attributes:[(Entity.AttributeKey, Entity.AttributeValue)] = [
            ("reflections", #arrayText(reflections))
        ];
        await CanDB.put(db, {
            sk = _sk;
            attributes = attributes;
        });
        parentHash;
    };
    public func unwrapReflections(entity: Entity.Entity): ?[Text] {
        let { sk; attributes } = entity;
        let reflections = Entity.getAttributeMapValueForKey(attributes, "reflections");
        switch(reflections) {
            case (
                ?(#arrayText(reflections))
            ) 
            { 
                 ?reflections;
            };
            case _ { 
                null 
            }
        };
    };
}