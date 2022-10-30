import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Holder { 'holder' : string, 'amount' : bigint }
export interface _SERVICE {
  'burnFee' : ActorMethod<[number], undefined>,
  'distribute' : ActorMethod<[bigint, Array<Holder>], undefined>,
  'marketingFee' : ActorMethod<[number], undefined>,
  'treasuryFee' : ActorMethod<[number], undefined>,
}
