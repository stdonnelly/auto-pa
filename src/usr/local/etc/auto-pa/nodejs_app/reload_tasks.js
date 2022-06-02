const TASK_LIST_FILE = '/var/auto-pa/task_list.json';
// TODO: Make this work for multiple different devices
const USB_PATH = '/media/pi/F29E-3BD7/';

const reloadTasks = function () {
    const fs = require('fs');
    const { exec } = require('child_process');

    // Import task list JSON
    let taskList = JSON.parse(fs.readFileSync(TASK_LIST_FILE), function (key, value) {
        if (key.endsWith('_date')) {
            if (value) {
                // Change the string to an array so that the Date constructor works
                // https://stackoverflow.com/questions/33908299/javascript-parse-a-string-to-date-as-local-time-zone
                let ymd = value.split('-');

                // Parse the array
                return new Date(ymd[0], ymd[1] - 1, ymd[2]);
            } else {
                return null;
            }
        }
        return value;
    });

    // // Print contents
    // console.log('Tast list as JSON:');
    // console.log(taskList);

    // Object for weekdays formatted using crontab
    let weekdays = {
        'U': 0,
        'M': 1,
        'T': 2,
        'W': 3,
        'R': 4,
        'F': 5,
        'S': 6
    };

    // Make crontabData an empty string.
    let crontabData = '';

    let now = new Date();
    now.setHours(0, 0, 0, 0); // Make it only date, no time
    let nextEvent = null;

    // Loop through the list
    for (const listEntry of taskList) {

        // If now is after the event ends, ignore. (If end_date is not null (never) and now is later.)
        if (listEntry.end_date && now > listEntry.end_date) {
            continue;
        }

        // Check if it either is current, or starts next. If start_date is not null (immediately) and now is earlier, break.
        if (listEntry.start_date && now <= listEntry.start_date) {
            // Check if it earlier than the next event (or it hasn't been set)
            if (listEntry.start_date && (listEntry.start_date < nextEvent || !nextEvent)) {
                nextEvent = listEntry.start_date;
            }

            continue;
        }

        // Check if its ending is the next event
        if (listEntry.end_date && (listEntry.end_date < nextEvent || !nextEvent)) {
            nextEvent = listEntry.end_date;
        }
        // console.log("Next event:");
        // console.log(nextEvent);

        // Get the minute and hour
        // Should always be in this format: hh:mm
        let timeStr = listEntry.play_time.split(':');

        let min = parseInt(timeStr[1]);
        let hour = parseInt(timeStr[0]);

        // Weeks
        console.log(listEntry.week_days);
        console.log(!!listEntry.week_days)
        let weeks = '';
        if (listEntry.week_days) {
            for (const weekChar of listEntry.week_days) {
                weeks += weekdays[weekChar] + ',';
            }
            
            // Get all the weekdays except the last comma
            weeks = weeks.substring(0, weeks.length - 1);
        } else {
            weeks = '*';
        }

        crontabData += `${min} ${hour} * * ${weeks} /usr/local/etc/auto-pa/execSound.sh ${USB_PATH + listEntry.sound_file} >> /var/log/auto-pa/vlc_auto.log 2>&1\n`;
    }

    // Add reference to self in crontab so tasks are reloaded when the next task starts/expires (if there is a next event)
    if (nextEvent) {
        crontabData += `0 0 ${nextEvent.getDate()} ${nextEvent.getMonth() + 1} * nodejs -e 'require("/usr/local/etc/auto-pa/nodejs_app/reload_tasks.js")()' >> /var/log/auto-pa/node.log 2>$1\n`;
    }

    console.log("crontab file:");
    console.log(crontabData);

    fs.writeFile('/tmp/pa_crontab', crontabData, function (err) {
        if (err) {
            console.log('Error while writing file:');
            console.log(err);
        } else {
            // Update crontab
            exec('crontab /tmp/pa_crontab');
        }
    });
}

module.exports = reloadTasks;
