export const idlFactory = ({ IDL }) => {
  const Tree = IDL.Rec();
  const Color = IDL.Variant({ 'B' : IDL.Null, 'R' : IDL.Null });
  const InterCanisterActionResult = IDL.Variant({
    'ok' : IDL.Null,
    'err' : IDL.Text,
  });
  Tree.fill(
    IDL.Variant({
      'leaf' : IDL.Null,
      'node' : IDL.Tuple(
        Color,
        Tree,
        IDL.Tuple(IDL.Text, IDL.Opt(InterCanisterActionResult)),
        Tree,
      ),
    })
  );
  const CanisterCleanupStatusMap = IDL.Record({
    'stop' : Tree,
    'delete' : Tree,
    'transfer' : Tree,
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
  const UpgradePKRangeResult = IDL.Record({
    'nextKey' : IDL.Opt(IDL.Text),
    'upgradeCanisterResults' : IDL.Vec(
      IDL.Tuple(IDL.Text, InterCanisterActionResult)
    ),
  });
  const IndexCanister = IDL.Service({
    'autoScaleCollectionServiceCanister' : IDL.Func([IDL.Text], [IDL.Text], []),
    'createPostCollectionServiceCanisterByGroup' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(IDL.Text)],
        [],
      ),
    'deleteCanistersByPK' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(CanisterCleanupStatusMap)],
        [],
      ),
    'getCanistersByPK' : IDL.Func([IDL.Text], [IDL.Vec(IDL.Text)], ['query']),
    'getCycles' : IDL.Func([], [IDL.Nat], ['query']),
    'getHeapSize' : IDL.Func([], [IDL.Nat], ['query']),
    'getMemorySize' : IDL.Func([], [IDL.Nat], ['query']),
    'http_request' : IDL.Func([Request], [Response], ['query']),
    'upgradeGroupCanistersInPKRange' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Vec(IDL.Nat8)],
        [UpgradePKRangeResult],
        [],
      ),
  });
  return IndexCanister;
};
export const init = ({ IDL }) => { return []; };
