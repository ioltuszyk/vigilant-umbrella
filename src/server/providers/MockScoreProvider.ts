import { ScoreProvider } from "server/interfaces/ScoreProvider";

class MockScoreProvider implements ScoreProvider {
	getScore(playerId: number): Promise<number> {
		return Promise.resolve(math.random(1, 100));
	}
}

const mockScoreProvider = new MockScoreProvider();
export default mockScoreProvider;
