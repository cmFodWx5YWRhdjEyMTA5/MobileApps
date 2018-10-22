var moment = require('moment');
export function getDDMMMYYYYFromTimestamp(value) {
    return moment.unix(value).format("DD MMM ,YYYY");
}
