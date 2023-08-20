export interface ScoreProvider {
	getScore(playerId: number): Promise<number>;
}
