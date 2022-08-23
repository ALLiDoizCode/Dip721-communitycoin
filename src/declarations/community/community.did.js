export const idlFactory = ({ IDL }) => {
  const TxReceipt = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : IDL.Variant({
      'InsufficientAllowance' : IDL.Null,
      'InsufficientBalance' : IDL.Null,
      'ErrorOperationStyle' : IDL.Null,
      'Unauthorized' : IDL.Null,
      'LedgerTrap' : IDL.Null,
      'ErrorTo' : IDL.Null,
      'Other' : IDL.Text,
      'BlockUsed' : IDL.Null,
      'AmountTooSmall' : IDL.Null,
    }),
  });
  const Holder = IDL.Record({
    'receipt' : TxReceipt,
    'holder' : IDL.Principal,
    'amount' : IDL.Nat,
  });
  return IDL.Service({
    'burnFee' : IDL.Func([IDL.Float64], [], []),
    'devFee' : IDL.Func([IDL.Float64], [], []),
    'distribute' : IDL.Func([IDL.Nat, IDL.Vec(Holder)], [], []),
    'marketingFee' : IDL.Func([IDL.Float64], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
