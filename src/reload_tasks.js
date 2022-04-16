exports.reloadTasks = function () {
    const fs = require('fs');
    const { exec } = require('child_process');

    // Import song list JSON
    let taskList = JSON.parse(fs.readFileSync('test_song_list.json'));

    // Print contents
    console.log('Tast list as JSON:');
    console.log(taskList);

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

    // Loop through the list
    for (const listEntry of taskList) {
        // Get the minute and hour
        // Should always be in this format: hh:mm
        let timeStr = listEntry.play_time.split(':');

        let min = parseInt(timeStr[1]);
        let hour = parseInt(timeStr[0]);

        // Weeks
        let weeks = '';
        for (const weekChar of listEntry.week_days) {
            weeks += weekdays[weekChar] + ',';
        }

        // Get all the weekdays except the last comma
        weeks = weeks.substring(0, weeks.length - 1);

        crontabData += `${min} ${hour} * * ${weeks} cvlc ${listEntry.sound_file} --play-and-exit >> ~/Documents/cvlc.log 2>&1\n`
    }

    console.log(crontabData);

    fs.writeFile('/tmp/pa_crontab', crontabData, function (err) {
        if (err) {
            // TODO:
            console.log('Error while writing file');
        } else {
            // Update crontab
            exec('sudo crontab -u auto-pa /tmp/pa_crontab');
        }
    });
}