import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type HeaderField = [string, string];
export interface IndexCanister {
  'autoScalePostCollectionServiceCanister' : ActorMethod<[string], string>,
  'createPostCollectionServiceCanisterByGroup' : ActorMethod<
    [string],
    [] | [string],
  >,
  'getCanistersByPK' : ActorMethod<[string], Array<string>>,
  'getCycles' : ActorMethod<[], bigint>,
  'getHeapSize' : ActorMethod<[], bigint>,
  'getMemorySize' : ActorMethod<[], bigint>,
  'http_request' : ActorMethod<[Request], Response>,
}
export interface Request {
  'url' : string,
  'method' : string,
  'body' : Array<number>,
  'headers' : Array<HeaderField>,
}
export interface Response {
  'body' : Array<number>,
  'headers' : Array<HeaderField>,
  'streaming_strategy' : [] | [StreamingStrategy],
  'status_code' : number,
}
export type StreamingCallback = ActorMethod<
  [StreamingCallbackToken],
  StreamingCallbackResponse,
>;
export interface StreamingCallbackResponse {
  'token' : [] | [StreamingCallbackToken],
  'body' : Array<number>,
}
export interface StreamingCallbackToken {
  'key' : number,
  'sha256' : [] | [Array<number>],
  'index' : number,
  'content_encoding' : string,
}
export type StreamingStrategy = {
    'Callback' : {
      'token' : StreamingCallbackToken,
      'callback' : StreamingCallback,
    }
  };
export interface _SERVICE extends IndexCanister {}
