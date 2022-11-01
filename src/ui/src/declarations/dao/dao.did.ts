
export type Canister = { 'dao' : null } |
  { 'controller' : null } |
  { 'community' : null } |
  { 'treasury' : null };
export type HeaderField = [string, string];
export interface MemberDraft {
  'principal' : string,
  'description' : string,
  'power' : bigint,
};
export type ProposalRequest = { 'tax' : TaxRequest } |
  { 'treasuryAction' : TreasuryActionRequest } |
  { 'upgrade' : UpgradeRequest } |
  { 'treasury' : TreasuryRequest };
export interface Request {
  'url' : string,
  'method' : string,
  'body' : Array<number>,
  'headers' : Array<HeaderField>,
};
export type RequestDraft = { 'threshold' : ThresholdDraft } |
  { 'removeMember' : MemberDraft } |
  { 'addMember' : MemberDraft } |
  { 'transfer' : TransferDraft };
export interface Response {
  'body' : Array<number>,
  'headers' : Array<HeaderField>,
  'streaming_strategy' : [] | [StreamingStrategy],
  'status_code' : number,
};
export type StreamingCallback = (arg_0: StreamingCallbackToken) => Promise<
    StreamingCallbackResponse
  >;
export interface StreamingCallbackResponse {
  'token' : [] | [StreamingCallbackToken],
  'body' : Array<number>,
};
export interface StreamingCallbackToken {
  'key' : number,
  'sha256' : [] | [Array<number>],
  'index' : number,
  'content_encoding' : string,
};
export type StreamingStrategy = {
    'Callback' : {
      'token' : StreamingCallbackToken,
      'callback' : StreamingCallback,
    }
  };
export interface TaxRequest {
  'title' : string,
  'description' : string,
  'taxType' : TaxType,
};
export type TaxType = { 'maxHolding' : number } |
  { 'marketing' : number } |
  { 'burn' : number } |
  { 'transaction' : number } |
  { 'reflection' : number } |
  { 'treasury' : number };
export interface ThresholdDraft { 'description' : string, 'power' : bigint };
export interface TransferDraft {
  'recipient' : string,
  'description' : string,
  'amount' : bigint,
};
export interface TreasuryActionRequest {
  'title' : string,
  'request' : RequestDraft,
  'description' : string,
};
export interface TreasuryRequest {
  'title' : string,
  'vote' : boolean,
  'description' : string,
  'treasuryRequestId' : number,
};
export type TxReceipt = { 'Ok' : bigint } |
  {
    'Err' : { 'InsufficientAllowance' : null } |
      { 'InsufficientBalance' : null } |
      { 'ActiveProposal' : null } |
      { 'ErrorOperationStyle' : null } |
      { 'Unauthorized' : null } |
      { 'LedgerTrap' : null } |
      { 'ErrorTo' : null } |
      { 'Other' : string } |
      { 'BlockUsed' : null } |
      { 'AmountTooSmall' : null }
  };
export interface UpgradeRequest {
  'title' : string,
  'source' : string,
  'args' : Array<number>,
  'hash' : string,
  'wasm' : Array<number>,
  'description' : string,
  'canister' : Canister,
};
export interface _SERVICE {
  'createProposal' : (arg_0: ProposalRequest) => Promise<TxReceipt>,
  'executeProposal' : () => Promise<TxReceipt>,
  'getCycles' : () => Promise<bigint>,
  'getHeapSize' : () => Promise<bigint>,
  'getMemorySize' : () => Promise<bigint>,
  'http_request' : (arg_0: Request) => Promise<Response>,
  'vote' : (arg_0: number, arg_1: bigint, arg_2: boolean) => Promise<TxReceipt>,
};

export const idlFactory = ({ IDL }) => {
    const TaxType = IDL.Variant({
      'maxHolding' : IDL.Float64,
      'marketing' : IDL.Float64,
      'burn' : IDL.Float64,
      'transaction' : IDL.Float64,
      'reflection' : IDL.Float64,
      'treasury' : IDL.Float64,
    });
    const TaxRequest = IDL.Record({
      'title' : IDL.Text,
      'description' : IDL.Text,
      'taxType' : TaxType,
    });
    const ThresholdDraft = IDL.Record({
      'description' : IDL.Text,
      'power' : IDL.Nat,
    });
    const MemberDraft = IDL.Record({
      'principal' : IDL.Text,
      'description' : IDL.Text,
      'power' : IDL.Nat,
    });
    const TransferDraft = IDL.Record({
      'recipient' : IDL.Text,
      'description' : IDL.Text,
      'amount' : IDL.Nat,
    });
    const RequestDraft = IDL.Variant({
      'threshold' : ThresholdDraft,
      'removeMember' : MemberDraft,
      'addMember' : MemberDraft,
      'transfer' : TransferDraft,
    });
    const TreasuryActionRequest = IDL.Record({
      'title' : IDL.Text,
      'request' : RequestDraft,
      'description' : IDL.Text,
    });
    const Canister = IDL.Variant({
      'dao' : IDL.Null,
      'controller' : IDL.Null,
      'community' : IDL.Null,
      'treasury' : IDL.Null,
    });
    const UpgradeRequest = IDL.Record({
      'title' : IDL.Text,
      'source' : IDL.Text,
      'args' : IDL.Vec(IDL.Nat8),
      'hash' : IDL.Text,
      'wasm' : IDL.Vec(IDL.Nat8),
      'description' : IDL.Text,
      'canister' : Canister,
    });
    const TreasuryRequest = IDL.Record({
      'title' : IDL.Text,
      'vote' : IDL.Bool,
      'description' : IDL.Text,
      'treasuryRequestId' : IDL.Nat32,
    });
    const ProposalRequest = IDL.Variant({
      'tax' : TaxRequest,
      'treasuryAction' : TreasuryActionRequest,
      'upgrade' : UpgradeRequest,
      'treasury' : TreasuryRequest,
    });
    const TxReceipt = IDL.Variant({
      'Ok' : IDL.Nat,
      'Err' : IDL.Variant({
        'InsufficientAllowance' : IDL.Null,
        'InsufficientBalance' : IDL.Null,
        'ActiveProposal' : IDL.Null,
        'ErrorOperationStyle' : IDL.Null,
        'Unauthorized' : IDL.Null,
        'LedgerTrap' : IDL.Null,
        'ErrorTo' : IDL.Null,
        'Other' : IDL.Text,
        'BlockUsed' : IDL.Null,
        'AmountTooSmall' : IDL.Null,
      }),
    });
    const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
    const Request = IDL.Record({
      'url' : IDL.Text,
      'method' : IDL.Text,
      'body' : IDL.Vec(IDL.Nat8),
      'headers' : IDL.Vec(HeaderField),
    });
    const StreamingCallbackToken = IDL.Record({
      'key' : IDL.Nat32,
      'sha256' : IDL.Opt(IDL.Vec(IDL.Nat8)),
      'index' : IDL.Nat32,
      'content_encoding' : IDL.Text,
    });
    const StreamingCallbackResponse = IDL.Record({
      'token' : IDL.Opt(StreamingCallbackToken),
      'body' : IDL.Vec(IDL.Nat8),
    });
    const StreamingCallback = IDL.Func(
        [StreamingCallbackToken],
        [StreamingCallbackResponse],
        ['query'],
      );
    const StreamingStrategy = IDL.Variant({
      'Callback' : IDL.Record({
        'token' : StreamingCallbackToken,
        'callback' : StreamingCallback,
      }),
    });
    const Response = IDL.Record({
      'body' : IDL.Vec(IDL.Nat8),
      'headers' : IDL.Vec(HeaderField),
      'streaming_strategy' : IDL.Opt(StreamingStrategy),
      'status_code' : IDL.Nat16,
    });
    return IDL.Service({
      'createProposal' : IDL.Func([ProposalRequest], [TxReceipt], []),
      'executeProposal' : IDL.Func([], [TxReceipt], []),
      'getCycles' : IDL.Func([], [IDL.Nat], ['query']),
      'getHeapSize' : IDL.Func([], [IDL.Nat], ['query']),
      'getMemorySize' : IDL.Func([], [IDL.Nat], ['query']),
      'http_request' : IDL.Func([Request], [Response], ['query']),
      'vote' : IDL.Func([IDL.Nat32, IDL.Nat, IDL.Bool], [TxReceipt], []),
    });
  };
  export const init = ({ IDL }) => { return []; };