import Holder "../models/Holder";
import Constants "../Constants";
import Types "../models/types";
import Principal "mo:base/Principal";
import Utils "../helpers/Utils";
import Nat64 "mo:base/Nat64";

module {

    private type TxReceipt = Types.TxReceipt;

    private type Holder = Holder.Holder;

    public func transfer(holder:Holder): async TxReceipt {
        await canister.transfer(Principal.fromText(holder.holder),holder.amount);
    };

    public func taxTransfer(sender:Principal,amount:Nat): async TxReceipt {
        await canister.taxTransfer(sender,amount);
    };

    public func bulkTransfer(holders:[Holder]): async [Holder] {
        await canister.bulkTransfer(holders);
    };

    public func burn(amount: Nat): async TxReceipt {
        await canister.burn(amount);
    };

    private let canister = actor(Constants.dip20Canister) : actor { 
        transfer: (Principal, Nat)  -> async TxReceipt;
        taxTransfer: (Principal, Nat)  -> async TxReceipt;
        bulkTransfer: ([Holder]) -> async [Holder];
        burn: (Nat) -> async TxReceipt; 
    };
}
