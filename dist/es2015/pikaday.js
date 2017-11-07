import { defaultOptions } from "./options";
const hasEventListeners = !!window.addEventListener;
const document = window.document;
const sto = window.setTimeout;
function addEvent(el, e, callback, capture) {
    if (hasEventListeners) {
        el.addEventListener(e, callback, !!capture);
    }
    else {
        el.attachEvent("on" + e, callback);
    }
}
function removeEvent(el, e, callback, capture) {
    if (hasEventListeners) {
        el.removeEventListener(e, callback, !!capture);
    }
    else {
        el.detachEvent("on" + e, callback);
    }
}
function trim(str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
}
function hasClass(el, cn) {
    return (" " + el.className + " ").indexOf(" " + cn + " ") !== -1;
}
function addClass(el, cn) {
    if (!hasClass(el, cn)) {
        el.className = el.className === "" ? cn : el.className + " " + cn;
    }
}
function removeClass(el, cn) {
    el.className = trim((" " + el.className + " ").replace(" " + cn + " ", " "));
}
function isArray(obj) {
    return /Array/.test(Object.prototype.toString.call(obj));
}
function isDate(obj) {
    return /Date/.test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
}
function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}
function isLeapYear(year) {
    // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
function getDaysInMonth(year, month) {
    return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}
function setToStartOfDay(date) {
    if (isDate(date)) {
        date.setHours(0, 0, 0, 0);
    }
}
function compareDates(a, b) {
    // weak date comparison (use setToStartOfDay(date) to ensure correct result)
    return a.getTime() === b.getTime();
}
function extend(to, from, overwrite) {
    if (!from) {
        return to;
    }
    for (const prop of Object.keys(from)) {
        const hasProp = to[prop] !== undefined;
        if (hasProp && typeof from[prop] === "object" && from[prop] !== null && from[prop].nodeName === undefined) {
            if (isDate(from[prop])) {
                if (overwrite) {
                    to[prop] = new Date(from[prop].getTime());
                }
            }
            else if (isArray(from[prop])) {
                if (overwrite) {
                    to[prop] = from[prop].slice(0);
                }
            }
            else {
                to[prop] = extend({}, from[prop], overwrite);
            }
        }
        else if (overwrite || !hasProp) {
            to[prop] = from[prop];
        }
    }
    return to;
}
function fireEvent(el, eventName, data) {
    let ev;
    if (document.createEvent) {
        ev = document.createEvent("HTMLEvents");
        ev.initEvent(eventName, true, false);
        ev = extend(ev, data);
        el.dispatchEvent(ev);
    }
    else if (document.createEventObject) {
        ev = document.createEventObject();
        ev = extend(ev, data);
        el.fireEvent("on" + eventName, ev);
    }
}
function adjustCalendar(calendar) {
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
function renderDayName(opts, day, abbr) {
    day += opts.firstDay;
    while (day >= 7) {
        day -= 7;
    }
    return abbr ? opts.i18n.weekdaysShort[day] : opts.i18n.weekdays[day];
}
function renderDay(opts) {
    const arr = [];
    let ariaSelected = `false`;
    if (opts.isEmpty) {
        if (opts.showDaysInNextAndPreviousMonths) {
            arr.push(`is-outside-current-month`);
            if (!opts.enableSelectionDaysInNextAndPreviousMonths) {
                arr.push(`is-selection-disabled`);
            }
        }
        else {
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
function renderWeek(d, m, y) {
    // lifted from http://javascript.about.com/library/blweekyear.htm, lightly modified.
    const onejan = new Date(y, 0, 1);
    const weekNum = Math.ceil(((new Date(y, m, d) - onejan) / 86400000 + onejan.getDay() + 1) / 7);
    return `<td class="pika-week">${weekNum}</td>`;
}
function renderRow(days, isRTL, pickWholeWeek, isRowSelected) {
    return `<tr class="pika-row${pickWholeWeek ? " pick-whole-week" : ""}${isRowSelected ? " is-selected" : ""}">
      ${(isRTL ? days.reverse() : days).join("")}
    </tr>`;
}
function renderBody(rows) {
    return `<tbody>
      ${rows.join("")}
    </tbody>`;
}
function renderHead(opts) {
    const arr = [];
    if (opts.showWeekNumber) {
        arr.push(`<th></th>`);
    }
    for (let i = 0; i < 7; i++) {
        arr.push(`<th scope="col"><abbr title="${renderDayName(opts, i)}">${renderDayName(opts, i, true)}</abbr></th>`);
    }
    return `<thead>
      <tr>${(opts.isRTL ? arr.reverse() : arr).join("")}</tr>
    </thead>`;
}
function renderTitle(opts, c, year, month, refYear, randId) {
    let i;
    let j;
    let arr;
    const isMinYear = year === opts.minYear;
    const isMaxYear = year === opts.maxYear;
    let html = "";
    let monthHtml;
    let yearHtml;
    let prev = true;
    let next = true;
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
        i = opts.yearRange[0];
        j = opts.yearRange[1] + 1;
    }
    else {
        i = year - opts.yearRange;
        j = 1 + year + opts.yearRange;
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
    }
    else {
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
function renderTable(opts, data, randId) {
    return `<table cellpadding="0" cellspacing="0" class="pika-table" role="grid" aria-labelledby="${randId}">
      ${renderHead(opts)}
      ${renderBody(data)}
    </table>`;
}
/**
 * Pikaday constructor
 */
export class Pikaday {
    constructor(options) {
        this.onMouseDown = (e) => {
            if (!this.isPickerOpen) {
                return;
            }
            e = (e || window.event);
            const target = e.target || e.srcElement;
            if (!target) {
                return;
            }
            if (!hasClass(target, "is-disabled")) {
                if (hasClass(target, "pika-button") &&
                    !hasClass(target, "is-empty") &&
                    !hasClass(target.parentNode, "is-disabled")) {
                    this.setDate(new Date(target.getAttribute("data-pika-year"), target.getAttribute("data-pika-month"), target.getAttribute("data-pika-day")));
                    if (this.opts.bound) {
                        sto(() => {
                            this.hide();
                            if (this.opts.blurFieldOnSelect && this.input) {
                                this.input.blur();
                            }
                        }, 100);
                    }
                }
                else if (hasClass(target, "pika-prev")) {
                    this.prevMonth();
                }
                else if (hasClass(target, "pika-next")) {
                    this.nextMonth();
                }
            }
            if (!hasClass(target, "pika-select")) {
                // if this is touch event prevent mouse events emulation
                if (e.preventDefault) {
                    e.preventDefault();
                    return;
                }
                else {
                    e.returnValue = false;
                    return false;
                }
            }
            else {
                this.isSelectOpen = true;
                return;
            }
        };
        this.onChange = (e) => {
            e = e || window.event;
            const target = (e.target || e.srcElement);
            if (!target) {
                return;
            }
            if (hasClass(target, "pika-select-month")) {
                this.gotoMonth(target.value);
            }
            else if (hasClass(target, "pika-select-year")) {
                this.gotoYear(target.value);
            }
        };
        this.onKeyChange = (e) => {
            e = e || window.event;
            if (this.isVisible()) {
                switch (e.keyCode) {
                    case 13:
                    case 27:
                        if (this.input) {
                            this.input.blur();
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
        };
        this.onInputChange = (e) => {
            let date;
            if (e.firedBy === this) {
                return;
            }
            if (this.opts.parse) {
                date = this.opts.parse(this.opts.field.value, this.opts.format);
            }
            else if (this.moment) {
                date = this.moment(this.opts.field.value, this.opts.format, this.opts.formatStrict);
                date = date && date.isValid() ? date.toDate() : null;
            }
            else {
                date = new Date(Date.parse(this.opts.field.value));
            }
            if (isDate(date)) {
                this.setDate(date);
            }
            if (!this.isPickerOpen) {
                this.show();
            }
        };
        this.onInputFocus = () => {
            this.show();
        };
        this.onInputClick = () => {
            this.show();
        };
        this.onInputBlur = () => {
            // ie allows pika div to gain focus; catch blur the input field
            let pEl = document.activeElement;
            do {
                if (hasClass(pEl, "pika-single")) {
                    return;
                }
                pEl = pEl.parentNode;
            } while (pEl);
            if (!this.isSelectOpen) {
                sto(() => {
                    this.hide();
                }, 50);
            }
            this.isSelectOpen = false;
        };
        this.onClick = (e) => {
            e = e || window.event;
            const target = e.target || e.srcElement;
            let pEl = target;
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
                if (hasClass(pEl, "pika-single") || pEl === this.input) {
                    return;
                }
                pEl = pEl.parentNode;
            } while (pEl);
            if (this.isPickerOpen && target !== this.input && pEl !== this.input) {
                this.hide();
            }
        };
        this.moment = typeof moment === "function" ? moment : null;
        const opts = (this.opts = this.config(options));
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
            }
            else if (opts.bound) {
                document.body.appendChild(this.pickerWrapper);
            }
            else {
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
        const defDate = opts.defaultDate;
        if (isDate(defDate)) {
            if (this.opts.setDefaultDate) {
                this.setDate(defDate, true);
            }
            else {
                this.gotoDate(defDate);
            }
        }
        else {
            this.gotoDate(new Date());
        }
        if (opts.bound) {
            this.hide();
            this.pickerWrapper.className += " is-bound";
            addEvent(this.input, "click", this.onInputClick);
            addEvent(this.input, "focus", this.onInputFocus);
            addEvent(this.input, "blur", this.onInputBlur);
        }
        else {
            this.show();
        }
    }
    /**
     * configure functionality
     */
    config(options) {
        if (!this.opts) {
            this.opts = extend({}, defaultOptions, true);
        }
        const opts = extend(this.opts, options, true);
        opts.isRTL = !!opts.isRTL;
        opts.field = opts.field && opts.field.nodeName ? opts.field : null;
        opts.theme = typeof opts.theme === "string" && opts.theme ? opts.theme : null;
        opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);
        opts.trigger = opts.trigger && opts.trigger.nodeName ? opts.trigger : opts.field;
        opts.disableWeekends = !!opts.disableWeekends;
        opts.disableDayFn = typeof opts.disableDayFn === "function" ? opts.disableDayFn : null;
        const nom = parseInt(opts.numberOfMonths, 10) || 1;
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
            const fallback = new Date().getFullYear() - 10;
            opts.yearRange[0] = parseInt(opts.yearRange[0], 10) || fallback;
            opts.yearRange[1] = parseInt(opts.yearRange[1], 10) || fallback;
        }
        else {
            opts.yearRange = Math.abs(parseInt(opts.yearRange, 10)) || defaultOptions.yearRange;
            if (opts.yearRange > 100) {
                opts.yearRange = 100;
            }
        }
        return opts;
    }
    /**
     * return a formatted string of the current selection (using Moment.js if available)
     */
    toString(format) {
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
    getMoment() {
        return this.moment ? this.moment(this.currentDate) : null;
    }
    /**
     * set the current selection from a Moment.js object (if available)
     */
    setMoment(date, preventOnSelect) {
        if (this.moment && this.moment.isMoment(date)) {
            this.setDate(date.toDate(), preventOnSelect);
        }
    }
    /**
     * return a Date object of the current selection
     */
    getDate() {
        return isDate(this.currentDate) ? new Date(this.currentDate.getTime()) : null;
    }
    /**
     * set the current selection
     */
    setDate(date, preventOnSelect) {
        if (!date) {
            this.currentDate = null;
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
        const min = this.opts.minDate;
        const max = this.opts.maxDate;
        if (isDate(min) && date < min) {
            date = min;
        }
        else if (isDate(max) && date > max) {
            date = max;
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
    gotoDate(date) {
        let newCalendar = true;
        if (!isDate(date)) {
            return;
        }
        if (this.calendars) {
            const firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1);
            const lastVisibleDate = new Date(this.calendars[this.calendars.length - 1].year, this.calendars[this.calendars.length - 1].month, 1);
            const visibleDate = date.getTime();
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
    adjustDate(sign, days) {
        const day = this.getDate() || new Date();
        const difference = parseInt(days, 10) * 24 * 60 * 60 * 1000;
        let newDay;
        if (sign === "add") {
            newDay = new Date(day.valueOf() + difference);
        }
        else if (sign === "subtract") {
            newDay = new Date(day.valueOf() - difference);
        }
        this.setDate(newDay);
    }
    adjustCalendars() {
        this.calendars[0] = adjustCalendar(this.calendars[0]);
        for (let c = 1; c < this.opts.numberOfMonths; c++) {
            this.calendars[c] = adjustCalendar({
                month: this.calendars[0].month + c,
                year: this.calendars[0].year
            });
        }
        this.draw();
    }
    gotoToday() {
        this.gotoDate(new Date());
    }
    /**
     * change view to a specific month (zero-index, e.g. 0: January)
     */
    gotoMonth(month) {
        if (!isNaN(month)) {
            this.calendars[0].month = parseInt(month, 10);
            this.adjustCalendars();
        }
    }
    nextMonth() {
        this.calendars[0].month++;
        this.adjustCalendars();
    }
    prevMonth() {
        this.calendars[0].month--;
        this.adjustCalendars();
    }
    /**
     * change view to a specific full year (e.g. "2012")
     */
    gotoYear(year) {
        if (!isNaN(year)) {
            this.calendars[0].year = parseInt(year, 10);
            this.adjustCalendars();
        }
    }
    /**
     * change the minDate
     */
    setMinDate(value) {
        if (value instanceof Date) {
            setToStartOfDay(value);
            this.opts.minDate = value;
            this.opts.minYear = value.getFullYear();
            this.opts.minMonth = value.getMonth();
        }
        else {
            this.opts.minDate = defaultOptions.minDate;
            this.opts.minYear = defaultOptions.minYear;
            this.opts.minMonth = defaultOptions.minMonth;
            this.opts.startRange = defaultOptions.startRange;
        }
        this.draw();
    }
    /**
     * change the maxDate
     */
    setMaxDate(value) {
        if (value instanceof Date) {
            setToStartOfDay(value);
            this.opts.maxDate = value;
            this.opts.maxYear = value.getFullYear();
            this.opts.maxMonth = value.getMonth();
        }
        else {
            this.opts.maxDate = defaultOptions.maxDate;
            this.opts.maxYear = defaultOptions.maxYear;
            this.opts.maxMonth = defaultOptions.maxMonth;
            this.opts.endRange = defaultOptions.endRange;
        }
        this.draw();
    }
    setStartRange(value) {
        this.opts.startRange = value;
    }
    setEndRange(value) {
        this.opts.endRange = value;
    }
    /**
     * refresh the HTML
     */
    draw(force) {
        if (!this.isPickerOpen && !force) {
            return;
        }
        const opts = this.opts;
        const randId = "pika-title-" +
            Math.random()
                .toString(36)
                .replace(/[^a-z]+/g, "")
                .substr(0, 2);
        let html = "";
        for (let c = 0; c < opts.numberOfMonths; c++) {
            const year = this.calendars[c].year;
            const month = this.calendars[c].month;
            const refYear = this.calendars[0].year;
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
    adjustPosition() {
        if (this.opts.container) {
            return;
        }
        this.pickerWrapper.style.position = "absolute";
        const field = this.opts.trigger;
        let pEl = field;
        const width = this.pickerWrapper.offsetWidth;
        const height = this.pickerWrapper.offsetHeight;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
        let left;
        let top;
        if (typeof field.getBoundingClientRect === "function") {
            const clientRect = field.getBoundingClientRect();
            left = clientRect.left + window.pageXOffset;
            top = clientRect.bottom + window.pageYOffset;
        }
        else {
            left = pEl.offsetLeft;
            top = pEl.offsetTop + pEl.offsetHeight;
            while (pEl.offsetParent) {
                pEl = pEl.offsetParent;
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
    render(year, month, randId) {
        const opts = this.opts;
        const now = new Date();
        const days = getDaysInMonth(year, month);
        let before = new Date(year, month, 1).getDay();
        const data = [];
        let row = [];
        setToStartOfDay(now);
        if (opts.firstDay > 0) {
            before -= opts.firstDay;
            if (before < 0) {
                before += 7;
            }
        }
        const previousMonth = month === 0 ? 11 : month - 1;
        const nextMonth = month === 11 ? 0 : month + 1;
        const yearOfPreviousMonth = month === 0 ? year - 1 : year;
        const yearOfNextMonth = month === 11 ? year + 1 : year;
        const daysInPreviousMonth = getDaysInMonth(yearOfPreviousMonth, previousMonth);
        let cells = days + before;
        let after = cells;
        while (after > 7) {
            after -= 7;
        }
        cells += 7 - after;
        let isWeekSelected = false;
        for (let i = 0, r = 0; i < cells; i++) {
            const day = new Date(year, month, 1 + (i - before));
            const isSelected = isDate(this.currentDate) ? compareDates(day, this.currentDate) : false;
            const isToday = compareDates(day, now);
            const hasEvent = opts.events.indexOf(day.toDateString()) !== -1 ? true : false;
            const isEmpty = i < before || i >= days + before;
            let dayNumber = 1 + (i - before);
            let monthNumber = month;
            let yearNumber = year;
            const isStartRange = opts.startRange && compareDates(opts.startRange, day);
            const isEndRange = opts.endRange && compareDates(opts.endRange, day);
            const isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange;
            const isDisabled = (opts.minDate && day < opts.minDate) ||
                (opts.maxDate && day > opts.maxDate) ||
                (opts.disableWeekends && isWeekend(day)) ||
                (opts.disableDayFn && opts.disableDayFn(day));
            if (isEmpty) {
                if (i < before) {
                    dayNumber = daysInPreviousMonth + dayNumber;
                    monthNumber = previousMonth;
                    yearNumber = yearOfPreviousMonth;
                }
                else {
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
    isVisible() {
        return this.isPickerOpen;
    }
    show() {
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
    hide() {
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
    destroy() {
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
