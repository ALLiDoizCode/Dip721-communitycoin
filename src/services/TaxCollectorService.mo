import Holder "../models/Holder";
import Constants "../Constants";
import Types "../models/types";


module {

    private type TxReceipt = Types.TxReceipt;

    private type Holder = Holder.Holder;

    public func distribute(amount:Nat,holders:[Holder]): async () {
        await canister.distribute(amount,holders);
    };

    private let canister = actor(Constants.taxCollectorCanister) : actor { 
        distribute: (Nat, [Holder])  -> async ();
    };
}