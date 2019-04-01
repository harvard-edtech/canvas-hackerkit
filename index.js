const path = require('path');
const fs = require('fs');
const initCACCL = require('caccl/script');

const prompt = require('./src/prompt');

const scripts = require('./src/scripts');

// Helpers
const clearScreen = () => {
  console.log('\n'.repeat(40));
};
const enterToContinue = () => {
  prompt('\n--- press enter to continue ---');
};
const quit = () => {
  process.exit(0);
};

const printErrorAndQuit = (err) => {
  console.log('Oops! An error occurred:');
  console.log(err.message);
  console.log(`Error code: ${err.code}`);
  console.log('\nNow quitting');
  quit();
};

/*------------------------------------------------------------------------*/
/*                              Introduction                              */
/*------------------------------------------------------------------------*/

clearScreen();
console.log('Welcome to the Canvas HackerKit!');
console.log('To quit at any time, press ctrl+c');
console.log('To update this tool, quit and use "npm run update" instead')
console.log('');

/*------------------------------------------------------------------------*/
/*                              Access Token                              */
/*------------------------------------------------------------------------*/

// First attempt to read access token
const accessTokenFilename = path.join(__dirname, 'accessToken.txt');
let accessToken;
try {
  accessToken = fs.readFileSync(accessTokenFilename, 'utf-8');
  accessToken = accessToken.trim();
  console.log('- Using your access token stored in accessToken.txt');
} catch (err) {
  // No access token file!
  accessToken = null;
}

// Second attempt: ask for access token and save it
if (!accessToken || accessToken.trim().length === 0) {
  console.log('To continue, we need your Canvas access token:');
  accessToken = prompt('token: ');
  if (accessToken && accessToken.trim().length > 0) {
    // Write down the token
    accessToken = accessToken.trim();
    fs.writeFileSync(accessTokenFilename, accessToken, 'utf-8');
  } else {
    // No access token!
    console.log('- We didn\'t get an access token. Now quitting.');
    quit();
  }
}

/*------------------------------------------------------------------------*/
/*                               Canvas Host                              */
/*------------------------------------------------------------------------*/

// First attempt to read access token
const canvasHostFilename = path.join(__dirname, 'canvasHost.txt');
let canvasHost;
try {
  canvasHost = fs.readFileSync(canvasHostFilename, 'utf-8');
  canvasHost = canvasHost.trim();
  console.log(`- Using ${canvasHost} as your Canvas host.`);
} catch (err) {
  // No access token file!
  canvasHost = null;
}

// Second attempt: ask for access token and save it
if (!canvasHost || canvasHost.trim().length === 0) {
  console.log('To continue, we need your Canvas host (e.g., canvas.harvard.edu):');
  canvasHost = prompt('host: ');
  if (canvasHost && canvasHost.trim().length > 0) {
    // Write down the token
    canvasHost = canvasHost.trim();
    fs.writeFileSync(canvasHostFilename, canvasHost, 'utf-8');
  } else {
    // No access token!
    console.log('- We didn\'t get a Canvas host. Now quitting.');
    quit();
  }
}
enterToContinue();

/*------------------------------------------------------------------------*/
/*                               Set Up API                               */
/*------------------------------------------------------------------------*/

// Create an api instance
const api = initCACCL({
  accessToken,
  canvasHost,
});

/*------------------------------------------------------------------------*/
/*                              List Scripts                              */
/*------------------------------------------------------------------------*/

const scriptNames = Object.keys(scripts);
scriptNames.sort();

clearScreen();
console.log('Choose a tool to run:');
console.log('(Tool Number - Tool Name)\n');

scriptNames.forEach((scriptName, index) => {
  console.log(`${index + 1} - ${scriptName}`);
});

console.log('');
let toolNumber = prompt('tool number: ');

if (
  !toolNumber
  || isNaN(toolNumber)
  || parseInt(toolNumber) <= 0
  || parseInt(toolNumber) > scriptNames.length
) {
  console.log('\nInvalid tool number. Now quitting.');
  quit();
}

toolNumber = parseInt(toolNumber) - 1;
const scriptToRun = scripts[scriptNames[toolNumber]];
clearScreen();

/*------------------------------------------------------------------------*/
/*                              Choose Course                             */
/*------------------------------------------------------------------------*/

let chooseCourseProm = Promise.resolve(null);
if (scriptToRun.requiresCourse) {
  chooseCourseProm = api.user.self.listCourses()
    .then((courses) => {
      console.log('\nChoose a course to continue:');
      console.log('(Course Index - Course Title)\n');
      courses.forEach((course, index) => {
        console.log(`${index + 1} - ${course.name}`);
      });

      console.log('\nTip: you can also paste a Canvas course link\n');

      const course = prompt('index/link: ');
      if (!course) {
        console.log('We didn\'t get a selection. Now quitting.');
        quit();
      }

      if (course.startsWith('https://') || course.startsWith('http://')) {
        // This is a link
        try {
          const courseId = parseInt(course.split('/')[4]);
          return api.course.get({ courseId })
            .then((chosenCourse) => {
              clearScreen();
              console.log('You are choosing the following course (ctrl+c to quit):');
              console.log(chosenCourse.name);
              enterToContinue();
              return Promise.resolve(courseId);
            })
            .catch((err) => {
              clearScreen();
              console.log('An error occurred! Perhaps you don\'t have access to that course?');
              printErrorAndQuit(err);
            });
        } catch (err) {
          // Error parsing link
          console.log('The link you gave was invalid. Now quitting.');
          quit();
        }
      }

      // This is an index
      if (
        isNaN(course)
        || parseInt(course) <= 0
        || parseInt(course) > courses.length
      ) {
        // Invalid index
        console.log('We got an invalid index. Now quitting.');
        quit();
      }

      // Valid index! Use it
      return Promise.resolve(courses[parseInt(course) - 1].id);
    })
    .catch((err) => {
      printErrorAndQuit(err);
    });
}

/*------------------------------------------------------------------------*/
/*                           Print and Run Tool                           */
/*------------------------------------------------------------------------*/

chooseCourseProm.then((courseId) => {
  clearScreen();
  console.log(`Chosen tool: ${scriptNames[toolNumber]}\n`);

  try {
    scriptToRun.script({
      api,
      accessToken,
      canvasHost,
      courseId,
      prompt,
      clearScreen,
      enterToContinue,
      quit,
      printErrorAndQuit,
    });
  } catch (err) {
    console.log('\n\nAn error occured while running the tool.');
    console.log(`Error: ${err.message}`);
    console.log('\nPlease make sure you carefully follow all instructions while using the tool.');
    console.log('If you think this shouldn\'t be happening, Contact the tool creator.');
  }
});
