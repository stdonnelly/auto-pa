const express = require('express');
const router = express.Router();
const fs = require('fs');

// const taskListFile = '/var/pa/task_list.json';
const taskListFile = '/home/samuel/Programs/PA/src/test_song_list.json';

// GET task list
router.get('/task_list.json', function(req, res) {
    res.sendFile(taskListFile);
});

// DELETE task list item
router.delete('/task_list_item/:index', function(req, res) {
    // Get index
    let index = parseInt(req.params.index);

    // Get task list (I should probably be using promises instead of sync)
    let taskList = JSON.parse(fs.readFileSync(taskListFile, 'utf-8'));

    // Check if index is valid
    if (isNaN(index) || index < 0) {
        res.status(400).json({error: "Index is negative or NaN"});
    } else if (index < 0 || index >= taskList.length) {
        res.status(404).json({error: ""})
    } else {
        taskList.splice(index);

        fs.writeFile(taskListFile, JSON.stringify(taskList, null, 4), function(err) {
            if (err) {
                console.log("Error while deleting task:");
                console.log(err);
                res.status(500).json({error: err});
            }
            res.json({success: `Successfully deleted task ${index}`});
        });
    }
});

// POST requests
// Add item
// Edit item

module.exports = router;