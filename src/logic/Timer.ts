import { Time } from '../common/Time';
import { timestamp } from '../common/helper';
import { Closable } from '../common/Closable';

export type TimeoutCallback = () => Time | undefined;

export type TimerSettings = {
    time: Time
    timeoutTolerance?: Time
    timeoutCallback?: TimeoutCallback
}

/**
 * Timer.
 */
export class Timer implements Closable {
    private static readonly DEFAULT_TIMEOUT_TOLERANCE = Time.zero();

    /**
     * Time settings.
     * @private
     */
    private readonly _timeSettings: TimerSettings;

    /**
     * Time.
     * @private
     */
    private _time: Time;

    private _intervalId?: NodeJS.Timer;

    private _timeoutId?: NodeJS.Timeout;

    private _lastTimeStamp?: number;

    /**
     * Creates a timer.
     * @param timerSettings
     */
    public constructor(timerSettings: TimerSettings) {
        this._timeSettings = timerSettings;
        this._time = timerSettings.time.clone();
    }

    /**
     * Returns the time of this timer.
     */
    public get time(): Time {
        return this._time;
    }

    /**
     * Sets a time for this timer (will cover the current time). Note that this method will
     * automatically pause (or say, stop) before setting.
     * @param time
     */
    public setTime(time: Time): void {
        this.pause();
        this._time = time.clone();
    }

    /**
     * Starts or resumes this timer.
     */
    public resume(): void {
        this.pause();

        const interval: number = Time.SECOND / 4;

        this._intervalId = setInterval(() => {
            this._time.consume(interval);
            this._lastTimeStamp = timestamp();
        }, interval);

        const tolerance: Time = this._timeSettings.timeoutTolerance || Timer.DEFAULT_TIMEOUT_TOLERANCE;
        this._timeoutId = setTimeout(() => {
            // clear interval and timeout
            this._lastTimeStamp = undefined;
            this.pause();

            // invoke timeout callback function
            const timeoutCallback = this._timeSettings.timeoutCallback;
            if (timeoutCallback) {
                const newTime: Time | undefined = timeoutCallback();
                if (newTime !== undefined) {
                    this._time = newTime.clone();
                    this.resume();
                }
            }
        }, this._time.ms + tolerance.ms);
    }

    /**
     * Pauses this timer.
     */
    public pause(): void {
        this._intervalId && clearInterval(this._intervalId);
        this._intervalId = undefined;

        this._timeoutId && clearTimeout(this._timeoutId);
        this._timeoutId = undefined;

        // consumes excessive time
        if (this._lastTimeStamp !== undefined) {
            this._time.consume(timestamp() - this._lastTimeStamp);
        }
    }

    /**
     * Whether is timer is running.
     * @return true if the timer is running; false otherwise.
     */
    public isRunning(): boolean {
        return this._intervalId !== undefined;
    }

    /**
     * Closes this timer.
     * @override
     */
    public close(): void {
        this._lastTimeStamp = undefined;
        this.pause();
    }
}