import Types "../models/types";

module {

    type TxReceipt = Types.TxReceipt;

    public type Holder = {
        holder:Principal;
        amount:Nat;
        receipt:TxReceipt;
    };
}