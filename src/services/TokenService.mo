import Holder "../models/Holder";
import Constants "../Constants";
import Types "../models/types";

module {

    private type TxReceipt = Types.TxReceipt;

    private type Holder = Holder.Holder;

    public func transfer(holder:Holder): async TxReceipt {
        await canister.transfer(holder.holder,holder.amount);
    };

    public func communityTransfer(sender:Principal,amount:Nat): async TxReceipt {
        await canister.communityTransfer(sender,amount);
    };

    public func bulkTransfer(holders:[Holder]): async [TxReceipt] {
        await canister.bulkTransfer(holders);
    };

    private let canister = actor(Constants.dip20Canister) : actor { 
        transfer: (Principal, Nat)  -> async TxReceipt;
        communityTransfer: (Principal, Nat)  -> async TxReceipt;
        bulkTransfer: ([Holder]) -> async [TxReceipt]; 
    };
}
