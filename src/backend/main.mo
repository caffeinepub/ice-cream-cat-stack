import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Nat "mo:core/Nat";

actor {
  type ScoreEntry = {
    name : Text;
    score : Nat;
    timestamp : Time.Time;
  };

  module ScoreEntry {
    public func compareByScore(entry1 : ScoreEntry, entry2 : ScoreEntry) : Order.Order {
      switch (Nat.compare(entry2.score, entry1.score)) {
        case (#equal) { Int.compare(entry2.timestamp, entry1.timestamp) };
        case (order) { order };
      };
    };
  };

  let scores = Map.empty<Text, ScoreEntry>();

  public shared ({ caller }) func saveScore(name : Text, score : Nat) : async () {
    if (score > 1000) {
      Runtime.trap("Score cannot be above 1000");
    };
    let entry : ScoreEntry = {
      name;
      score;
      timestamp = Time.now();
    };
    scores.add(name, entry);
  };

  public query ({ caller }) func getTopScores() : async [ScoreEntry] {
    scores.values().toArray().sort(ScoreEntry.compareByScore).sliceToArray(0, 10);
  };
};
