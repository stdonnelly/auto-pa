#! /usr/bin/env python3

import os
import json
import time

# Import song list JSON as dict
songList = json.load(open('test_song_list.json'))

# Print the contents as a table
print('Table:')
print('Sound file            | Time  | Days      | Start Date | End Date')

for listEntry in songList:
    print(str(listEntry['sound_file']) + ' | '
    + str(listEntry['play_time']) + ' | '
    + str(listEntry['week_days']).ljust(9) + ' | '
    + str(listEntry['start_date']) + ' | '
    + str(listEntry['end_date']))

# Print as a crontab entry or entries
print()
print('Crontab:')

# Dictionary for weekdays
weekdays = {
    'M' : 1,
    'T' : 2,
    'W' : 3,
    'R' : 4,
    'F' : 5,
    'S' : 6
}

# open file
crontab = open('/tmp/PAcrontab.txt', 'w')

# Header, will be used later
crontab.write('#PA_START\n')

for listEntry in songList:
    # Get the minute and hour
    playTime = time.strptime(listEntry['play_time'], '%H:%M')
    
    crontabEntry = str(playTime.tm_min)
    crontabEntry += ' ' + str(playTime.tm_hour)

    # Month and year are any
    crontabEntry += ' * *'

    # Weeks
    weekEntry = ''
    for ch in listEntry['week_days']:
        weekEntry += str(weekdays[ch]) + ','
    
    # Get all the weekdays except the last comma
    crontabEntry += ' ' + weekEntry[:-1]

    crontabEntry += ' cvlc ' + listEntry['sound_file'] + '--play-and-exit >> ~/Documents/cvlc.log 2>&1\n'

    print(crontabEntry)
    crontab.write(crontabEntry)

# Footer, will be used later
crontab.write('#PA_END\n')
crontab.close()
os.system('crontab /tmp/PAcrontab.txt')