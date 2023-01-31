import Holder "../models/Holder";
import Constants "../Constants";
import Types "../models/types";
import Principal "mo:base/Principal";
import Utils "../helpers/Utils";
import Nat64 "mo:base/Nat64";
import Burner "../models/Burner";

module {

    private type Burner = Burner.Burner;

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

    public func chargeTax(sender:Principal, amount: Nat): async TxReceipt {
        await canister.chargeTax(sender,amount);
    };

    public func setData(reflectionCount:Nat,reflectionAmount:Nat): async () {
        await canister.setData(reflectionCount,reflectionAmount);
    };

    private let canister = actor(Constants.dip20Canister) : actor { 
        transfer: (Principal, Nat)  -> async TxReceipt;
        taxTransfer: (Principal, Nat)  -> async TxReceipt;
        bulkTransfer: ([Holder]) -> async [Holder];
        burn: (Nat) -> async TxReceipt;
        chargeTax: (Principal, Nat) -> async TxReceipt;
        setData: (Nat, Nat) -> async (); 
    };
}
