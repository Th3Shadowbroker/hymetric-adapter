// SkyBlock calendar math. Every event below runs on a fixed schedule relative to the
// SkyBlock epoch, so all timers can be computed in the browser without a backend.

// Year 1, Early Spring 1st, 00:00 (June 11th 2019, 17:55 UTC)
export const EPOCH = 1560275700000;

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 50 * SECOND; // one SkyBlock hour
export const DAY = 24 * HOUR; // 20 real minutes
export const MONTH = 31 * DAY; // 10h 20m
export const SEASON = 3 * MONTH; // 31h
export const YEAR = 12 * MONTH; // 124h (5d 4h)

export const MONTHS = [
    "Early Spring", "Spring", "Late Spring",
    "Early Summer", "Summer", "Late Summer",
    "Early Autumn", "Autumn", "Late Autumn",
    "Early Winter", "Winter", "Late Winter",
];

// Offset from the start of a SkyBlock year to the start of the given month (1-12) and day (1-31)
function dateOffset(month, day) {
    return (month - 1) * MONTH + (day - 1) * DAY;
}

// interval: time between two starts, offset: first start relative to EPOCH, duration: how long it stays active
export const EVENTS = {
    darkAuction: {
        name: "Dark Auction",
        path: "skyblock-dark-auction-timer",
        interval: 3 * DAY,
        offset: 0,
        duration: 34 * SECOND, // entrance is open this long, the auction itself runs longer
    },
    bankInterest: {
        name: "Bank Interest",
        path: "skyblock-bank-interest-timer",
        // Paid once per season, up to 10 minutes after the season starts
        interval: SEASON,
        offset: 0,
        duration: 10 * MINUTE,
    },
    zoo: {
        name: "Traveling Zoo",
        path: "skyblock-zoo-timer",
        // Early Summer 1st and Early Winter 1st
        interval: 6 * MONTH,
        offset: dateOffset(4, 1),
        duration: 3 * DAY - SECOND,
    },
    spookyFestival: {
        name: "Spooky Festival",
        path: "skyblock-spooky-festival-timer",
        interval: YEAR,
        offset: dateOffset(8, 29),
        duration: 3 * DAY - SECOND,
    },
    jerryWorkshop: {
        name: "Jerry's Workshop",
        path: "skyblock-jerry-workshop-timer",
        // Open for all of Late Winter
        interval: YEAR,
        offset: dateOffset(12, 1),
        duration: MONTH,
    },
    winter: {
        name: "Season of Jerry",
        path: "skyblock-winter-timer",
        interval: YEAR,
        offset: dateOffset(12, 24),
        duration: 3 * DAY - SECOND,
    },
    newYear: {
        name: "New Year Celebration",
        path: "skyblock-newyear-timer",
        interval: YEAR,
        offset: dateOffset(12, 29),
        duration: 3 * DAY - SECOND,
    },
};

/**
 * The running occurrence of an event, or the next one if it isn't running.
 * @returns {{start: number, end: number, active: boolean}}
 */
export function getOccurrence(event, now = Date.now()) {
    let start = EPOCH + event.offset + Math.floor((now - EPOCH - event.offset) / event.interval) * event.interval;
    if (now >= start + event.duration) {
        start += event.interval;
    }
    return {start, end: start + event.duration, active: now >= start};
}

/** All occurrences of an event that overlap the range [from, to). */
export function getOccurrencesBetween(event, from, to) {
    const occurrences = [];
    let {start} = getOccurrence(event, from);
    for (; start < to; start += event.interval) {
        occurrences.push({start, end: start + event.duration});
    }
    return occurrences;
}

/**
 * Convert a real timestamp to a SkyBlock date. Years are 1-based like in-game.
 * @returns {{year: number, month: number, monthName: string, day: number, hour: number, minute: number}}
 */
export function toSkyBlockDate(time = Date.now()) {
    let elapsed = time - EPOCH;
    const year = Math.floor(elapsed / YEAR);
    elapsed -= year * YEAR;
    const month = Math.floor(elapsed / MONTH);
    elapsed -= month * MONTH;
    const day = Math.floor(elapsed / DAY);
    elapsed -= day * DAY;
    const hour = Math.floor(elapsed / HOUR);
    elapsed -= hour * HOUR;
    const minute = Math.floor(elapsed / HOUR * 60);
    return {year: year + 1, month: month + 1, monthName: MONTHS[month], day: day + 1, hour, minute};
}

/** Real timestamp at which the given SkyBlock date starts. Years are 1-based like in-game. */
export function fromSkyBlockDate(year, month, day = 1, hour = 0, minute = 0) {
    return EPOCH + (year - 1) * YEAR + dateOffset(month, day) + hour * HOUR + Math.floor(minute / 60 * HOUR);
}
