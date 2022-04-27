const express = require('express');
const router = express.Router();
const fs = require('fs');
const reloadTasks = require('./reload_tasks');

// const taskListFile = '/var/pa/task_list.json';
const taskListFile = '/home/samuel/Programs/PA/src/test_song_list.json';

// Use parser
router.use(express.json());

// GET task list
router.get('/task_list.json', function(req, res) {
    res.sendFile(taskListFile);
});

// DELETE task list item
router.delete('/task_list_item', function(req, res) {
    // Get index
    let index = [];
    for (const indexStr of req.query.index) {
        let indexInt = parseInt(indexStr);

        // Check if index is valid
        if (isNaN(indexInt) || indexInt < 0) {
            res.status(400).json({error: "Index is negative or NaN"});
        } else if (indexInt < 0 || indexInt >= taskList.length) {
            res.status(404).json({error: "Index out of bounds"});
        } else {
            index.push(indexInt);
        }
    }

    // Get task list (I should probably be using promises instead of sync)
    let taskList = JSON.parse(fs.readFileSync(taskListFile, 'utf-8'));
    let newTaskList = [];

    for (const i in taskList) {
        // Skip if the index is listed as one to delete
        if (!index.includes(i)) {
            newTaskList.push(taskList[i]);
        }
    }

    fs.writeFile(taskListFile, JSON.stringify(taskList, null, 4), function(err) {
        if (err) {
            console.log("Error while deleting task:");
            console.log(err);
            res.status(500).json({error: err});
        }
        res.json({success: `Successfully deleted tasks ${index}`});

        reloadTasks();
    });
});

// POST requests
// router.post('/task_list_item', function(req, res) {
//     console.log(req.query.index);
// });
// Add item
router.post('/task_list_item', function(req, res) {
    //req.body
});

// Edit item

module.exports = router;