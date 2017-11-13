import { PikadayOptions, PikadayOptionsConfigured, defaultOptions } from "./options";

/**
 * feature detection and helper functions
 */
declare var moment: any;
const hasEventListeners: boolean = !!window.addEventListener;
const document: Document = window.document;
const sto: (handler: (...args: any[]) => void, timeout: number) => number = window.setTimeout;

function addEvent(
    el: HTMLElement | Document,
    e: any,
    callback: EventListenerOrEventListenerObject,
    capture?: boolean): void {

    if (hasEventListeners) {
        el.addEventListener(e, callback, !!capture);
    } else {
        (el as any).attachEvent("on" + e, callback);
    }
}
function removeEvent(
    el: HTMLElement | Document,
    e: any,
    callback: EventListenerOrEventListenerObject,
    capture?: boolean): void {

    if (hasEventListeners) {
        el.removeEventListener(e, callback, !!capture);
    } else {
        (el as any).detachEvent("on" + e, callback);
    }
}
function trim(str: string): string {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
}
function hasClass(el: HTMLElement, cn: string): boolean {
    return (" " + el.className + " ").indexOf(" " + cn + " ") !== -1;
}
function addClass(el: HTMLElement, cn: string): void {
    if (!hasClass(el, cn)) {
        el.className = el.className === "" ? cn : el.className + " " + cn;
    }
}
function removeClass(el: HTMLElement, cn: string): void {
    el.className = trim((" " + el.className + " ").replace(" " + cn + " ", " "));
}
function isArray(obj: any): boolean {
    return /Array/.test(Object.prototype.toString.call(obj));
}
function isDate(obj: any): boolean {
    return /Date/.test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
}
function isWeekend(date: Date): boolean {
    const day: number = date.getDay();
    return day === 0 || day === 6;
}
function isLeapYear(year: number): boolean {
    // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
function getDaysInMonth(year: number, month: number): number {
    return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}
function setToStartOfDay(date: Date): void {
    if (isDate(date)) {
        date.setHours(0, 0, 0, 0);
    }
}
function compareDates(a: Date, b: Date): boolean {
    // weak date comparison (use setToStartOfDay(date) to ensure correct result)
    return a.getTime() === b.getTime();
}
function extend(to: any, from: any, overwrite?: boolean): any {
    if (!from) {
        return to;
    }
    for (const prop of Object.keys(from)) {
        const hasProp: boolean = to[prop] !== undefined;
        if (hasProp && typeof from[prop] === "object" && from[prop] !== null && from[prop].nodeName === undefined) {
            if (isDate(from[prop])) {
                if (overwrite) {
                    to[prop] = new Date(from[prop].getTime());
                }
            } else if (isArray(from[prop])) {
                if (overwrite) {
                    to[prop] = from[prop].slice(0);
                }
            } else {
                to[prop] = extend({}, from[prop], overwrite);
            }
        } else if (overwrite || !hasProp) {
            to[prop] = from[prop];
        }
    }
    return to;
}
function fireEvent(el: HTMLElement, eventName: string, data: any): void {
    let ev: Event;
    if (document.createEvent) {
        ev = document.createEvent("HTMLEvents");
        ev.initEvent(eventName, true, false);
        ev = extend(ev, data);
        el.dispatchEvent(ev);
    } else if ((document as any).createEventObject) {
        ev = (document as any).createEventObject();
        ev = extend(ev, data);
        (el as any).fireEvent("on" + eventName, ev);
    }
}
function adjustCalendar(calendar: { month: number; year: number }): { month: number; year: number } {
    if (calendar.month < 0) {
        calendar.year -= Math.ceil(Math.abs(calendar.month) / 12);
        calendar.month += 12;
    }
    if (calendar.month > 11) {
        calendar.year += Math.floor(Math.abs(calendar.month) / 12);
        calendar.month -= 12;
    }
    return calendar;
}

/**
 * templating functions to abstract HTML rendering
 */
function renderDayName(opts: PikadayOptionsConfigured, day: number, abbr?: boolean): string {
    day += opts.firstDay;
    while (day >= 7) {
        day -= 7;
    }
    return abbr ? opts.i18n.weekdaysShort[day] : opts.i18n.weekdays[day];
}
function renderDay(opts: any): string {
    const arr: string[] = [];
    let ariaSelected: string = `false`;
    if (opts.isEmpty) {
        if (opts.showDaysInNextAndPreviousMonths) {
            arr.push(`is-outside-current-month`);

            if (!opts.enableSelectionDaysInNextAndPreviousMonths) {
                arr.push(`is-selection-disabled`);
            }
        } else {
            return `<td class="is-empty"></td>`;
        }
    }
    if (opts.isDisabled) {
        arr.push(`is-disabled`);
    }
    if (opts.isToday) {
        arr.push(`is-today`);
    }
    if (opts.isSelected) {
        arr.push(`is-selected`);
        ariaSelected = `true`;
    }
    if (opts.hasEvent) {
        arr.push(`has-event`);
    }
    if (opts.isInRange) {
        arr.push(`is-inrange`);
    }
    if (opts.isStartRange) {
        arr.push(`is-startrange`);
    }
    if (opts.isEndRange) {
        arr.push(`is-endrange`);
    }
    return `<td data-day="${opts.day}" class="${arr.join(" ")}" aria-selected="${ariaSelected}">
      <button class="pika-button pika-day" type="button"
        data-pika-year="${opts.year}"
        data-pika-month="${opts.month}"
        data-pika-day="${opts.day}">
        ${opts.day}
      </button>
    </td>`;
}
function renderWeek(d: number, m: number, y: number): string {
    // lifted from http://javascript.about.com/library/blweekyear.htm, lightly modified.
    const onejan: any = new Date(y, 0, 1);
    const weekNum: number = Math.ceil((((new Date(y, m, d) as any) - onejan) / 86400000 + onejan.getDay() + 1) / 7);
    return `<td class="pika-week">${weekNum}</td>`;
}
function renderRow(days: string[], isRTL: boolean, pickWholeWeek: boolean, isRowSelected: boolean): string {
    return `<tr class="pika-row${pickWholeWeek ? " pick-whole-week" : ""}${isRowSelected ? " is-selected" : ""}">
      ${(isRTL ? days.reverse() : days).join("")}
    </tr>`;
}
function renderBody(rows: string[]): string {
    return `<tbody>
      ${rows.join("")}
    </tbody>`;
}
function renderHead(opts: PikadayOptionsConfigured): string {
    const arr: string[] = [];
    if (opts.showWeekNumber) {
        arr.push(`<th></th>`);
    }
    for (let i: number = 0; i < 7; i++) {
        arr.push(`<th scope="col"><abbr title="${renderDayName(opts, i)}">${renderDayName(opts, i, true)}</abbr></th>`);
    }
    return `<thead>
      <tr>${(opts.isRTL ? arr.reverse() : arr).join("")}</tr>
    </thead>`;
}
function renderTitle(
    opts: PikadayOptionsConfigured, c: number, year: number, month: number, refYear: number, randId: string): string {

    let i: number;
    let j: number;
    let arr: string[];
    const isMinYear: boolean = year === opts.minYear;
    const isMaxYear: boolean = year === opts.maxYear;
    let html: string = "";
    let monthHtml: string;
    let yearHtml: string;
    let prev: boolean = true;
    let next: boolean = true;

    arr = [];
    for (i = 0; i < 12; i++) {
        arr.push(`<option
          value="${year === refYear ? i - c : 12 + i - c}"
          ${i === month ? " selected=\"selected\"" : ""}
          ${(isMinYear && i < opts.minMonth) || (isMaxYear && i > opts.maxMonth) ? " disabled=\"disabled\"" : ""}>
          ${opts.i18n.months[i]}
        </option>`);
    }

    monthHtml = `<div class="pika-label">
      ${opts.i18n.months[month]}
      <select class="pika-select pika-select-month" tabindex="-1">
        ${arr.join("")}
      </select>
    </div>`;

    if (isArray(opts.yearRange)) {
        i = (opts.yearRange as number[])[0];
        j = (opts.yearRange as number[])[1] + 1;
    } else {
        i = year - (opts.yearRange as number);
        j = 1 + year + (opts.yearRange as number);
    }

    arr = [];
    for (; i < j && i <= opts.maxYear; i++) {
        if (i >= opts.minYear) {
            arr.push(`<option value="${i}"${i === year ? " selected=\"selected\"" : ""}>
              ${i}
            </option>`);
        }
    }
    yearHtml = `<div class="pika-label">
      ${year}${opts.yearSuffix}
      <select class="pika-select pika-select-year" tabindex="-1">
        ${arr.join("")}
      </select>
    </div>`;

    if (opts.showMonthAfterYear) {
        html += yearHtml + monthHtml;
    } else {
        html += monthHtml + yearHtml;
    }

    if (isMinYear && (month === 0 || opts.minMonth >= month)) {
        prev = false;
    }

    if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
        next = false;
    }

    if (c === 0) {
        html += `<button class="pika-prev${prev ? "" : " is-disabled"}" type="button">
          ${opts.i18n.previousMonth}
        </button>`;
    }
    if (c === opts.numberOfMonths - 1) {
        html += `<button class="pika-next${next ? "" : " is-disabled"}" type="button">
          ${opts.i18n.nextMonth}
        </button>`;
    }

    return `<div id="${randId}" class="pika-title" role="heading" aria-live="assertive">
      ${html}
    </div>`;
}
function renderTable(opts: PikadayOptionsConfigured, data: string[], randId: string): string {
    return `<table cellpadding="0" cellspacing="0" class="pika-table" role="grid" aria-labelledby="${randId}">
      ${renderHead(opts)}
      ${renderBody(data)}
    </table>`;
}

/**
 * Pikaday constructor
 */
export class Pikaday {
    public pickerWrapper: HTMLDivElement;
    public calendars: { month: number; year: number }[];
    public opts: PikadayOptionsConfigured;

    private moment: any;
    private currentDate: Date;
    private isSelectOpen: boolean;
    private isPickerOpen: boolean;

    constructor(options: PikadayOptions) {
        this.moment = typeof moment === "function" ? moment : null;
        const opts: PikadayOptionsConfigured = (this.opts = this.config(options));
        this.pickerWrapper = document.createElement("div");
        this.pickerWrapper.className = `pika-single${opts.isRTL ? " is-rtl" : ""}${opts.theme ? " " + opts.theme : ""}`;

        addEvent(this.pickerWrapper, "mousedown", this.onMouseDown, true);
        addEvent(this.pickerWrapper, "touchend", this.onMouseDown, true);
        addEvent(this.pickerWrapper, "change", this.onChange);

        if (opts.keyboardInput) {
            addEvent(document, "keydown", this.onKeyChange);
        }

        if (opts.field) {
            if (opts.container) {
                opts.container.appendChild(this.pickerWrapper);
            } else if (opts.bound) {
                document.body.appendChild(this.pickerWrapper);
            } else {
                if (!opts.field.parentNode) {
                    throw Error("field.parentNode is undefined!");
                }
                opts.field.parentNode.insertBefore(this.pickerWrapper, opts.field.nextSibling);
            }
            addEvent(opts.field, "change", this.onInputChange);

            if (!opts.defaultDate) {
                opts.defaultDate = this.moment && opts.field.value
                    ? this.moment(opts.field.value, opts.format).toDate()
                    : new Date(Date.parse(opts.field.value));
                opts.setDefaultDate = true;
            }
        }

        const defDate: Date = opts.defaultDate;

        if (isDate(defDate)) {
            if (this.opts.setDefaultDate) {
                this.setDate(defDate, true);
            } else {
                this.gotoDate(defDate);
            }
        } else {
            this.gotoDate(new Date());
        }

        if (opts.bound) {
            this.hide();
            this.pickerWrapper.className += " is-bound";
            addEvent(opts.field, "click", this.onInputClick);
            addEvent(opts.field, "focus", this.onInputFocus);
            addEvent(opts.field, "blur", this.onInputBlur);
        } else {
            this.show();
        }
    }

    private onMouseDown: (e: MouseEvent) => void | boolean = (e: MouseEvent) => {
        if (!this.isPickerOpen) {
            return;
        }
        e = (e || window.event) as MouseEvent;
        const target: HTMLElement = (e.target as HTMLElement) || e.srcElement;
        if (!target) {
            return;
        }

        if (!hasClass(target, "is-disabled")) {
            if (hasClass(target, "pika-button") &&
                !hasClass(target, "is-empty") &&
                !hasClass(target.parentNode as HTMLElement, "is-disabled")) {
                this.setDate(
                    new Date(
                        target.getAttribute("data-pika-year") as any,
                        target.getAttribute("data-pika-month") as any,
                        target.getAttribute("data-pika-day") as any)
                );
                if (this.opts.bound) {
                    sto(() => {
                        this.hide();
                        if (this.opts.blurFieldOnSelect && this.opts.field) {
                            this.opts.field.blur();
                        }
                    }, 100);
                }
            } else if (hasClass(target, "pika-prev")) {
                this.prevMonth();
            } else if (hasClass(target, "pika-next")) {
                this.nextMonth();
            }
        }
        if (!hasClass(target, "pika-select")) {
            // if this is touch event prevent mouse events emulation
            if (e.preventDefault) {
                e.preventDefault();
                return;
            } else {
                e.returnValue = false;
                return false;
            }
        } else {
            this.isSelectOpen = true;
            return;
        }
    }

    private onChange: (e: Event) => void = (e: Event) => {
        e = e || window.event;
        const target: HTMLInputElement = (e.target || e.srcElement) as HTMLInputElement;
        if (!target) {
            return;
        }
        if (hasClass(target, "pika-select-month")) {
            this.gotoMonth(target.value);
        } else if (hasClass(target, "pika-select-year")) {
            this.gotoYear(target.value);
        }
    }

    private onKeyChange: (e: KeyboardEvent) => void = (e: KeyboardEvent) => {
        e = e || window.event;
        if (this.isVisible()) {
            switch (e.keyCode) {
                case 13:
                case 27:
                    if (this.opts.field) {
                        this.opts.field.blur();
                    }
                    break;
                case 37:
                    e.preventDefault();
                    this.adjustDate("subtract", 1);
                    break;
                case 38:
                    this.adjustDate("subtract", 7);
                    break;
                case 39:
                    this.adjustDate("add", 1);
                    break;
                case 40:
                    this.adjustDate("add", 7);
                    break;
            }
        }
    }

    private onInputChange: (e: Event) => void = (e: Event) => {
        let date: any;

        if ((e as any).firedBy === this) {
            return;
        }
        if (this.opts.parse) {
            date = this.opts.parse(this.opts.field.value, this.opts.format);
        } else if (this.moment) {
            date = this.moment(
                this.opts.field.value,
                this.opts.format,
                this.opts.formatStrict);
            date = date && date.isValid() ? date.toDate() : null;
        } else {
            date = new Date(Date.parse(this.opts.field.value));
        }
        if (isDate(date)) {
            this.setDate(date);
        }
        if (!this.isPickerOpen) {
            this.show();
        }
    }

    private onInputFocus: () => void = () => {
        this.show();
    }

    private onInputClick: () => void = () => {
        this.show();
    }

    private onInputBlur: () => void = () => {
        // ie allows pika div to gain focus; catch blur the input field
        let pEl: HTMLElement = document.activeElement as HTMLElement;
        do {
            if (hasClass(pEl, "pika-single")) {
                return;
            }
            pEl = pEl.parentNode as HTMLElement;
        } while (pEl);

        if (!this.isSelectOpen) {
            sto(() => {
                this.hide();
            }, 50);
        }
        this.isSelectOpen = false;
    }

    private onClick = (e: MouseEvent) => {
        e = e || window.event;
        const target: HTMLElement = (e.target as HTMLElement) || e.srcElement;
        let pEl: HTMLElement = target;
        if (!target) {
            return;
        }
        if (!hasEventListeners && hasClass(target, "pika-select")) {
            if (!target.onchange) {
                target.setAttribute("onchange", "return;");
                addEvent(target, "change", this.onChange);
            }
        }
        do {
            if (hasClass(pEl, "pika-single") || pEl === this.opts.field) {
                return;
            }
            pEl = pEl.parentNode as HTMLElement;
        } while (pEl);
        if (this.isPickerOpen && target !== this.opts.field && pEl !== this.opts.field) {
            this.hide();
        }
    }

    /**
     * configure functionality
     */
    public config(options: PikadayOptions): PikadayOptionsConfigured {
        if (!this.opts) {
            this.opts = extend({}, defaultOptions, true);
        }

        const opts: PikadayOptionsConfigured = extend(this.opts, options, true);

        opts.isRTL = !!opts.isRTL;

        opts.field = opts.field && opts.field.nodeName ? opts.field : null as any;

        opts.theme = typeof opts.theme === "string" && opts.theme ? opts.theme : null as any;

        opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);

        opts.trigger = opts.trigger && opts.trigger.nodeName ? opts.trigger : opts.field;

        opts.disableWeekends = !!opts.disableWeekends;

        opts.disableDayFn = typeof opts.disableDayFn === "function" ? opts.disableDayFn : null as any;

        const nom: number = parseInt(opts.numberOfMonths as any, 10) || 1;
        opts.numberOfMonths = nom > 4 ? 4 : nom;

        if (!isDate(opts.minDate)) {
            opts.minDate = false;
        }
        if (!isDate(opts.maxDate)) {
            opts.maxDate = false;
        }
        if (opts.minDate && opts.maxDate && opts.maxDate < opts.minDate) {
            opts.maxDate = opts.minDate = false;
        }
        if (opts.minDate) {
            this.setMinDate(opts.minDate);
        }
        if (opts.maxDate) {
            this.setMaxDate(opts.maxDate);
        }

        if (isArray(opts.yearRange)) {
            const fallback: number = new Date().getFullYear() - 10;
            (opts.yearRange as number[])[0] = parseInt((opts.yearRange as number[])[0] as any, 10) || fallback;
            (opts.yearRange as number[])[1] = parseInt((opts.yearRange as number[])[1] as any, 10) || fallback;
        } else {
            opts.yearRange = Math.abs(parseInt(opts.yearRange as any, 10)) || defaultOptions.yearRange as number;
            if (opts.yearRange > 100) {
                opts.yearRange = 100;
            }
        }

        return opts;
    }

    /**
     * return a formatted string of the current selection (using Moment.js if available)
     */
    public toString(format?: string): string {
        format = format || this.opts.format;
        if (!isDate(this.currentDate)) {
            return "";
        }
        if (this.opts.toString) {
            return this.opts.toString(this.currentDate, format);
        }
        if (this.moment) {
            return this.moment(this.currentDate).format(format);
        }
        return this.currentDate.toDateString();
    }

    /**
     * return a Moment.js object of the current selection (if available)
     */
    public getMoment(): any | null {
        return this.moment ? this.moment(this.currentDate) : null;
    }

    /**
     * set the current selection from a Moment.js object (if available)
     */
    public setMoment(date: any, preventOnSelect: boolean): void {
        if (this.moment && this.moment.isMoment(date)) {
            this.setDate(date.toDate(), preventOnSelect);
        }
    }

    /**
     * return a Date object of the current selection
     */
    public getDate(): Date | null {
        return isDate(this.currentDate) ? new Date(this.currentDate.getTime()) : null;
    }

    /**
     * set the current selection
     */
    public setDate(date: Date | undefined, preventOnSelect?: boolean): void {
        if (!date) {
            this.currentDate = null as any;

            if (this.opts.field) {
                this.opts.field.value = "";
                fireEvent(this.opts.field, "change", { firedBy: this });
            }

            return this.draw();
        }
        if (typeof date === "string") {
            date = new Date(Date.parse(date));
        }
        if (!isDate(date)) {
            return;
        }

        const min: Date | boolean = this.opts.minDate;
        const max: Date | boolean = this.opts.maxDate;

        if (isDate(min) && date < min) {
            date = min as Date;
        } else if (isDate(max) && date > max) {
            date = max as Date;
        }

        this.currentDate = new Date(date.getTime());
        setToStartOfDay(this.currentDate);
        this.gotoDate(this.currentDate);

        if (this.opts.field) {
            this.opts.field.value = this.toString();
            fireEvent(this.opts.field, "change", { firedBy: this });
        }
        if (!preventOnSelect && typeof this.opts.onSelect === "function") {
            this.opts.onSelect.call(this, this.getDate());
        }
    }

    /**
     * change view to a specific date
     */
    public gotoDate(date: Date): void {
        let newCalendar: boolean = true;

        if (!isDate(date)) {
            return;
        }

        if (this.calendars) {
            const firstVisibleDate: Date = new Date(
                this.calendars[0].year, this.calendars[0].month, 1);
            const lastVisibleDate: Date = new Date(
                this.calendars[this.calendars.length - 1].year,
                this.calendars[this.calendars.length - 1].month, 1);
            const visibleDate: number = date.getTime();
            // get the end of the month
            lastVisibleDate.setMonth(lastVisibleDate.getMonth() + 1);
            lastVisibleDate.setDate(lastVisibleDate.getDate() - 1);
            newCalendar = visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate;
        }

        if (newCalendar) {
            this.calendars = [
                {
                    month: date.getMonth(),
                    year: date.getFullYear()
                }
            ];
            if (this.opts.mainCalendar === "right") {
                this.calendars[0].month += 1 - this.opts.numberOfMonths;
            }
        }

        this.adjustCalendars();
    }

    public adjustDate(sign: "add" | "subtract", days: string | number): void {
        const day: Date = this.getDate() || new Date();
        const difference: number = parseInt(days as string, 10) * 24 * 60 * 60 * 1000;

        let newDay: Date | undefined;

        if (sign === "add") {
            newDay = new Date(day.valueOf() + difference);
        } else if (sign === "subtract") {
            newDay = new Date(day.valueOf() - difference);
        }

        this.setDate(newDay);
    }

    public adjustCalendars(): void {
        this.calendars[0] = adjustCalendar(this.calendars[0]);
        for (let c: number = 1; c < this.opts.numberOfMonths; c++) {
            this.calendars[c] = adjustCalendar({
                month: this.calendars[0].month + c,
                year: this.calendars[0].year
            });
        }
        this.draw();
    }

    public gotoToday(): void {
        this.gotoDate(new Date());
    }

    /**
     * change view to a specific month (zero-index, e.g. 0: January)
     */
    public gotoMonth(month: string | number): void {
        if (!isNaN(month as number)) {
            this.calendars[0].month = parseInt(month as string, 10);
            this.adjustCalendars();
        }
    }

    public nextMonth(): void {
        this.calendars[0].month++;
        this.adjustCalendars();
    }

    public prevMonth(): void {
        this.calendars[0].month--;
        this.adjustCalendars();
    }

    /**
     * change view to a specific full year (e.g. "2012")
     */
    public gotoYear(year: string | number): void {
        if (!isNaN(year as number)) {
            this.calendars[0].year = parseInt(year as string, 10);
            this.adjustCalendars();
        }
    }

    /**
     * change the minDate
     */
    public setMinDate(value: Date | boolean): void {
        if (value instanceof Date) {
            setToStartOfDay(value);
            this.opts.minDate = value;
            this.opts.minYear = value.getFullYear();
            this.opts.minMonth = value.getMonth();
        } else {
            this.opts.minDate = defaultOptions.minDate as Date | boolean;
            this.opts.minYear = defaultOptions.minYear as number;
            this.opts.minMonth = defaultOptions.minMonth as number;
            this.opts.startRange = defaultOptions.startRange as Date;
        }

        this.draw();
    }

    /**
     * change the maxDate
     */
    public setMaxDate(value: Date | boolean): void {
        if (value instanceof Date) {
            setToStartOfDay(value);
            this.opts.maxDate = value;
            this.opts.maxYear = value.getFullYear();
            this.opts.maxMonth = value.getMonth();
        } else {
            this.opts.maxDate = defaultOptions.maxDate as Date | boolean;
            this.opts.maxYear = defaultOptions.maxYear as number;
            this.opts.maxMonth = defaultOptions.maxMonth as number;
            this.opts.endRange = defaultOptions.endRange as Date;
        }

        this.draw();
    }

    public setStartRange(value: Date): void {
        this.opts.startRange = value;
    }

    public setEndRange(value: Date): void {
        this.opts.endRange = value;
    }

    /**
     * refresh the HTML
     */
    public draw(force?: boolean): void {
        if (!this.isPickerOpen && !force) {
            return;
        }
        const opts: any = this.opts;
        const randId: string =
            "pika-title-" +
            Math.random()
                .toString(36)
                .replace(/[^a-z]+/g, "")
                .substr(0, 2);

        let html: string = "";

        for (let c: number = 0; c < opts.numberOfMonths; c++) {
            const year: number = this.calendars[c].year;
            const month: number = this.calendars[c].month;
            const refYear: number = this.calendars[0].year;

            html += `<div class="pika-lendar">
              ${renderTitle(this.opts, c, year, month, refYear, randId)}
              ${this.render(year, month, randId)}
            </div>`;
        }

        this.pickerWrapper.innerHTML = html;

        if (opts.bound) {
            if (opts.field.type !== "hidden") {
                sto(() => {
                    opts.trigger.focus();
                }, 1);
            }
        }

        if (typeof this.opts.onDraw === "function") {
            this.opts.onDraw(this);
        }

        if (opts.bound) {
            // let the screen reader user know to use arrow keys
            opts.field.setAttribute("aria-label", opts.ariaLabel);
        }
    }

    public adjustPosition(): void {
        if (this.opts.container) {
            return;
        }

        this.pickerWrapper.style.position = "absolute";

        const field: HTMLElement = this.opts.trigger;
        let pEl: HTMLElement = field;
        const width: number = this.pickerWrapper.offsetWidth;
        const height: number = this.pickerWrapper.offsetHeight;
        const viewportWidth: number = window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight: number = window.innerHeight || document.documentElement.clientHeight;
        const scrollTop: number = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;

        let left: number;
        let top: number;

        if (typeof field.getBoundingClientRect === "function") {
            const clientRect: ClientRect = field.getBoundingClientRect();
            left = clientRect.left + window.pageXOffset;
            top = clientRect.bottom + window.pageYOffset;
        } else {
            left = pEl.offsetLeft;
            top = pEl.offsetTop + pEl.offsetHeight;
            while (pEl.offsetParent) {
                pEl = pEl.offsetParent as HTMLElement;
                left += pEl.offsetLeft;
                top += pEl.offsetTop;
            }
        }

        // default position is bottom & left
        if ((this.opts.reposition && left + width > viewportWidth) ||
            (this.opts.position.indexOf("right") > -1 && left - width + field.offsetWidth > 0)) {
            left = left - width + field.offsetWidth;
        }
        if ((this.opts.reposition && top + height > viewportHeight + scrollTop) ||
            (this.opts.position.indexOf("top") > -1 && top - height - field.offsetHeight > 0)) {
            top = top - height - field.offsetHeight;
        }

        this.pickerWrapper.style.left = `${left}px`;
        this.pickerWrapper.style.top = `${top}px`;
    }

    /**
     * render HTML for a particular month
     */
    public render(year: number, month: number, randId: string): string {
        const opts: any = this.opts;
        const now: Date = new Date();
        const days: number = getDaysInMonth(year, month);
        let before: number = new Date(year, month, 1).getDay();
        const data: string[] = [];
        let row: string[] = [];

        setToStartOfDay(now);

        if (opts.firstDay > 0) {
            before -= opts.firstDay;
            if (before < 0) {
                before += 7;
            }
        }

        const previousMonth: number = month === 0 ? 11 : month - 1;
        const nextMonth: number = month === 11 ? 0 : month + 1;
        const yearOfPreviousMonth: number = month === 0 ? year - 1 : year;
        const yearOfNextMonth: number = month === 11 ? year + 1 : year;
        const daysInPreviousMonth: number = getDaysInMonth(yearOfPreviousMonth, previousMonth);
        let cells: number = days + before;
        let after: number = cells;

        while (after > 7) {
            after -= 7;
        }
        cells += 7 - after;

        let isWeekSelected: boolean = false;
        for (let i: number = 0, r: number = 0; i < cells; i++) {
            const day: Date = new Date(year, month, 1 + (i - before));
            const isSelected: boolean = isDate(this.currentDate) ? compareDates(day, this.currentDate) : false;
            const isToday: boolean = compareDates(day, now);
            const hasEvent: boolean = opts.events.indexOf(day.toDateString()) !== -1 ? true : false;
            const isEmpty: boolean = i < before || i >= days + before;
            let dayNumber: number = 1 + (i - before);
            let monthNumber: number = month;
            let yearNumber: number = year;
            const isStartRange: boolean = opts.startRange && compareDates(opts.startRange, day);
            const isEndRange: boolean = opts.endRange && compareDates(opts.endRange, day);
            const isInRange: boolean = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange;
            const isDisabled: boolean =
                (opts.minDate && day < opts.minDate) ||
                (opts.maxDate && day > opts.maxDate) ||
                (opts.disableWeekends && isWeekend(day)) ||
                (opts.disableDayFn && opts.disableDayFn(day));

            if (isEmpty) {
                if (i < before) {
                    dayNumber = daysInPreviousMonth + dayNumber;
                    monthNumber = previousMonth;
                    yearNumber = yearOfPreviousMonth;
                } else {
                    dayNumber = dayNumber - days;
                    monthNumber = nextMonth;
                    yearNumber = yearOfNextMonth;
                }
            }

            const dayConfig = {
                day: dayNumber,
                month: monthNumber,
                year: yearNumber,
                hasEvent,
                isSelected,
                isToday,
                isDisabled,
                isEmpty,
                isStartRange,
                isEndRange,
                isInRange,
                showDaysInNextAndPreviousMonths: opts.showDaysInNextAndPreviousMonths,
                enableSelectionDaysInNextAndPreviousMonths: opts.enableSelectionDaysInNextAndPreviousMonths
            };

            if (opts.pickWholeWeek && isSelected) {
                isWeekSelected = true;
            }

            row.push(renderDay(dayConfig));

            if (++r === 7) {
                if (opts.showWeekNumber) {
                    row.unshift(renderWeek(i - before, month, year));
                }
                data.push(renderRow(row, opts.isRTL, opts.pickWholeWeek, isWeekSelected));
                row = [];
                r = 0;
                isWeekSelected = false;
            }
        }
        return renderTable(opts, data, randId);
    }

    public isVisible(): boolean {
        return this.isPickerOpen;
    }

    public show(): void {
        if (!this.isVisible()) {
            this.isPickerOpen = true;
            this.draw();
            removeClass(this.pickerWrapper, "is-hidden");
            if (this.opts.bound) {
                addEvent(document, "click", this.onClick);
                this.adjustPosition();
            }
            if (typeof this.opts.onOpen === "function") {
                this.opts.onOpen.call(this);
            }
        }
    }

    public hide() {
        const v = this.isPickerOpen;
        if (v !== false) {
            if (this.opts.bound) {
                removeEvent(document, "click", this.onClick);
            }
            this.pickerWrapper.style.position = "static"; // reset
            this.pickerWrapper.style.left = "auto";
            this.pickerWrapper.style.top = "auto";
            addClass(this.pickerWrapper, "is-hidden");
            this.isPickerOpen = false;
            if (v !== undefined && typeof this.opts.onClose === "function") {
                this.opts.onClose.call(this);
            }
        }
    }

    /**
     * GAME OVER
     */
    public destroy() {
        const opts = this.opts;

        this.hide();
        removeEvent(this.pickerWrapper, "mousedown", this.onMouseDown, true);
        removeEvent(this.pickerWrapper, "touchend", this.onMouseDown, true);
        removeEvent(this.pickerWrapper, "change", this.onChange);
        if (opts.keyboardInput) {
            removeEvent(document, "keydown", this.onKeyChange);
        }
        if (opts.field) {
            removeEvent(opts.field, "change", this.onInputChange);
            if (opts.bound) {
                removeEvent(opts.trigger, "click", this.onInputClick);
                removeEvent(opts.trigger, "focus", this.onInputFocus);
                removeEvent(opts.trigger, "blur", this.onInputBlur);
            }
        }
        if (this.pickerWrapper.parentNode) {
            this.pickerWrapper.parentNode.removeChild(this.pickerWrapper);
        }
    }
}
