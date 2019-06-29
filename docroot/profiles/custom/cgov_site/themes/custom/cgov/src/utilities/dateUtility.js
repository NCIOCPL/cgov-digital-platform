export function localToEasternTime(localDate) {
    var EDT_OFFSET = -4; // Daylight Savings time offset
    var EST_OFFSET = -5; // Standard time offset

    // First, convert local time to UTC
    var dateUTC = new Date(localDate.getUTCFullYear(),
        localDate.getUTCMonth(),
        localDate.getUTCDate(),
        localDate.getUTCHours(),
        localDate.getUTCMinutes(),
        localDate.getUTCSeconds());

    var easternTime = new Date(dateUTC.getTime());

    if (isDaylightSavingsTime(localDate)) {
        // Adjust hours to EDT from UTC
        easternTime.setUTCHours(easternTime.getUTCHours() + EDT_OFFSET);
    }
    else {
        // Adjust hours to EST from UTC
        easternTime.setUTCHours(easternTime.getUTCHours() + EST_OFFSET);
    }

    return easternTime;
}

export function isBusinessHours(dateEastern) {

    var duringHours = false;
    var hour = dateEastern.getHours();

    if ((hour >= 9 && hour < 21))
        duringHours = true;

    return duringHours;
}

export function dateIsWorkDay(dateEastern) {
    var weekday = true;
    var day = dateEastern.getDay();

    switch (day) {
        // Sunday
        case 0:
            weekday = false;
            break;

        case 1: // Monday
        case 2: // Tuesday
        case 3: // Wednesday
        case 4: // Thursday
        case 5: // Friday
            weekday = true;
            break;

        // Saturday
        case 6:
            weekday = false;
            break;
    }
    return weekday;
}

export function findObservedHoliday(holiday) {
    /*
        When a federal holiday falls on a Saturday, it is usually observed on the preceding Friday.
        When the holiday falls on a Sunday, it is usually observed on the following Monday.
        */

    var dayOfWeek = holiday.getDay();

    if (dayOfWeek == 6) {
        // Holiday fell on a Saturday, is observed on Friday
        holiday.setDate(holiday.getDate() - 1);
    }
    else if (dayOfWeek == 0) {
        // Holiday fell on a Sunday, is observed on Monday
        holiday.setDate(holiday.getDate() + 1)
    }

    return holiday;
}

export function isHoliday(dateEastern) {
    var THURSDAY = 4;
    var MONDAY = 1;

    var date = dateEastern.getDate();
    var day = dateEastern.getDay();
    var month = dateEastern.getMonth(); // Months are zero-based. 0 = Jan | 11 = Dec.

    var holidayDate = new Date();
    holidayDate.setHours(0, 0, 0, 0);

    // New Years
    holidayDate.setDate(1);
    holidayDate.setMonth(0); // January
    var observedHoliday = findObservedHoliday(holidayDate);
    if (month == observedHoliday.getMonth() && date == observedHoliday.getDate()) {
        return true; // New Year's Day
    }

    // Martin Luther King, Jr. Day
    // Falls on the 3rd Monday in January
    holidayDate.setDate(1);
    holidayDate.setMonth(0); // January
    // Find Monday.
    while (holidayDate.getDay() != MONDAY) {
        holidayDate.setDate(holidayDate.getDate() + 1);
    }
    // Add 2 weeks.
    holidayDate.setDate(holidayDate.getDate() + 14);
    if (month == holidayDate.getMonth() && date == holidayDate.getDate()) {
        return true; // MLK Jr. day
    }

    // George Washington's birthday
    // Falls on the 3rd Monday in February
    holidayDate.setDate(1);
    holidayDate.setMonth(1); // February
    // Find Monday.
    while (holidayDate.getDay() != MONDAY) {
        holidayDate.setDate(holidayDate.getDate() + 1);
    }
    // Add 2 weeks.
    holidayDate.setDate(holidayDate.getDate() + 14);
    if (month == holidayDate.getMonth() && date == holidayDate.getDate()) {
        return true; // George Washtington's birthday
    }

    // Memorial Day
    // Falls on the last Monday in May
    holidayDate.setDate(1);
    holidayDate.setMonth(5); // June
    // Find last day of May.
    holidayDate.setDate(holidayDate.getDate() - 1);
    while (holidayDate.getDay() != MONDAY) {
        holidayDate.setDate(holidayDate.getDate() - 1);
    }
    if (month == holidayDate.getMonth() && date == holidayDate.getDate()) {
        return true; // Memorial Day
    }

    // Independence Day
    holidayDate.setDate(4);
    holidayDate.setMonth(6); // July
    observedHoliday = findObservedHoliday(holidayDate);
    if (month == observedHoliday.getMonth() && date == observedHoliday.getDate()) {
        return true; // Independence Day
    }

    // Labor Day
    // falls on the 1st Monday in September
    holidayDate.setDate(1);
    holidayDate.setMonth(8); // September
    // Find Monday.
    while (holidayDate.getDay() != MONDAY) {
        holidayDate.setDate(holidayDate.getDate() + 1);
    }
    if (month == holidayDate.getMonth() && date == holidayDate.getDate()) {
        return true; // Labor Day
    }

    // Columbus Day
    // falls on the 2nd Monday in October
    holidayDate.setDate(1);
    holidayDate.setMonth(9); // October
    // Find Monday.
    while (holidayDate.getDay() != MONDAY) {
        holidayDate.setDate(holidayDate.getDate() + 1);
    }
    // Add 1 week.
    holidayDate.setDate(holidayDate.getDate() + 7);
    if (month == holidayDate.getMonth() && date == holidayDate.getDate()) {
        return true; // Columbus Day
    }

    // Veteran's Day
    holidayDate.setDate(11);
    holidayDate.setMonth(10); // November
    observedHoliday = findObservedHoliday(holidayDate);
    if (month == observedHoliday.getMonth() && date == observedHoliday.getDate()) {
        return true; // Veteran's Day
    }

    // Thanksgiving
    // Falls on the 4th Thursday in November
    holidayDate.setDate(1);
    holidayDate.setMonth(10);
    // Find Thursday.
    while (holidayDate.getDay() != THURSDAY) {
        holidayDate.setDate(holidayDate.getDate() + 1);
    }
    // Add 3 weeks.
    holidayDate.setDate(holidayDate.getDate() + 21);
    if (month == holidayDate.getMonth() && date == holidayDate.getDate()) {
        return true; // Thanksgiving Day
    }

    // Christmas
    holidayDate.setDate(25);
    holidayDate.setMonth(11); // December
    observedHoliday = findObservedHoliday(holidayDate);
    if (month == observedHoliday.getMonth() && date == observedHoliday.getDate()) {
        return true; // Christmas
    }

    return false;
}

// Function to check if the date UTC falls during Daylight Savings
// 2nd Sunday in March - 1st Sunday in November
// @ 7am UTC which is 2AM Eastern
// @ 6am UTC (end) which is 2AM Eastern
export function isDaylightSavingsTime (localDate) {
    var SUNDAY = 0;

    var dstStart = new Date();
    dstStart.setUTCHours(7, 0, 0, 0);
    dstStart.setUTCMonth(2); // March
    dstStart.setUTCDate(1);
    // Find the first Sunday in March        
    while (dstStart.getDay() != SUNDAY) {
        dstStart.setUTCDate(dstStart.getUTCDate() + 1);
    }
    // Add 1 week (2nd sunday in March) - start of daylight savings time
    dstStart.setUTCDate(dstStart.getUTCDate() + 7);

    var dstEnd = new Date();
    dstEnd.setUTCHours(6, 0, 0, 0);
    dstEnd.setUTCMonth(10); // November
    dstEnd.setUTCDate(1);
    // Find the first sunday in November
    // (End of Daylight Savings Time)
    while (dstEnd.getDay() != SUNDAY) {
        dstEnd.setUTCDate(dstEnd.getUTCDate() + 1);
    }

    // Convert all times to UTC so we can check that the current time
    // falls between DST start and end times.
    var timeUTC = new Date(localDate.getUTCFullYear(),
        localDate.getUTCMonth(),
        localDate.getUTCDate(),
        localDate.getUTCHours(),
        localDate.getUTCMinutes(),
        localDate.getUTCSeconds());
    var startUTC = new Date(dstStart.getUTCFullYear(),
        dstStart.getUTCMonth(),
        dstStart.getUTCDate(),
        dstStart.getUTCHours(),
        dstStart.getUTCMinutes(),
        dstStart.getUTCSeconds());
    var endUTC = new Date(dstEnd.getUTCFullYear(),
        dstEnd.getUTCMonth(),
        dstEnd.getUTCDate(),
        dstEnd.getUTCHours(),
        dstEnd.getUTCMinutes(),
        dstEnd.getUTCSeconds());

    // If the current time falls between the start and end times
    // then DaylightSavingsTime is true.
    return timeUTC > startUTC && timeUTC < endUTC;
}
