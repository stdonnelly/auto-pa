const express = require('express');
const router = express.Router();
const fs = require('fs');
const { exec } = require('child_process');
const reloadTasks = require('./reload_tasks');

const TASK_LIST_FILE = '/var/auto-pa/task_list.json';
// const TASK_LIST_FILE = '/home/samuel/Programs/PA/src/test_song_list.json';
// TODO: Make this work for multiple different devices
const USB_PATH = '/media/pi/F29E-3BD7/'

// Use parser
router.use(express.json());

// GET task list
router.get('/task_list.json', function (req, res) {
    res.sendFile(TASK_LIST_FILE);
});

// GET logs
router.use('/log', express.static('/var/log/auto-pa/'));

// GET file list
router.get('/files', function (req, res) {
    fs.readdir(USB_PATH, function (err, files) {
        res.json(files);
    });
});

// DELETE task list item
router.delete('/task_list_item', function (req, res) {
    // Get task list (I should probably be using promises instead of sync)
    let taskList = JSON.parse(fs.readFileSync(TASK_LIST_FILE, 'utf-8'));
    let newTaskList = [];

    // Get index
    let index = req.body;
    for (const currIndex of index) {
        // Check if index is valid
        if (isNaN(currIndex) || currIndex < 0) {
            res.status(400).json({ error: "Index is negative or NaN" });
        } else if (currIndex < 0 || currIndex >= taskList.length) {
            res.status(404).json({ error: "Index out of bounds" });
        }
    }

    // console.log(index);

    console.log(`[${new Date().toISOString()}]: Deleting items:`)
    for (const iStr in taskList) {
        let i = parseInt(iStr);
        // Skip if the index is listed as one to delete
        if (!index.includes(i)) {
            newTaskList.push(taskList[i]);
        } else {
            console.log(taskList[i]);
        }
    }

    fs.writeFile(TASK_LIST_FILE, JSON.stringify(newTaskList, null, 4), function (err) {
        if (err) {
            console.log("Error while deleting task:");
            console.log(err);
            res.status(500).json({ error: err });
        } else {
            res.json({ success: `Successfully deleted tasks ${index}` });

            console.log("Successfully deleted tasks");

            reloadTasks();
        }
    });
});

// POST requests

// Add item
router.post('/task_list_item', function (req, res) {
    // Get task list (I should probably be using promises instead of sync)
    let taskList = JSON.parse(fs.readFileSync(TASK_LIST_FILE, 'utf-8'));

    console.log(`[${new Date().toISOString()}]: Adding task:`);
    console.log(req.body);

    // If the task does not already exist, add it
    // Check if new task exists
    let exists = false;
    checkTask:
    for (const task of taskList) {

        // Check each element
        for (const taskKey in task) {
            // Break if not identical
            if (task[taskKey] !== req.body[taskKey]) {
                continue checkTask;
            }
        }

        // If the for loop does not break, mark as exists
        exists = true;
        break;
    }

    if (exists) {
        res.json({ success: "Task already exists" });
    } else {
        // Add the task (unsafe)
        let index = taskList.push(req.body) - 1;

        fs.writeFile(TASK_LIST_FILE, JSON.stringify(taskList, null, 4), function (err) {
            if (err) {
                console.log("Error while adding task:");
                console.log(err);
                res.status(500).json({ error: err });
            } else {
                res.json({ success: `Successfully added task ${index}` });

                console.log("Successfully added task");

                reloadTasks();
            }
        });
    }
});

// TODO: Edit item
router.post('/task_list_item', function (req, res) {

});

// TODO: Sanitize inputs, or at least rely on client-side a little less.
// Play now (this is a major security flaw, but I don't care right now)
router.post('/play/:filename', function (req, res) {
    let filename = USB_PATH + req.params.filename;

    console.log(`[${new Date().toISOString()}]: Playing ${filename}`);

    exec(`/usr/local/etc/auto-pa/execSound.sh "${filename}" 2>&1`, function (error, stdout) {
        // Log to /var/log/auto-pa/vlc_manual.log
        fs.appendFile('/var/log/auto-pa/vlc_manual.log', stdout, function (err) {
            if (err) {
                console.log("Error while logging to vlc_manual.log");
                console.log(err);
            }
        });
    });

    res.json({ success: "Playing " + filename });
});

// Set time using device time
router.post('/set_time', function (req, res) {

    console.log(`[${new Date().toISOString()}]: Setting time`);

    // Again, I am doing this the insecure way
    let timeString = String(req.body.year) +
        '-' + String(req.body.month).padStart(2, '0') +
        '-' + String(req.body.day).padStart(2, '0') +
        ' ' + String(req.body.hour).padStart(2, '0') +
        ':' + String(req.body.minute).padStart(2, '0') +
        ':' + String(req.body.second).padStart(2, '0');
    exec('sudo timedatectl set-time "' + timeString + '" 2>&1', function (error, stdout) {
        if (error) {
            console.log(error);
            res.json({ error: stdout });
        }
        res.json({ success: "Changed time to " + timeString });
        console.log(`Updated clock to: ${timeString}`);
    });
});

module.exports = router;
