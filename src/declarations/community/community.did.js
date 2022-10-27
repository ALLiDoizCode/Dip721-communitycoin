export const idlFactory = ({ IDL }) => {
  const Holder = IDL.Record({ 'holder' : IDL.Principal, 'amount' : IDL.Nat });
  return IDL.Service({
    'burnFee' : IDL.Func([IDL.Float64], [], []),
    'devFee' : IDL.Func([IDL.Float64], [], []),
    'distribute' : IDL.Func([IDL.Nat, IDL.Vec(Holder)], [], []),
    'marketingFee' : IDL.Func([IDL.Float64], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
