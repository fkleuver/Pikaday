System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var defaultOptions;
    return {
        setters: [],
        execute: function () {
            exports_1("defaultOptions", defaultOptions = {
                field: null,
                bound: undefined,
                ariaLabel: "Use the arrow keys to pick a date",
                position: "bottom left",
                reposition: true,
                format: "YYYY-MM-DD",
                toString: null,
                parse: null,
                defaultDate: null,
                setDefaultDate: false,
                firstDay: 0,
                formatStrict: false,
                minDate: null,
                maxDate: null,
                yearRange: 10,
                showWeekNumber: false,
                pickWholeWeek: false,
                minYear: 0,
                maxYear: 9999,
                minMonth: undefined,
                maxMonth: undefined,
                startRange: null,
                endRange: null,
                isRTL: false,
                yearSuffix: "",
                showMonthAfterYear: false,
                showDaysInNextAndPreviousMonths: false,
                enableSelectionDaysInNextAndPreviousMonths: false,
                numberOfMonths: 1,
                mainCalendar: "left",
                container: undefined,
                blurFieldOnSelect: true,
                i18n: {
                    previousMonth: "Previous Month",
                    nextMonth: "Next Month",
                    months: ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"],
                    weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                },
                theme: null,
                events: [],
                onSelect: null,
                onOpen: null,
                onClose: null,
                onDraw: null,
                keyboardInput: true
            });
        }
    };
});
