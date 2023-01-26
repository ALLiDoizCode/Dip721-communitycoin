import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Cycles "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import Transaction "../models/Transaction";
import Buffer "mo:stable-buffer/StableBuffer";
import DatabaseService "../services/DatabaseService";
import Time "mo:base/Time";
import Utils "../helpers/Utils";
import List "mo:base/List";

module {

  private type Transaction = Transaction.Transaction;

  // Concurrently request the canister statuses of all transactions passed, breaking the concurrent canister status
  // requests into batches of 100 at a time in order to get around the following issue 
  // >  `"Canister trapped explicitly: could not perform self call" issue at around 500`
  // See https://forum.dfinity.org/t/canister-output-message-queue-limits-and-ic-management-canister-throttling-limits/15972
  //
  // Note: The shifting between an Array and a Buffer right now is because in Motoko async functions cannot accept
  // var parameters (needs an Array), and appending to an Array is very inefficient (use Buffer instead)
  //
  public func batchAwaitAllCanisterStatuses(transactions: [Transaction], batchSize: Nat): async () {
    let size = transactions.size();
    var round = 0;

    Debug.print("quering canister status in batches of " # debug_show(batchSize));

    // make 300 async calls at a time to the database Canister as to not overflow this canister's output queue
    while (round * batchSize < size) {
      let start = round * batchSize;
      let end = if (start + batchSize > size) { size } else { start + batchSize }; 
      Debug.print(
        "round " # debug_show(round) # 
        ": fetching statuses for canisters " # debug_show(start) # " - " # debug_show(end)
      );

      // from the larger transactions subarray, creates a subArray of 00 transactions
      let subArraytransactions = subArray(transactions, start, end); 

      // get all canister statuses for each principal in the subArray
      await awaitAllCanisterStatuses(subArraytransactions);
    
      round += 1;
    };

  };


  // Concurrently request the canister statuses of all transactions passed
  //
  // Note: The shifting between an Array and a Buffer right now is because in Motoko async functions cannot accept
  // var parameters (needs an Array), and appending to an Array is very inefficient (use Buffer instead)
  //
  public func awaitAllCanisterStatuses(transactions: [Transaction]): async () {
    let ids = Buffer.fromArray<Transaction>(transactions);
    let calls = Buffer.init<async Text>();
    var i = 0;

    // Use a loop to initiate each asynchronous call
    let _canisters = await DatabaseService.canister.getCanistersByPK("group#ledger");
    let canisters = List.fromArray<Text>(_canisters);
    let exist = List.last(canisters);

    switch(exist){
        case(?exist){
            label l loop {
            if (i >= ids.count) { break l };
                //finish adding inter canister call
                Buffer.add(calls, DatabaseService.putTransaction(exist,transactions[i]));
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