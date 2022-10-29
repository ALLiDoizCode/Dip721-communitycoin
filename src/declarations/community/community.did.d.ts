import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Holder { 'holder' : string, 'amount' : bigint }
export interface _SERVICE {
  'distribute' : ActorMethod<[bigint, Array<Holder>], undefined>,
  'test' : ActorMethod<[bigint, Array<Holder>], undefined>,
}
