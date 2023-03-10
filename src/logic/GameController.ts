import { Game } from './Game';
import { GoGame } from './game/go/GoGame';

export type GameClass = new () => Game<any, any>;

/**
 * Game Controller.
 */
export class GameController {
    private static readonly _INSTANCE = new GameController();

    private _game?: Game<any, any>;

    private constructor() {
        this.bootGame(GoGame);
    }

    /**
     * Returns the instance.
     */
    public static get INSTANCE(): GameController {
        return GameController._INSTANCE;
    }

    /**
     * Boots a game.
     * @param gameClass
     */
    public bootGame(gameClass: GameClass): void {
        this._game = new gameClass();
    }

    /**
     * Closes the current game.
     */
    public closeGame(): void {
        this._game?.close();
        this._game = undefined;
    }

    /**
     * Whether the game has booted.
     */
    public isGameBooted(): boolean {
        return this._game !== undefined;
    }

    /**
     * Whether the game has started.
     */
    public isGameStarted(): boolean {
        return this._game?.hasStarted ||  false;
    }

    /**
     * Returns the current game.
     */
    public getGame<G extends Game<any, any>>(): G {
        if (this._game === undefined) {
            throw new Error('The game has not been booted!');
        }

        return this._game as G;
    }
}