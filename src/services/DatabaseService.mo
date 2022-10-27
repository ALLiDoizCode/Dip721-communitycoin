import Holder "../models/Holder";
import Transaction "../models/Transaction";
import Constants "../Constants";
import Types "../models/types";

module {

    private type Transaction = Transaction.Transaction;

    private type Holder = Holder.Holder;

    public let canister = actor(Constants.databaseCanister) : actor { 
        putTransaction: (Transaction)  -> async Text;
    };
}
