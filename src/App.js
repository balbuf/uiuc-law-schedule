import React, { useEffect, useState } from 'react';
import courses from './courses.json';
import { makeStyles } from '@material-ui/core/styles';
import { useTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Switch from '@material-ui/core/Switch';
import * as colors from '@material-ui/core/colors';

const useStyles = makeStyles((theme) => {
  return {
    root: {
      flexGrow: 1,
      height: '100vh',
    },

    leftPanel: {
      maxWidth: '300px',
      height: '100%',
    },

    header: {
      backgroundColor: colors.blue[900],
      color: colors.orange['A700'],
      padding: '1em',
    },

    courseList: {
      flexShrink: 1,
      overflowY: 'auto',
      minHeight: 0,
      overflowX: 'hidden',
    },

    table: {
      '& td, & th': {
        padding: '6px 8px 6px 6px',
      },
      '& th': {
        fontWeight: '700',
        fontSize: '105%',
      },
      '& td': {
        color: 'inherit',
      },
    },

    courseTitle: {
      fontWeight: '500',
    },

    courseNote: {
      fontWeight: '200',
      fontSize: '90%',
    },

    credits: {
      fontSize: '125%',
    },

    schedule: {
      minWidth: '1000px',
    },

    hours: {
      maxWidth: '50px',
      borderLeft: '1px solid #aaa',
    },

    hoursContainer: {
      marginTop: '16pt',
      position: 'relative',
      width: '100%',

      '& > div': {
        position: 'absolute',
        transform: 'translateY(-50%)',
        textAlign: 'right',
        right: '6px',
      },
    },

    dayColumn: {
      borderLeft: '1px solid #ccc',
    },

    blocks: {
      position: 'relative',
      overflow: 'hidden',
    },

    startTime: {
      position: 'absolute',
      height: '100%',
    },

    dayHeader: {
      height: '16pt',
      borderBottom: '2px solid #ccc',
      fontWeight: '500',
      textAlign: 'center',
    },

    session: {
      flexGrow: 1,
      flexBasis: 0,
      height: '100%',
      margin: '0 4px 0 1px',
    },

    paper: {
      padding: '4px',
      wordBreak: 'break-word',
      fontSize: '90%',
      overflow: 'hidden',
    },

    footer: {
      borderTop: '2px solid #aaa',
      padding: '8px',
    },

    footerCaption: {
      lineHeight: '100%',
      fontStyle: 'italic',
      fontWeight: '200',
    },

    creditsTotal: {
      fontWeight: '500',
      padding: '8px',
      margin: '0 8px',
      width: '40px',
      fontSize: '20pt',
      textAlign: 'right',
    },
  };
});

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const daysOfWeek = ['M', 'T', 'W', 'Th', 'F'];
const sessions = daysOfWeek.reduce((obj, day) => {
  obj[day] = {};
  return obj;
}, {});

// keep track of the earliest/latest course times
let earliest, latest;
const colorArray = Object.values(colors).map(arr => Object.values(arr));

courses.forEach(course => {
  let times = course.time.split(',');
  course.color = getRandom(getRandom(colorArray));

  times.forEach(time => {
    let timeParts = /([1-9][0-2]?):([0-5][0-9])-([1-9][0-2]?):([0-5][0-9])/.exec(time);
    if (!timeParts) {
      return;
    }
    let [, hh1, mm1, hh2, mm2] = timeParts.map(part => parseInt(part));
    // convert hours to 12-hour scheme
    hh1 = hh1 < 8 ? hh1 + 12 : hh1;
    hh2 = hh2 < 9 ? hh2 + 12 : hh2;
    let days = Array.from(time.matchAll(/[MTWF]h?/g));
    let startMin = 60 * hh1 + mm1;
    let duration = (60 * hh2 + mm2) - startMin;
    earliest = earliest ? Math.min(earliest, startMin) : startMin;
    latest = latest ? Math.max(latest, startMin + duration) : startMin + duration;
    days.forEach(day => {
      sessions[day][startMin] = sessions[day][startMin] || [];
      sessions[day][startMin].push({course, duration});
    });
  });
});

// round earliest/latest up/down to nearest half hour
earliest = earliest - (earliest % 30);
latest = latest + 30 - (latest % 30);
const total = latest - earliest;
const numHalfHours = (total / 30);
const halfHourPercentage = 100 / numHalfHours;
const startsOnHour = !(earliest % 60);

function App() {
  const classes = useStyles();
  const theme = useTheme();
  const [selected, updateSelected] = useState(new Set());

  function toggle(course) {
    selected[selected.has(course) ? 'delete' : 'add'](course);
    updateSelected(new Set(selected));
    window.history.replaceState(null, '', `${window.location.pathname}#${Array.from(selected).map(course => course.crn).join(',')}`);
  }

  const styleLineBg = {
    backgroundImage: `repeating-linear-gradient(
      transparent, transparent calc(${halfHourPercentage}% - ${startsOnHour ? 1 : 2}px), #ccc calc(${halfHourPercentage}% - ${startsOnHour ? 1 : 2}px), #ccc ${halfHourPercentage}%,
      transparent ${halfHourPercentage}%, transparent calc(${halfHourPercentage * 2}% - ${startsOnHour ? 2 : 1}px), #ccc calc(${halfHourPercentage * 2}% - ${startsOnHour ? 2 : 1}px), #ccc ${halfHourPercentage * 2}%)`,
    backgroundPosition: '0 1px',
  };

  useEffect(() => {
    const ids = window.location.hash.substr(1).split(',');
    console.log(ids);
    if (!ids.length) {
      return;
    }
    updateSelected(new Set(courses.filter(course => ids.includes(course.crn.toString()))));
  }, []);

  return (
    <>
      <CssBaseline/>
      <Grid container className={classes.root} wrap="nowrap">
        <Grid container item xs className={classes.leftPanel} direction="column">
          <Grid item className={classes.header}>
            <Typography variant="h4">Illinois Law</Typography>
            <Typography variant="h6"><em>Unofficial</em> Schedule Planner</Typography>
          </Grid>
          <Grid item className={classes.courseList} xs>
            <Paper>
              <Table className={classes.table} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Num</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Hrs</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map(course => (
                    <TableRow key={course.crn}>
                      <TableCell
                        style={selected.has(course) ? {backgroundColor: course.color, color: theme.palette.getContrastText(course.color)} : {}}
                      >
                        {course.number}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className={classes.courseTitle}>{course.title}</Typography>
                        <Typography variant="body2">{course.professor}</Typography>
                        <Typography variant="body2" className={classes.courseNote}>{course.time}</Typography>
                        {course.note && <Typography variant="body2" className={classes.courseNote}><em>{course.note}</em></Typography>}
                      </TableCell>
                      <TableCell
                        align="center"
                        className={classes.credits}
                        >
                          {course.credits}
                        </TableCell>
                        <TableCell>
                          <Switch size="small" checked={selected.has(course)} onChange={() => toggle(course)}/>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item container className={classes.footer}>
            <Grid item xs>
              <Typography variant="button" component="div">
                Total Credit Hours Selected:
              </Typography>
              <Typography variant="caption" className={classes.footerCaption} component="div">
                Be sure to account for clinics, journals, externships, TA positions, etc.
              </Typography>
            </Grid>
            <Grid className={classes.creditsTotal}>
              {Array.from(selected).reduce((total, course) => total + course.credits, 0)}
            </Grid>
          </Grid>
        </Grid>
        <Grid container item xs className={classes.schedule}>
          <Grid container item className={classes.hours}>
            <Grid item className={classes.hoursContainer}>
              {Array(numHalfHours).fill().map((nothing, i) => {
                let hour = Math.floor(earliest / 60) + (i ? Math.floor((startsOnHour ? i : i + 1) / 2) : 0);
                hour = hour > 12 ? hour - 12 : hour;
                let min = !(i % 2) === startsOnHour ? '00' : '30';
                return <div style={{top: `${i * halfHourPercentage}%`}} key={i}>{`${hour}:${min}`}</div>;
              })}
            </Grid>
          </Grid>
          {daysOfWeek.map(day => {
            let startTimes = Object.keys(sessions[day]);
            startTimes.sort((a, b) => a - b);

            return (
              <Grid item container direction="column" key={day} xs className={classes.dayColumn}>
                <Grid item className={classes.dayHeader}>{day}</Grid>
                <Grid item className={classes.blocks} xs style={styleLineBg}>
                  {startTimes.map(startTime => (
                    <Grid
                      container
                      className={classes.startTime}
                      key={startTime}
                      style={{top: `${((startTime - earliest) / total) * 100}%`}}
                      data-start={startTime}
                    >
                      {sessions[day][startTime].map(session => (selected.has(session.course) &&
                        <Grid item key={session.course.crn} className={classes.session}>
                          <Paper
                            style={{height: `${(session.duration / total) * 100}%`, backgroundColor: session.course.color, color: theme.palette.getContrastText(session.course.color)}}
                            className={classes.paper}
                            title={`${session.course.title}${session.course.note ? ` (${session.course.note})` : ''}`}
                          >
                            <Typography variant="body1">
                              {session.course.title}
                            </Typography>
                            <Typography variant="body2">
                              {session.course.professor}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </>
  );
}

export default App;
