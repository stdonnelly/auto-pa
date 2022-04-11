$( function () {

    // Initialize the clocks
    let $serverClock = $("#server-clock");
    let $clientClock = $("#client-clock");

    if ($serverClock.length > 0 || $clientClock > 0) {

        // Server clock
        // TODO: Get server time. Temporarily set to January 1, 2000, midnight
        let serverTime = new Date("2000-01-01T00:00:00").getTime();
        $serverClock.clock({
            "timestamp": serverTime
        });

        // Client clock: Much easier.
        $clientClock.clock();
    }

    // Use jQuery timepicker because the html time input is garbage to work with
    let $time = $("#time");
    if ($time.length > 0) {
        $time.timepicker();
    }

    // Generate the tables
    if ($("table").length > 0) {
        updateTables();
    }

    // All of these if statements are so the functions only trigger on elements that are actually present.
    // I may separate these into separate JavaScript files
    // Tabs for status.html
    let $logTabs = $("#logs-tabs");
    if ($logTabs.length > 0) {
        // updateTables();

        $logTabs.tabs({
            heightStyle: "auto"

        });
    }
});

// This is a function because it will be used by multiple functions whenever I can change the JSON
function updateTables() {
    // TODO Get task list JSON file from server. Temporarily using a hardcoded JSON.
    const taskListJSON = `[
        {
            "sound_file": "/media/usb0/song1.mp3",
            "play_time": "06:00",
            "week_days": "MTWRF",
            "start_date": "2022-06-19",
            "end_date": "2022-07-23"
        },
        {
            "sound_file": "/media/usb0/song2.mp3",
            "play_time": "12:00",
            "week_days": "MW",
            "start_date": null,
            "end_date": "2022-08-20"
        },
        {
            "sound_file": "/media/usb0/song3.mp3",
            "play_time": "23:00",
            "week_days": "S",
            "start_date": "2022-03-05",
            "end_date": "2022-03-06"
        }
    ]`;
    let taskList = JSON.parse(taskListJSON, function (key, value) {
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

    // $("#log-3 > code").text(JSON.stringify(taskList, null, '    '));
    // hljs.highlightAll();

    let $scheduleTable = $("#schedule-table tbody");

    // Check if there actually is a table
    if ($scheduleTable.length > 0) {
        // Generate the table
        let $newTable = $("<tbody>");

        // Generate table headers
        $newTable.append(
            $("<tr>").html(`
            <th scope="col">Filename</th>
            <th scope="col">Time</th>
            <th scope="col">Weekdays</th>
            <th scope="col">Start</th>
            <th scope="col">End</th>`
            ));

        for (const task of taskList) {
            let $row = $("<tr>");

            $row.append($("<td>").text(task.sound_file));
            $row.append($("<td>").text(task.play_time));
            $row.append($("<td>").text(task.week_days));

            // Check if the last two are null before trying to parse using a simple conditional expression
            $row.append($("<td>").text(task.start_date ? task.start_date.toLocaleDateString() : 'Immediately'));
            $row.append($("<td>").text(task.end_date ? task.end_date.toLocaleDateString() : 'Never'));

            $newTable.append($row);
        }

        $scheduleTable.replaceWith($newTable);
    }
}