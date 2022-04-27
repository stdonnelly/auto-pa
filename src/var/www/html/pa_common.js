$(function () {

    // Initialize the clocks
    let $serverClock = $("#server-clock");
    let $clientClock = $("#client-clock");

    if ($serverClock.length > 0 || $clientClock > 0) {

        // Server clock

        // Placeholder server time
        let serverTime = new Date("2000-01-01T00:00:00").getTime();
        $serverClock.clock({
            "timestamp": serverTime
        });

        // Client clock: Much easier.
        $clientClock.clock();

        // Get server time via response headers (very dumb, but it works)
        $.ajax({
            // No url, because get current page is fine
            method: "HEAD", // I only want headers
            success: function (data, textStatus, jqXHR) {
                serverTime = Date.parse(jqXHR.getResponseHeader("date"));
                $serverClock.clock({
                    "timestamp": serverTime
                });
            },
            error: function () {
                console.log("Error while getting time");
            }
        });
        //
        // $.ajax({
        //     url: 'http://time.google.com',
        //     dataType: 'jsonp',
        //     method: 'GET',
        //     success: function (data, textStatus, jqXHR) {
        //         console.log(data);
        //         console.log(jqXHR.getResponseHeader("date"));
        //     }
        // });
    }

    // Use jQuery timepicker because the html time input is garbage to work with
    let $time = $("#play_time");
    if ($time.length > 0) {
        // Using 24hr time because I don't want to deal with am/pm nonsense
        $time.timepicker({timeFormat: 'H:i'});
    }

    // Update taskListJSON
    // Actual client
    // $.ajax({
    //     url: "/api/task_list.json",
    //     dataType: "text", // I need it to interpret as text, so I can use a reviver
    //     success: function(data) {
    //         taskListJSON = data;
    //
    //         // Generate the tables
    //         if ($("table").length > 0) {
    //             updateTables();
    //         }
    //     },
    //     error: function() {
    //         console.log("Error while getting task list");
    //     }
    // });

    // Emulated ITIS 3135 version
    updateTables();

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

    // Assign buttons
    $("#add_task").submit(addTask);
    $("#remove_tasks").click(removeTasks);
});

// This is a function because it will be used by multiple functions whenever I can change the JSON
function updateTables() {
    // Get task list JSON file from server
    let taskList = JSON.parse(localStorage.getItem('taskList'), function (key, value) {
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

    let $scheduleTable = $("table tbody");

    // Check if there is a table
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

        // Only loop through if taskList is not null
        if (taskList !== null) {
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
        }

        $scheduleTable.replaceWith($newTable);

        // Add checkboxes if the table is the one in remove_or_configure_task.html
        let $cTable = $("#checkbox-table tr");
        // Add header for the checkboxes
        $cTable.first().append($("<th scope='col'>").text("Select"));

        for (let i = 1; i < $cTable.length; i++) {
            let $input = $("<input>")
            $input.attr({
                type: "checkbox",
                "class": "table_box",
                "value": i - 1
            });

            // enable/disable buttons as needed when checked or unchecked
            $input.change(enableButtons);

            $cTable.eq(i).append($("<td>").append($input));
        }
    }
}

// Add schedule item
function addTask(event) {
    // Get the new task
    let newTask = {
        sound_file: $("#file_name").val(),
        play_time: $("#play_time").val(),
        week_days: $("#week_days").val().join(''),
        start_date: $("#start_date").val(),
        end_date: $("#end_date").val()
    };

    // Temporary
    console.log(newTask);

    // ITIS 3135
    let taskList = JSON.parse(localStorage.getItem('taskList'));

    // Make sure it is an array
    if (!Array.isArray(taskList)) {
        taskList = [];
    }

    // If the task does not already exist, add it
    // Check is new task exists
    let exists = false;
    checkTask:
        for (const task of taskList) {

            // Check each element
            for (const taskKey in task) {
                // Break if not identical
                if (task[taskKey] !== newTask[taskKey]) {
                    continue checkTask;
                }
            }

            // If the for loop does not break, mark as exists
            exists = true;
            break;
        }

    if (!exists) {
        taskList.push(newTask);
        localStorage.setItem('taskList', JSON.stringify(taskList));
    }


    // Actual client
    // $.ajax({
    //     url: "/api/task_list_item",
    //     data: newTask,
    //     contentType: 'application/json',
    //     success: function () {
    //         console.log("Successfully updated json");
    //     },
    //     error: function () {
    //         console.log("Error while posting new data");
    //     }
    // });

    event.preventDefault();
}

function removeTasks() {
    let taskList = JSON.parse(localStorage.getItem('taskList'));

    let checkedBoxes = $.map($(".table_box:checked"), function (checkedBox) {
        return parseInt($(checkedBox).val());
    });

    // Probably a dumb way of removing tasks
    let newTaskList = [];
    for (const i in taskList) {
        // Skip if the index is listed as one to delete
        if (!checkedBoxes.includes(parseInt(i))) {
            newTaskList.push(taskList[i]);
        }
    }

    // Update localStorage and reload table
    localStorage.setItem('taskList', JSON.stringify(newTaskList));

    updateTables();
}

function enableButtons() {
    // Check how many boxes are checked
    let numBoxes = $(".table_box:checked").length;

    if (numBoxes > 0) {
        // Enable remove tasks button
        $("#remove_tasks").prop("disabled", false);
    } else {
        // Disable the button
        $("#remove_tasks").prop("disabled", true);
    }

    if (numBoxes === 1) {
        // Enable modify task
        $("#modify_task").prop("disabled", false);
    } else {
        // Disable the button
        $("#modify_task").prop("disabled", true);
    }
}