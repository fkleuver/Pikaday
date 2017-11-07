import { Pikaday } from "./pikaday";
/**
 * defaults and localisation
 */
export interface PikadayOptions {
    /**
     * bind the picker to a form field
     */
    field: HTMLInputElement;
    /**
     * automatically show/hide the picker on `field` focus (default `true` if `field` is set)
     */
    bound?: boolean;
    /**
     * data-attribute on the input field with an aria assistance tekst (only applied when `bound` is set)
     */
    ariaLabel?: string;
    /**
     * position of the datepicker, relative to the field (default to bottom & left)
     * ('bottom' & 'left' keywords are not used, 'top' & 'right' are modifier on the bottom/left position)
     */
    position?: string;
    /**
     * automatically fit in the viewport even if it means repositioning from the position option
     */
    reposition?: boolean;
    /**
     * the default output format for `.toString()` and `field` value
     */
    format?: string;
    /**
     * the toString function which gets passed a current date object and format
     * and returns a string
     */
    toString?: (date: Date, format: string) => string;
    /**
     * used to create date object from current input string
     */
    parse?: (value: string, format: string) => Date;
    /**
     * the initial date to view when first opened
     */
    defaultDate?: Date;
    /**
     * make the `defaultDate` the initial selected value
     */
    setDefaultDate?: boolean;
    /**
     * first day of week (0: Sunday, 1: Monday etc)
     */
    firstDay?: number;
    /**
     * the default flag for moment's strict date parsing
     */
    formatStrict?: boolean;
    /**
     * the minimum/earliest date that can be selected
     */
    minDate?: Date | boolean;
    /**
     * the maximum/latest date that can be selected
     */
    maxDate?: Date | boolean;
    /**
     * number of years either side, or array of upper/lower range
     */
    yearRange?: number | number[];
    /**
     * show week numbers at head of row
     */
    showWeekNumber?: boolean;
    /**
     * Week picker mode
     */
    pickWholeWeek?: boolean;
    /**
     * used internally (don't config outside)
     */
    minYear?: number;
    maxYear?: number;
    minMonth?: number;
    maxMonth?: number;
    startRange?: Date;
    endRange?: Date;
    isRTL?: boolean;
    /**
     * Additional text to append to the year in the calendar title
     */
    yearSuffix?: string;
    /**
     * Render the month after year in the calendar title
     */
    showMonthAfterYear?: boolean;
    /**
     * Render days of the calendar grid that fall in the next or previous month
     */
    showDaysInNextAndPreviousMonths?: boolean;
    /**
     * Allows user to select days that fall in the next or previous month
     */
    enableSelectionDaysInNextAndPreviousMonths?: boolean;
    /**
     * how many months are visible
     */
    numberOfMonths?: number;
    /**
     * when numberOfMonths is used, this will help you to choose where the main calendar will be
     * only used for the first display or when a selected date is not visible
     * (default `left`, can be set to `right`)
     */
    mainCalendar?: string;
    /**
     * specify a DOM element to render the calendar in
     */
    container?: HTMLElement;
    /**
     * Blur field when date is selected
     */
    blurFieldOnSelect?: boolean;
    /**
     * internationalization
     */
    i18n?: {
        previousMonth: string;
        nextMonth: string;
        months: [string, string, string, string, string, string, string, string, string, string, string, string];
        weekdays: [string, string, string, string, string, string, string];
        weekdaysShort: [string, string, string, string, string, string, string];
    };
    /**
     * Theme Classname
     */
    theme?: string;
    /**
     * events array
     */
    events?: {}[];
    /**
     * callback function
     */
    onSelect?: (picker: Pikaday, date: Date) => void;
    onOpen?: (picker: Pikaday) => void;
    onClose?: (picker: Pikaday) => void;
    onDraw?: (picker: Pikaday) => void;
    /**
     * Enable keyboard input
     */
    keyboardInput?: boolean;
    disableWeekends?: boolean;
    disableDayFn?: (day: number) => void;
    trigger?: HTMLElement;
}
/**
 * defaults and localisation
 */
export interface PikadayOptionsConfigured extends PikadayOptions {
    bound: boolean;
    ariaLabel: string;
    position: string;
    reposition: boolean;
    format: string;
    defaultDate: Date;
    setDefaultDate: boolean;
    firstDay: number;
    formatStrict: boolean;
    minDate: Date | boolean;
    maxDate: Date | boolean;
    yearRange: number | number[];
    showWeekNumber: boolean;
    pickWholeWeek: boolean;
    minYear: number;
    maxYear: number;
    minMonth: number;
    maxMonth: number;
    startRange: Date;
    endRange: Date;
    isRTL: boolean;
    yearSuffix: string;
    showMonthAfterYear: boolean;
    showDaysInNextAndPreviousMonths: boolean;
    enableSelectionDaysInNextAndPreviousMonths: boolean;
    numberOfMonths: number;
    mainCalendar: string;
    blurFieldOnSelect: boolean;
    i18n: {
        previousMonth: string;
        nextMonth: string;
        months: [string, string, string, string, string, string, string, string, string, string, string, string];
        weekdays: [string, string, string, string, string, string, string];
        weekdaysShort: [string, string, string, string, string, string, string];
    };
    events: {}[];
    keyboardInput: boolean;
    trigger: HTMLElement;
}
export declare const defaultOptions: PikadayOptions;
