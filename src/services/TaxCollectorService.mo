import Holder "../models/Holder";
import Constants "../Constants";
import Types "../models/types";


module {

    private type TxReceipt = Types.TxReceipt;

    private type Holder = Holder.Holder;

    public func distribute(sender:Principal, amount:Nat,holders:[Holder]): async () {
        await canister.distribute(sender, amount,holders);
    };

    public func chargeTax(sender:Principal, amount:Nat,holders:[Holder]): async () {
        await canister.chargeTax(sender, amount,holders);
    };

    public func burnIt(sender:Principal, amount:Nat): async () {
        await canister.burnIt(sender, amount);
    };

    private let canister = actor(Constants.taxCollectorCanister) : actor { 
        distribute: (Principal, Nat, [Holder])  -> async ();
        chargeTax: (Principal, Nat, [Holder])  -> async ();
        burnIt: (Principal, Nat)  -> async ();
    };
}