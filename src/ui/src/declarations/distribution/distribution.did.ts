export type HeaderField = [string, string];
export interface Request {
  url: string;
  method: string;
  body: Array<number>;
  headers: Array<HeaderField>;
}
export interface Response {
  body: Array<number>;
  headers: Array<HeaderField>;
  streaming_strategy: [] | [StreamingStrategy];
  status_code: number;
}
export type StreamingCallback = (arg_0: StreamingCallbackToken) => Promise<StreamingCallbackResponse>;
export interface StreamingCallbackResponse {
  token: [] | [StreamingCallbackToken];
  body: Array<number>;
}
export interface StreamingCallbackToken {
  key: number;
  sha256: [] | [Array<number>];
  index: number;
  content_encoding: string;
}
export type StreamingStrategy = {
  Callback: {
    token: StreamingCallbackToken;
    callback: StreamingCallback;
  };
};
export type TxError =
  | { NotifyDfxFailed: null }
  | { InsufficientAllowance: null }
  | { UnexpectedCyclesResponse: null }
  | { InsufficientBalance: null }
  | { InsufficientXTCFee: null }
  | { ErrorOperationStyle: null }
  | { NoRound: null }
  | { Unauthorized: null }
  | { LedgerTrap: null }
  | { ErrorTo: null }
  | { Other: null }
  | { FetchRateFailed: null }
  | { BlockUsed: null }
  | { AmountTooSmall: null };
export type TxReceipt = { Ok: bigint } | { Err: TxError };
export type TxReceipt__1 =
  | { Ok: bigint }
  | {
      Err:
        | { InsufficientAllowance: null }
        | { InsufficientBalance: null }
        | { ActiveProposal: null }
        | { ErrorOperationStyle: null }
        | { Unauthorized: null }
        | { LedgerTrap: null }
        | { ErrorTo: null }
        | { Other: string }
        | { BlockUsed: null }
        | { AmountTooSmall: null };
    };
export interface _SERVICE {
  claim: (arg_0: number) => Promise<TxReceipt__1>;
  deposit: (arg_0: number, arg_1: bigint) => Promise<TxReceipt>;
  getCycles: () => Promise<bigint>;
  getHeapSize: () => Promise<bigint>;
  getMemorySize: () => Promise<bigint>;
  http_request: (arg_0: Request) => Promise<Response>;
  realICPDeposit: (arg_0: number, arg_1: bigint) => Promise<TxReceipt>;
  startDistribution: (arg_0: bigint) => Promise<undefined>;
  testDeposit: (arg_0: number, arg_1: bigint) => Promise<TxReceipt>;
}

export const idlFactory = ({ IDL }) => {
  const TxReceipt__1 = IDL.Variant({
    Ok: IDL.Nat,
    Err: IDL.Variant({
      InsufficientAllowance: IDL.Null,
      InsufficientBalance: IDL.Null,
      ActiveProposal: IDL.Null,
      ErrorOperationStyle: IDL.Null,
      Unauthorized: IDL.Null,
      LedgerTrap: IDL.Null,
      ErrorTo: IDL.Null,
      Other: IDL.Text,
      BlockUsed: IDL.Null,
      AmountTooSmall: IDL.Null,
    }),
  });
  const TxError = IDL.Variant({
    NotifyDfxFailed: IDL.Null,
    InsufficientAllowance: IDL.Null,
    UnexpectedCyclesResponse: IDL.Null,
    InsufficientBalance: IDL.Null,
    InsufficientXTCFee: IDL.Null,
    ErrorOperationStyle: IDL.Null,
    NoRound: IDL.Null,
    Unauthorized: IDL.Null,
    LedgerTrap: IDL.Null,
    ErrorTo: IDL.Null,
    Other: IDL.Null,
    FetchRateFailed: IDL.Null,
    BlockUsed: IDL.Null,
    AmountTooSmall: IDL.Null,
  });
  const TxReceipt = IDL.Variant({ Ok: IDL.Nat, Err: TxError });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const Request = IDL.Record({
    url: IDL.Text,
    method: IDL.Text,
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(HeaderField),
  });
  const StreamingCallbackToken = IDL.Record({
    key: IDL.Nat32,
    sha256: IDL.Opt(IDL.Vec(IDL.Nat8)),
    index: IDL.Nat32,
    content_encoding: IDL.Text,
  });
  const StreamingCallbackResponse = IDL.Record({
    token: IDL.Opt(StreamingCallbackToken),
    body: IDL.Vec(IDL.Nat8),
  });
  const StreamingCallback = IDL.Func([StreamingCallbackToken], [StreamingCallbackResponse], ["query"]);
  const StreamingStrategy = IDL.Variant({
    Callback: IDL.Record({
      token: StreamingCallbackToken,
      callback: StreamingCallback,
    }),
  });
  const Response = IDL.Record({
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(HeaderField),
    streaming_strategy: IDL.Opt(StreamingStrategy),
    status_code: IDL.Nat16,
  });
  return IDL.Service({
    claim: IDL.Func([IDL.Nat32], [TxReceipt__1], []),
    deposit: IDL.Func([IDL.Nat32, IDL.Nat], [TxReceipt], []),
    getCycles: IDL.Func([], [IDL.Nat], ["query"]),
    getHeapSize: IDL.Func([], [IDL.Nat], ["query"]),
    getMemorySize: IDL.Func([], [IDL.Nat], ["query"]),
    http_request: IDL.Func([Request], [Response], ["query"]),
    realICPDeposit: IDL.Func([IDL.Nat32, IDL.Nat], [TxReceipt], []),
    startDistribution: IDL.Func([IDL.Nat], [], []),
    testDeposit: IDL.Func([IDL.Nat32, IDL.Nat], [TxReceipt], []),
  });
};
