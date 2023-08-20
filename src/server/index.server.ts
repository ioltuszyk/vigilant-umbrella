import MockScoreProvider from "./providers/MockScoreProvider";
import LeaderboardService from "./services/LeaderboardService";

// in a normal context you'd somehow receive a request from a player client and invoke the corresponding service method

LeaderboardService.updateLeaderboard(64624, MockScoreProvider); // uses the mock score provider to update the leaderboard for player 64624 with a random score
LeaderboardService.updateLeaderboard(14901247091, MockScoreProvider); // uses the mock score provider to update the leaderboard for player 64624 with a random score

task.wait(1);
LeaderboardService.requestLeaderboard({ timespan: "daily", numPlayers: 10 }).andThen((response) => {
	print("Parsing response...");

	response.scores.forEach((score) => {
		print(score.playerId, score.score);
	});
}); // requests the daily leaderboard for up to the top 10 players
