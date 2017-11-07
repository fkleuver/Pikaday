import { PikadayOptions, PikadayOptionsConfigured } from "./options";
/**
 * Pikaday constructor
 */
export declare class Pikaday {
    input: HTMLInputElement;
    pickerWrapper: HTMLDivElement;
    calendars: {
        month: number;
        year: number;
    }[];
    opts: PikadayOptionsConfigured;
    private moment;
    private currentDate;
    private isSelectOpen;
    private isPickerOpen;
    constructor(options: PikadayOptions);
    private onMouseDown;
    private onChange;
    private onKeyChange;
    private onInputChange;
    private onInputFocus;
    private onInputClick;
    private onInputBlur;
    private onClick;
    /**
     * configure functionality
     */
    config(options: PikadayOptions): PikadayOptionsConfigured;
    /**
     * return a formatted string of the current selection (using Moment.js if available)
     */
    toString(format?: string): string;
    /**
     * return a Moment.js object of the current selection (if available)
     */
    getMoment(): any | null;
    /**
     * set the current selection from a Moment.js object (if available)
     */
    setMoment(date: any, preventOnSelect: boolean): void;
    /**
     * return a Date object of the current selection
     */
    getDate(): Date | null;
    /**
     * set the current selection
     */
    setDate(date: Date | undefined, preventOnSelect?: boolean): void;
    /**
     * change view to a specific date
     */
    gotoDate(date: Date): void;
    adjustDate(sign: "add" | "subtract", days: string | number): void;
    adjustCalendars(): void;
    gotoToday(): void;
    /**
     * change view to a specific month (zero-index, e.g. 0: January)
     */
    gotoMonth(month: string | number): void;
    nextMonth(): void;
    prevMonth(): void;
    /**
     * change view to a specific full year (e.g. "2012")
     */
    gotoYear(year: string | number): void;
    /**
     * change the minDate
     */
    setMinDate(value: Date | boolean): void;
    /**
     * change the maxDate
     */
    setMaxDate(value: Date | boolean): void;
    setStartRange(value: Date): void;
    setEndRange(value: Date): void;
    /**
     * refresh the HTML
     */
    draw(force?: boolean): void;
    adjustPosition(): void;
    /**
     * render HTML for a particular month
     */
    render(year: number, month: number, randId: string): string;
    isVisible(): boolean;
    show(): void;
    hide(): void;
    /**
     * GAME OVER
     */
    destroy(): void;
}
