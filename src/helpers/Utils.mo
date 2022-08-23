import Int64 "mo:base/Int64";
import Nat64 "mo:base/Nat64";
import Nat "mo:base/Nat";
import Float "mo:base/Float";

module {

    public func natToFloat(value:Nat): Float {
        //var nat64 = Nat64.fromNat(value);
        //var int64 = Int64.fromNat64(nat64);
        return Float.fromInt(value)
    };

    public func floatToNat(value:Float): Nat {
        let int = Float.toInt(value);
        let nat64 = Nat64.fromIntWrap(int);
        return Nat64.toNat(nat64)
    };
}