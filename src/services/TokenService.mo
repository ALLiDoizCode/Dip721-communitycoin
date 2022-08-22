import Holder "../models/Holder";
import Constants "../Constants";

module {

    public type TxReceipt = {
        #Ok: Nat;
        #Err: {
            #InsufficientAllowance;
            #InsufficientBalance;
            #ErrorOperationStyle;
            #Unauthorized;
            #LedgerTrap;
            #ErrorTo;
            #Other: Text;
            #BlockUsed;
            #AmountTooSmall;
        };
    };

    public type Holder = Holder.Holder;

    public func transfer(holder:Holder): async TxReceipt {
        await canister.transfer(holder.holder,holder.amount);
    };

    public func bulkTransfer(holders:[Holder]): async [TxReceipt] {
        await canister.bulkTransfer(holders);
    };

    private let canister = actor(Constants.dip20Canister) : actor { 
        transfer: (Principal, Nat)  -> async TxReceipt;
        bulkTransfer: ([Holder]) -> async [TxReceipt]; 
    };
}
