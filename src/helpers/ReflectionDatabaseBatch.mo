import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Cycles "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import Reflection "../models/Reflection";
import Buffer "mo:stable-buffer/StableBuffer";
import ReflectionDatabaseService "../services/ReflectionDatabaseService";
import Time "mo:base/Time";
import Utils "../helpers/Utils";
import List "mo:base/List";

module {

  private type Reflection = Reflection.Reflection;

  // Concurrently request the canister statuses of all Reflections passed, breaking the concurrent canister status
  // requests into batches of 100 at a time in order to get around the following issue 
  // >  `"Canister trapped explicitly: could not perform self call" issue at around 500`
  // See https://forum.dfinity.org/t/canister-output-message-queue-limits-and-ic-management-canister-throttling-limits/15972
  //
  // Note: The shifting between an Array and a Buffer right now is because in Motoko async functions cannot accept
  // var parameters (needs an Array), and appending to an Array is very inefficient (use Buffer instead)
  //
  public func batchAwaitAllCanisterStatuses(reflections: [Reflection], batchSize: Nat): async () {
    let size = reflections.size();
    var round = 0;

    Debug.print("quering canister status in batches of " # debug_show(batchSize));

    // make 100 async calls at a time to the IC Management Canister as to not overflow this canister's output queue
    while (round * batchSize < size) {
      let start = round * batchSize;
      let end = if (start + batchSize > size) { size } else { start + batchSize }; 
      Debug.print(
        "round " # debug_show(round) # 
        ": fetching statuses for canisters " # debug_show(start) # " - " # debug_show(end)
      );

      // from the larger Reflections subarray, creates a subArray of 100 Reflections
      let subArrayReflections = subArray(reflections, start, end); 

      // get all canister statuses for each principal in the subArray
      await awaitAllCanisterStatuses(subArrayReflections);
    
      round += 1;
    };

  };


  // Concurrently request the canister statuses of all Reflections passed
  //
  // Note: The shifting between an Array and a Buffer right now is because in Motoko async functions cannot accept
  // var parameters (needs an Array), and appending to an Array is very inefficient (use Buffer instead)
  //
  public func awaitAllCanisterStatuses(reflections: [Reflection]): async () {
    let ids = Buffer.fromArray<Reflection>(reflections);
    let calls = Buffer.init<async Text>();
    var i = 0;

    // Use a loop to initiate each asynchronous call
    let _canisters = await ReflectionDatabaseService.canister.getCanistersByPK("group#ledger");
    let canisters = List.fromArray<Text>(_canisters);
    let exist = List.last(canisters);

    switch(exist){
        case(?exist){
            label l loop {
            if (i >= ids.count) { break l };
                //finish adding inter canister call
                Buffer.add(calls,  ReflectionDatabaseService.putReflection(exist,reflections[i]));
                i += 1;
            };

            i := 0;
            // Use a loop to collect each executed asynchronous call
            label l loop {
            if (i >= ids.count) { break l };
                ignore await calls.elems[i];
                i += 1;
            };
        };
        case(null){
            
        };
    };
  };

  // Creates {count} amount of canisters from the "Child" actor
  //
  // Note: The shifting between an Array and a Buffer right now is because in Motoko async functions cannot accept
  // var parameters (needs an Array), and appending to an Array is very inefficient (use Buffer instead)
  //

  func subArray<T>(arr: [T], start: Nat, end: Nat): [T] {
    Array.tabulate<T>(end - start, func(i) { 
      arr[start + i] 
    });
  };
}