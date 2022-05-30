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
    }

    // Use jQuery timepicker because the html time input is garbage to work with
    let $playTime = $("#play_time");
    if ($playTime.length > 0) {
        // Using 24hr time because I don't want to deal with am/pm nonsense
        $playTime.timepicker({ timeFormat: 'H:i' });
    }

    updateTables();

    // All of these if statements are so the functions only trigger on elements that are actually present.
    // I may separate these into separate JavaScript files
    // Tabs for status.html
    let $logTabs = $("#logs-tabs");
    if ($logTabs.length > 0) {
        $.get("api/log/node.log", function (data) {
            $("#log-1").text(data);
        });
        $.get("api/log/vlc_manual.log", function (data) {
            $("#log-2").text(data);
        });
        $.get("api/log/vlc_auto.log", function (data) {
            $("#log-3").text(data);
            $logTabs.tabs();
        });
    }

    // Assign buttons
    $("#add_task").submit(addTask);
    $("#remove_tasks").click(removeTasks);
    $("#modify_task").click(modifyTask);
    $("#update_time").click(updateTime);
    $("#device_time").click(deviceTime);
    $("#play_now").submit(playNow);


    // Get list of items in the sounds directory
    $fileSelector = $("#file_name");
    if ($fileSelector.length > 0) {
        $.get("api/files", function (data) {
            for (const datum of data) {
                $fileSelector.append($("<option>").text(datum));
            }

        });
    }
});

// This is a function because it will be used by multiple functions whenever I can change the JSON
function updateTables() {
    // Get task list JSON file from server

    // Update taskListJSON
    $.ajax({
        url: "/api/task_list.json",
        dataType: "text", // I need it to interpret as text, so I can use a reviver
        success: function (data) {
            let taskListJSON = data;

            // Generate the tables
            if ($("table").length > 0) {
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
        },
        error: function () {
            console.log("Error while getting task list");
        }
    });


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

    // console.log(newTask);

    $.ajax({
        url: "/api/task_list.json",
        dataType: "text", // I need it to interpret as text, so I can use a reviver
        success: function (data) {
            taskListJSON = data;

            // Generate the tables
            if ($("table").length > 0) {
                updateTables();
            }
        },
        error: function () {
            console.log("Error while getting task list");
        }
    });

    $.ajax({
        url: "/api/task_list_item",
        data: JSON.stringify(newTask),
        method: "post",
        dataType: "json",
        contentType: 'application/json',
        success: function (data) {
            console.log(data.success);

            // Go back to configure sounds
            location.href = "configure_sounds.html";
        },
        error: function (data) {
            console.log(data.error);
        }
    });

    event.preventDefault();
}

function removeTasks() {
    let taskList = JSON.parse(localStorage.getItem('taskList'));

    let checkedBoxes = $.map($(".table_box:checked"), function (checkedBox) {
        return parseInt($(checkedBox).val());
    });

    $.ajax({
        url: "/api/task_list_item",
        method: "delete",
        contentType: 'application/json',
        data: JSON.stringify(checkedBoxes),
        dataType: "json",
        success: function (data) {
            console.log(data.success);

            updateTables();
        },
        error: function (data) {
            console.log(data.error);
        }
    })
}

function modifyTask() {
    // Get the task index
    let checkedBox = $(".table_box:checked").val();

    // Load "add task" with the index
    location.href = "add_task.html?replace=" + checkedBox;
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

// Update time using the boxes
function updateTime() {
    let newDate = new Date($("#new-date").val() + ' ' + $("#new-time").val());

    // console.log(dateString);
    $.ajax({
        url: "/api/set_time",
        method: "post",
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify({
            year: newDate.getFullYear(),
            month: newDate.getMonth() + 1,
            day: newDate.getDate(),
            hour: newDate.getHours(),
            minute: newDate.getMinutes(),
            second: newDate.getSeconds()
        }),
        success: function (data, textStatus, jqXHR) { // On success, update clock
            serverTime = Date.parse(jqXHR.getResponseHeader("date"));
            $("#server-clock").clock({
                "timestamp": serverTime
            });

            console.log(data.success);
        },
        error: function (data) {
            console.log(data.error);
        }
    });
}

function deviceTime() {
    let newDate = new Date();

    // console.log(dateString);
    $.ajax({
        url: "/api/set_time",
        method: "post",
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify({
            year: newDate.getFullYear(),
            month: newDate.getMonth() + 1,
            day: newDate.getDate(),
            hour: newDate.getHours(),
            minute: newDate.getMinutes(),
            second: newDate.getSeconds()
        }),
        success: function (data, textStatus, jqXHR) { // On success, update clock
            serverTime = Date.parse(jqXHR.getResponseHeader("date"));
            $("#server-clock").clock({
                "timestamp": serverTime
            });

            console.log(data.success);
        },
        error: function (data) {
            console.log(data.error);
        }
    });
}

function playNow(event) {
    $.ajax({
        url: "/api/play/" + $("#file_name").val(),
        method: "post",
        dataType: "json",
        success: function (data) {
            console.log(data.success);
        },
        error: function (data) {
            console.log(data.error);
        }
    });

    event.preventDefault();
}