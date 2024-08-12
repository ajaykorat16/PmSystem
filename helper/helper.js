const momentTimezone = require('moment-timezone');
const moment = require('moment');

const utcToLocal = (date, format = 'DD-MM-YYYY') => {
    const utcDateTime = momentTimezone.tz(moment(date), "UTC");
    return momentTimezone.tz(utcDateTime, TIMEZONE).format(format);
}

const localToUtc = (date, format = 'YYYY-MM-DD HH:mm') => {
    const localDateTime = momentTimezone.tz(date, TIMEZONE);
    return momentTimezone.tz(localDateTime, "UTC").format(format);
}

module.exports = {
    utcToLocal,
    localToUtc,
}