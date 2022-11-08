import bigDecimal from "js-big-decimal";
export type consumer<T> = (t:T) => void;

export function bigIntToDecimal(big: BigInt | number) {
    var result = new bigDecimal(big?.toString() || 1);
    var decimal = new bigDecimal(100000);
    return result.divide(decimal, 5);
}

export function bigIntToDecimalPrettyString(big: BigInt | number) {
    return bigIntToDecimal(big).getPrettyValue(3, ",");
}


export default {
    bigIntToDecimal,
    bigIntToDecimalPrettyString
}