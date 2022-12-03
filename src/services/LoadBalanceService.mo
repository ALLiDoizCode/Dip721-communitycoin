import Holder "../models/Holder";
import Transaction "../models/Transaction";
import Constants "../Constants";
import Types "../models/types";
import Reflection "../models/Reflection";

module {

    private type Transaction = Transaction.Transaction;
    private type Reflection = Reflection.Reflection;

    public func putTransactions(canisterId:Text,transactions:[Transaction]) : async () {
        let canister = actor(canisterId) : actor { 
            putTransactions: shared ([Transaction])  -> async ();
        };

        await canister.putTransactions(transactions);
    };

    public func putReflections(canisterId:Text,reflections:[Reflection]) : async () {
        let canister = actor(canisterId) : actor { 
            putReflections: shared ([Reflection]) -> async (); 
        };

        await canister.putReflections(reflections);
    };
}
