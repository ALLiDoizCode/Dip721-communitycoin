import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Holder {
  'receipt' : TxReceipt,
  'holder' : Principal,
  'amount' : bigint,
}
export type TxReceipt = { 'Ok' : bigint } |
  {
    'Err' : { 'InsufficientAllowance' : null } |
      { 'InsufficientBalance' : null } |
      { 'ErrorOperationStyle' : null } |
      { 'Unauthorized' : null } |
      { 'LedgerTrap' : null } |
      { 'ErrorTo' : null } |
      { 'Other' : string } |
      { 'BlockUsed' : null } |
      { 'AmountTooSmall' : null }
  };
export interface _SERVICE {
  'burnFee' : ActorMethod<[number], undefined>,
  'devFee' : ActorMethod<[number], undefined>,
  'distribute' : ActorMethod<[bigint, Array<Holder>], undefined>,
  'marketingFee' : ActorMethod<[number], undefined>,
}
