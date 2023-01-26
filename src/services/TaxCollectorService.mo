import Holder "../models/Holder";
import Constants "../Constants";
import Types "../models/types";
import Burner "../models/Burner";

module {

    private type TxReceipt = Types.TxReceipt;
    private type Holder = Holder.Holder;
    private type Burner = Burner.Burner;

    public func distribute(sender:Principal, amount:Nat,holders:[Holder]): async [Holder] {
        await canister.distribute(sender, amount,holders);
    };

    public func chargeTax(sender:Principal, amount:Nat,holders:[Holder]): async [Holder] {
        await canister.chargeTax(sender, amount,holders);
    };

    public func burnIt(sender:Principal, amount:Nat): async () {
        await canister.burnIt(sender, amount);
    };

    public func fetchTopBurners(): async [(Principal,Burner)] {
        await canister.fetchTopBurners();
    };

    public func updateStats(burners:[Holder], reflectionCount:Nat, reflectionAmount:Nat): async () {
        await canister.updateStats(burners,reflectionCount,reflectionAmount);
    };

    private let canister = actor(Constants.taxCollectorCanister) : actor { 
        distribute: (Principal, Nat, [Holder])  -> async [Holder];
        chargeTax: (Principal, Nat, [Holder])  -> async [Holder];
        fetchTopBurners: ()  -> async [(Principal,Burner)];
        updateStats: ([Holder], Nat, Nat)  -> async ();
        burnIt: (Principal, Nat)  -> async ();
    };
}