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
import Utils "../helpers/Utils";
import ULID "mo:ulid/ULID";

module {

    private type Transaction = Transaction.Transaction;
    private type Holder = Holder.Holder;

    public func putTransaction(db:CanDB.DB, transaction: Transaction) : async Text {
        let timeStamp = Int.toText(transaction.timeStamp);
        let _sk = "transaction:" # timeStamp # ":" # transaction.hash;
        let attributes:[(Entity.AttributeKey, Entity.AttributeValue)] = [
            ("sender", #text(transaction.sender)),
            ("receiver", #text(transaction.receiver)),
            ("amount", #int(transaction.amount)),
            ("fee", #int(transaction.fee)),
            ("timeStamp", #int(transaction.timeStamp)),
            ("hash", #text(transaction.hash))
        ];
        await CanDB.put(db, {
            sk = _sk;
            attributes = attributes;
        });
        ignore  _putTransactionId(db, attributes, transaction.hash);
        ignore  _putTransactionSender(db, attributes, transaction.sender, transaction.hash,timeStamp);
        ignore  _putTransactionReceiver(db, attributes, transaction.receiver, transaction.hash,timeStamp);
        transaction.hash;
    };

    private func _putTransactionId(db:CanDB.DB, attributes:[(Entity.AttributeKey, Entity.AttributeValue)], hash: Text) : async Text {
        let _sk = "transactionId:" # hash;
        await CanDB.put(db, {
            sk = _sk;
            attributes = attributes
        });
        _sk;
    };

    private func _putTransactionSender(db:CanDB.DB, attributes:[(Entity.AttributeKey, Entity.AttributeValue)], hash: Text, sender: Text, now:Text) : async Text {
        let _sk = "transactionSender:" #sender # ":" # now # ":" # hash;
        await CanDB.put(db, {
            sk = _sk;
            attributes = attributes
        });
        _sk;
    };

    private func _putTransactionReceiver(db:CanDB.DB, attributes:[(Entity.AttributeKey, Entity.AttributeValue)], hash: Text, receiver:Text, now:Text) : async Text {
        let _sk = "transactionReceiver:" #receiver # ":" # now # ":" # hash;
        await CanDB.put(db, {
            sk = _sk;
            attributes = attributes
        });
        _sk;
    };

    public func unwrapTransaction(entity: Entity.Entity): ?Transaction {
        let { sk; attributes } = entity;
        let sender = Entity.getAttributeMapValueForKey(attributes, "sender");
        let receiver = Entity.getAttributeMapValueForKey(attributes, "receiver");
        let amount = Entity.getAttributeMapValueForKey(attributes, "amount");
        let fee = Entity.getAttributeMapValueForKey(attributes, "fee");
        let timeStamp = Entity.getAttributeMapValueForKey(attributes, "timeStamp");
        let hash = Entity.getAttributeMapValueForKey(attributes, "hash");

        switch(sender, receiver, amount, fee, timeStamp, hash) {
            case (
                ?(#text(sender)),
                ?(#text(receiver)),
                ?(#int(amount)),
                ?(#int(fee)),
                ?(#int(timeStamp)),
                ?(#text(hash)),
            ) 
            { 
                 ?{
                    sender = sender;
                    receiver = receiver;
                    amount = amount;
                    fee = fee;
                    timeStamp = timeStamp;
                    hash = hash;
                 };
            };
            case _ { 
                null 
            }
        };
    };
}