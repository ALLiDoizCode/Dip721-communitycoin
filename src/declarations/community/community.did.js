export const idlFactory = ({ IDL }) => {
  const Holder = IDL.Record({ 'holder' : IDL.Text, 'amount' : IDL.Nat });
  return IDL.Service({
    'burnFee' : IDL.Func([IDL.Float64], [], []),
    'distribute' : IDL.Func([IDL.Nat, IDL.Vec(Holder)], [], []),
    'marketingFee' : IDL.Func([IDL.Float64], [], []),
    'treasuryFee' : IDL.Func([IDL.Float64], [], []),
    'updateBurnPercentage' : IDL.Func([IDL.Float64], [], []),
    'updateMarketingPercentage' : IDL.Func([IDL.Float64], [], []),
    'updateMaxHoldingPercentage' : IDL.Func([IDL.Float64], [], []),
    'updateReflectionPercentage' : IDL.Func([IDL.Float64], [], []),
    'updateTransactionPercentage' : IDL.Func([IDL.Float64], [], []),
    'updateTreasuryPercentage' : IDL.Func([IDL.Float64], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
