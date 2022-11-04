import bigDecimal from "js-big-decimal";

export function bigIntToDecimal(big: BigInt | number) {
    var result = new bigDecimal(big?.toString() || 1);
    var decimal = new bigDecimal(100000);
    return result.divide(decimal, 5);
}