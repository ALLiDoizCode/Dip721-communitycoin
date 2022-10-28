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
import Transaction "../models/Transaction";
import Holder "../models/Holder";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat64 "mo:base/Nat64";
import Utils "../helpers/Utils";
import ULID "mo:ulid/ULID";

module {

    private type Transaction = Transaction.Transaction;
    private type Holder = Holder.Holder;

    public func putHolder(db:CanDB.DB, holder: Holder) : async Text {
        let _sk = "holder:" # holder.holder;
        let attributes:[(Entity.AttributeKey, Entity.AttributeValue)] = [
            ("holder", #text(holder.holder)),
            ("amount", #int(holder.amount)),
        ];
        await CanDB.put(db, {
            sk = _sk;
            attributes = attributes;
        });
        _sk;
    };

    public func unwrapHolder(entity: Entity.Entity): ?Holder {
        let { sk; attributes } = entity;
        let holder = Entity.getAttributeMapValueForKey(attributes, "holder");
        let amount = Entity.getAttributeMapValueForKey(attributes, "amount");
        switch(holder, amount) {
            case (
                ?(#text(holder)),
                ?(#int(amount)),
            ) 
            { 
                let value = Nat64.fromIntWrap(amount);
                 ?{
                    holder = holder;
                    amount = Nat64.toNat(value);
                 };
            };
            case _ { 
                null 
            }
        };
    };
}