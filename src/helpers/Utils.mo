import Int64 "mo:base/Int64";
import Nat64 "mo:base/Nat64";
import Nat "mo:base/Nat";
import Float "mo:base/Float";

module {

    public func natToFloat(value:Nat): Float {
        var nat64 = Nat64.fromNat(value);
        var int64 = Int64.fromNat64(nat64);
        return Float.fromInt64(int64)
    };

    public func floatToNat(value:Float): Nat {
        let int64 = Float.toInt64(value);
        let nat64 = Int64.toNat64(int64);
        return Nat64.toNat(nat64)
    };
}