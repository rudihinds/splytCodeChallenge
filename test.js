var moment = require('moment');

// Write a function defaultArguments . It takes a function as an argument, along with an object containing default values 
// for that function's arguments, and returns another function which defaults to the right values.

// Requirements
// You cannot assume that the function's arguments have any particular names.
// You should be able to call defaultArguments repeatedly to change the defaults.

function defaultArguments(func, obj){
  const funcStr = func.toString()
  const funcArgs = funcStr.slice(funcStr.indexOf("(")+1, funcStr.indexOf(")"))
                       .replace(/\s+/g, "")
                       .split(",")
                       .map((arg) => { 
                        return arg.trim().split('')[0]; 
                      })
  const defaultArgs = funcArgs.map(arg => (obj[arg] ? `${arg}=${obj[arg]}`: arg ))
  const funcBody = funcStr.substring(funcStr.indexOf("{")+1, funcStr.indexOf("}"))
  const res = Function(defaultArgs, funcBody.trim())
 
  return res
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// The businessmen among you will know that it's often not easy to find an appointment. In this task we want to find 
// such an appointment automatically. You will be given the calendars of our businessmen and a duration for the meeting. 
// Your task is to find the earliest time, when every businessman is free for at least that duration.

// Requirements
// All times in the calendars will be given in 24h format "hh:mm", the result must also be in that format
// A meeting is represented by its start time (inclusively) and end time (exclusively) -> if a meeting takes place from 09:00 - 11:00, the next possible start time would be 11:00
// The businessmen work from 09:00 (inclusively) - 19:00 (exclusively), the appointment must start and end within that range
// If the meeting does not fit into the schedules, return null
// The duration of the meeting will be provided as an integer in minutes
// Following these rules and looking at the example below the earliest time for a 60 minutes meeting would be 12:15.

const schedules = [
  [["09:00", "10:30"], ["13:30", "16:00"], ["17:00", "17:30"], ["17:45", "19:00"]],
  [["09:15", "11:00"], ["12:30", "16:30"], ["17:00", "17:30"]],
  [["10:00", "11:00"], ["15:00", "16:30"], ["17:45", "19:00"]]
];

const getFreeTime = schedules => {
  const freeScheds = schedules.map(schedule => {
    return getFreeSlotsOverSixtyMins(schedule)
  })
  return getEarliestTimeToMeet(freeScheds[0], freeScheds[1], freeScheds[2])
}

function getFreeSlotsOverSixtyMins(schedule) {
  let arr = [];
  if (schedule[0][0] !== "09:00") {
    arr.push(["09:00", schedule[0][0]]);
  }

  for (let i = 1; i < schedule.length; i++) {
    arr.push([schedule[i - 1][1], schedule[i][0]]);
  }

  if (schedule[schedule.length - 1][1] !== "19:00") {
    arr.push([schedule[schedule.length - 1][1], "19:00"]);
  }

  return arr
  .filter(range => range[0] !== range[1])
  .filter(range => getDurationInMinutes(range) >= 60);

}

const getDurationInMinutes = range => {
  const x = moment(range[0], "HH:mm");
  const y = moment(range[1], "HH:mm");
  const duration = moment.duration(y.diff(x)).as("minutes");
  return duration;
}

function getEarliestTimeToMeet(baseSchedule, schedule1, schedule2) {
let timesToMeet = []
  baseSchedule.forEach(s0 => {
      schedule1.forEach(s1 => {
        schedule2.forEach(s2 => {
          if (doesFreeTimeOverlap(s1, s0)){
            if (doesFreeTimeOverlap(s2, s0)){
              if (getEarliestCommonTime([s0, s1, s2])){
                timesToMeet.push(getEarliestCommonTime([s0, s1, s2]))
              }}}
        })
      })
    })
    
  return timesToMeet.length >= 1 ? timesToMeet[0] : null
}

const doesFreeTimeOverlap = (a, b) => {
  if (a[0] > b[1]) {
    return false;
  }
  if (a[1] < b[0]) {
    return false;
  }
  return true;
};

function getEarliestCommonTime(overLappingTimes) {
  const commonTime = overLappingTimes.reduce((acc, currentRange) => {
      const earliestTime = earliest(acc, currentRange)
      const latestTime = latest(acc, currentRange)
        return [earliestTime[0], latestTime[1]];
    }, ["09:00", "19:00"]
  );
    return getDurationInMinutes(commonTime) >= 60 ? commonTime[0] : null
}

const earliest = (a, b) => b[0] > a[0] ? [b[0], a[1]] : a
const latest = (a, b) => b[1] < a[1] ? [b[0], b[1]] : a

console.log(getFreeTime(schedules))
