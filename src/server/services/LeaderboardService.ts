import { Service } from "@flamework/core";
import Object from "@rbxts/object-utils";
import { DataStoreService } from "@rbxts/services";
import { t } from "@rbxts/t/lib/t";
import { ScoreProvider } from "server/interfaces/ScoreProvider";
import { CheckedType } from "shared/utils/typeutils";

/**
 * @param timespan The timespan to retrieve the leaderboard for
 * @param numPlayers The number of players to retrieve
 */
export type LeaderboardRequest = CheckedType<typeof LeaderboardRequestDtoSchema>;

/**
 * @param scores An ordered list of players and their scores
 */
export type LeaderboardResponse = {
	scores: Array<{
		playerId: number;
		score: number;
	}>;
};

// constants
const RESULTS_PER_PAGE = 10;

// schemas
const LeaderboardRequestDtoSchema = t.interface({
	timespan: t.union(t.literal("daily"), t.literal("weekly"), t.literal("monthly"), t.literal("alltime")),
	numPlayers: t.union(t.numberPositive, t.numberMin(1)),
});

/**
 * A cache of leaderboards that have been retrieved recently
 *
 * @remarks the key is the timespan, and the value is an object containing the last time the leaderboard was retrieved and the leaderboard itself
 */
const leaderboardCache = new Map<
	string,
	{
		lastRetrieval: number;
		leaderboard: LeaderboardResponse;
	}
>();

/**
 * A singleton that handles leaderboard requests
 *
 * We could feasibly use something like flamework for lifecycle events and leverage dependency injection where appropriate.
 * this is especially the case if we're going to be reading in these values from another service. Changing this accordingly
 * would be fairly trivial, as it would involve adding the '@Service' decorator to this class, adding a constructor that
 * specifies the dependencies, and exporting the class itself rather than an instance of it.
 *
 * @example
 * ```
 * import LeaderboardService from "shared/services/LeaderboardService";
 *
 * LeaderboardService.requestLeaderboard({ timespan: "daily", numPlayers: 10 })
 * 	.then((leaderboard) => {
 * 		print(leaderboard.scores[0].playerId);
 * 	})
 * 	.catch((err) => {
 * 		warn(err);
 * 	});
 * ```
 */
class LeaderboardService {
	/**
	 * A public-facing method to request a leaderboard
	 * @param payload The request payload
	 * @returns A promise that resolves to a leaderboard response
	 */
	public requestLeaderboard(payload: LeaderboardRequest): Promise<LeaderboardResponse> {
		return new Promise((resolve, reject) => {
			const validPayload = LeaderboardRequestDtoSchema(payload); // ideally there'd be a mechanism to check this data as it comes in rather than explicitly checking it here
			if (!validPayload) {
				return reject("Invalid payload");
			}
			this.getLeaderboard(payload)
				.andThen((leaderboard) => {
					resolve(leaderboard);
				})
				.catch((err) => {
					reject(err);
				});
		});
	}

	/**
	 * Uses the cached leaderboard if it's recent enough, otherwise retrieves a new leaderboard
	 * @param timespan The timespan to retrieve the leaderboard for
	 * @param numPlayers The number of players to retrieve
	 * @returns A promise that resolves to a leaderboard response
	 */
	private getLeaderboard({ timespan, numPlayers }: LeaderboardRequest): Promise<LeaderboardResponse> {
		const dayScope = os.date("%j/%Y");
		const weekScope = os.date("%W/%Y");
		const monthScope = os.date("%m/%Y");

		const dailyLeaderboardDatastore = DataStoreService.GetOrderedDataStore("leaderboard", "daily" + dayScope);
		const weeklyLeaderboardDatastore = DataStoreService.GetOrderedDataStore("leaderboard", "weekly" + weekScope);
		const monthlyLeaderboardDatastore = DataStoreService.GetOrderedDataStore("leaderboard", "monthly" + monthScope);
		const allTimeLeaderboardDatastore = DataStoreService.GetOrderedDataStore("leaderboard", "alltime"); // note this never changes; I could make this a variable with higher scope

		return new Promise<LeaderboardResponse>((resolve, reject) => {
			const cachedLeaderboard = leaderboardCache.get(timespan);
			if (cachedLeaderboard) {
				// if the cached leaderboard is younger than 60 seconds and has enough players, return it
				if (
					os.time() - cachedLeaderboard.lastRetrieval > 60 &&
					cachedLeaderboard.leaderboard.scores.size() >= numPlayers
				) {
					return resolve(cachedLeaderboard.leaderboard);
				}
			}

			let pages: DataStorePages;
			switch (timespan) {
				case "daily":
					pages = dailyLeaderboardDatastore.GetSortedAsync(false, RESULTS_PER_PAGE);
					break;
				case "weekly":
					pages = weeklyLeaderboardDatastore.GetSortedAsync(false, RESULTS_PER_PAGE);
					break;
				case "monthly":
					pages = monthlyLeaderboardDatastore.GetSortedAsync(false, RESULTS_PER_PAGE);
					break;
				case "alltime":
					pages = allTimeLeaderboardDatastore.GetSortedAsync(false, RESULTS_PER_PAGE);
					break;
			}

			// aggregates data about each player into an array
			const scores: Array<{ playerId: number; score: number }> = [];
			while (scores.size() < numPlayers) {
				task.wait();
				const currentPage = pages.GetCurrentPage();

				currentPage.forEach((element) => {
					if (Object.keys(scores).size() < numPlayers) {
						const playerId = tonumber(element.key) as number;
						const score = element.value as number;
						scores.push({ playerId, score });
					}
				});

				if (pages.IsFinished === false) {
					pages.AdvanceToNextPageAsync();
				} else {
					break;
				}
			}

			const timeRetrieved = os.time();
			const leaderboard = { scores };

			leaderboardCache.set(timespan, { lastRetrieval: timeRetrieved, leaderboard });
			resolve(leaderboard);
		});
	}

	/**
	 * Updates the leaderboard for a given player using a specified score provider (a class that implements the ScoreProvider interface)
	 * @param playerId The player to update the leaderboard for
	 * @param score The score to update the leaderboard with
	 */
	public updateLeaderboard(playerId: number, scoreProvider: ScoreProvider): void {
		// TODO: not very DRY (the same logic is used in getLeaderboard; ideally I would refactor this into a separate method)
		const dayScope = os.date("%j/%Y");
		const weekScope = os.date("%W/%Y");
		const monthScope = os.date("%m/%Y");

		const dailyLeaderboardDatastore = DataStoreService.GetOrderedDataStore("leaderboard", "daily" + dayScope);
		const weeklyLeaderboardDatastore = DataStoreService.GetOrderedDataStore("leaderboard", "weekly" + weekScope);
		const monthlyLeaderboardDatastore = DataStoreService.GetOrderedDataStore("leaderboard", "monthly" + monthScope);
		const allTimeLeaderboardDatastore = DataStoreService.GetOrderedDataStore("leaderboard", "alltime"); // note this never changes; I could make this a variable with higher scope

		scoreProvider.getScore(playerId).andThen((score) => {
			// note this is quite a few calls; we could feasibly contain the scores under a single table
			print(
				"[LeaderboardService - updateLeaderboard]: Retrieved score for player from provider " +
					playerId +
					": " +
					score,
			);
			dailyLeaderboardDatastore.SetAsync(tostring(playerId), score);
			weeklyLeaderboardDatastore.SetAsync(tostring(playerId), score);
			monthlyLeaderboardDatastore.SetAsync(tostring(playerId), score);
			allTimeLeaderboardDatastore.SetAsync(tostring(playerId), score);
		});
	}
}

const leaderboardService = new LeaderboardService();
export default leaderboardService;
