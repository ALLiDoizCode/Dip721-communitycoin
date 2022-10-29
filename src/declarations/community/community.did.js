export const idlFactory = ({ IDL }) => {
  const Holder = IDL.Record({ 'holder' : IDL.Text, 'amount' : IDL.Nat });
  return IDL.Service({
    'distribute' : IDL.Func([IDL.Nat, IDL.Vec(Holder)], [], []),
    'test' : IDL.Func([IDL.Nat, IDL.Vec(Holder)], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
