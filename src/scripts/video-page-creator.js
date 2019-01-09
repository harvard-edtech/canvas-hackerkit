const fs = require('fs');
const path = require('path');

const toSecs = (timestamp) => {
  if (timestamp.includes(':')) {
    const parts = timestamp.split(':');
    return (
      parseInt(parts[0]) * 60 * 60
      + parseInt(parts[1]) * 60
      + parseInt(parts[2])
    );
  } else {
    return parseInt(timestamp);
  }
};

module.exports = {
  script: (config) => {
    const {
      api,
      accessToken,
      canvasHost,
      enterToContinue,
      clearScreen,
      prompt,
      courseId,
      quit,
    } = config;

    console.log('To continue, please create/update the /data/videoPages.txt file:');
    console.log('- Put each Matterhorn video id its own line');
    console.log('- To create a page for a video, write page title(s) below it');
    console.log('- To soft trim a video, start the line with "[start][end]" where start/end is seconds or hh:mm:ss');
    console.log('\n');

    console.log('Example videoPage.txt file:');
    console.log('037480fad-8af1-112e-1bbe-60304750a0a1');
    console.log('Welcome Video');
    console.log('Welcome Video Dup (same as the other welcome video)');
    console.log('');
    console.log('547340ard-48ak-59aa-090f-428590493bb3');
    console.log('Lecture 1 (Full Video)')
    console.log('[0][30] First 30 seconds of Lecture 1');
    console.log('[00:00:00][01:27:00] First hour and 27 minutes of Lecture 1');
    console.log('[30][02:45:38] All but the first 30 seconds of Lecture 1');

    enterToContinue();

    // Choose publish option
    clearScreen();
    console.log('Choose a publish setting:');
    console.log('1 - don\'t publish videos by default');
    console.log('2 - publish videos by default');
    console.log('\nNote: with setting 1, to publish specific videos, start a line with "~"');
    console.log('Example: ~ [0][30] First 30 seconds of Lecture 1\n');
    console.log('You may still edit your videoPage.txt file at this time.')
    const setting = prompt('setting: ');
    if (setting !== '1' && setting !== '2') {
      console.log('Invalid setting. Now quitting.');
      quit();
    }
    const publishedByDefault = (setting === '2');

    // Read the file
    let videoPagesTxt;
    try {
      const filename = path.join(__dirname, '../../data/videoPages.txt');
      videoPagesTxt = fs.readFileSync(filename, 'utf-8');
    } catch (err) {
      console.log('We couldn\'t find the data/videoPages.txt file. Now quitting.');
      quit();
    }

    // Parse the file
    const videos = [];
    videoPagesTxt.split('\n')
      .filter((line) => {
        return (line && line.trim().length > 0);
      })
      .forEach((line) => {
        // Detect video ids
        let isVideoId;
        if (line.includes('-')) {
          const parts = line.split('-');
          isVideoId = (
            parts.length === 5
            && parts[0].length === 8
            && parts[1].length === 4
            && parts[2].length === 4
            && parts[3].length === 4
            && parts[4].length === 12
          );
        }
        if (isVideoId) {
          // Found a new video!
          videos.push({
            id: line.trim(),
            pages: [],
          });
          return;
        }

        if (videos.length === 0) {
          console.log('We found a video title before a video id. Now quitting');
          quit();
        }

        // Check if forced to be published
        const forcePublished = line.startsWith('~');
        const lineText = (
          forcePublished
            ? line.replace('~', '').trim()
            : line.trim()
        );

        // Parse next page
        let title = lineText.trim();
        let start = null;
        let end = null;
        try {
          if (lineText.includes('[')) {
            // Includes timestamp
            const parts = lineText.split(']');
            const firstTimestamp = parts[0].replace('[','').replace('-', '');
            const secondTimestamp = parts[1].replace('[','').replace('-', '');
            start = toSecs(firstTimestamp.trim());
            end = toSecs(secondTimestamp.trim());
            title = parts[2].trim();
          }
        } catch (err) {
          console.log('We encountered an error while trying to parse the following line:');
          console.log(line);
          console.log('Now quitting.');
          quit();
        }

        // Generate html
        videos[videos.length - 1].pages.push({
          title,
          start,
          end,
          published: publishedByDefault || forcePublished,
        });
      });

    // Confirm adding pages to Canvas
    clearScreen();
    let numPages = 0;
    videos.forEach((video) => {
      numPages += video.pages.length;
    });
    console.log(`About to add ${numPages} page${numPages === 1 ? '' : 's'} to Canvas`);
    enterToContinue();
    clearScreen();

    // Add pages to Canvas

    let promiseChain = Promise.resolve();
    console.log('--- Progress: ---');
    videos.forEach((video) => {
      // Add a promise that adds a new title
      promiseChain = promiseChain.then(() => {
        console.log(`\nVideo ID: ${video.id}`);
      });
      // Add a promise that creates a page then updates the progress
      video.pages.forEach((page) => {
        // Create the page body
        const softTrimAddon = (
          (page.start !== null && page.end !== null)
            ? `&amp;start=${page.start}&amp;end=${page.end}`
            : ''
        );
        const body = `<p><iframe style="width: 100%; height: 400px;" title="Matterhorn Video" src="https://matterhorn.dce.harvard.edu/engage/player/watch.html?id=${video.id}${softTrimAddon}" width="100%" height="400" allowfullscreen="allowfullscreen" webkitallowfullscreen="webkitallowfullscreen" mozallowfullscreen="mozallowfullscreen"></iframe></p>`;

        // Create the page
        promiseChain = promiseChain
          .then(() => {
            return api.course.page.create({
              courseId,
              body,
              title: page.title,
              published: page.published,
            });
          })
          .then((data) => {
            // Success!
            console.log(`- Page Created: ${page.title}`);
          })
          .catch((err) => {
            console.log('An error occurred while attempting to create the following page:');
            console.log(page.title);
            console.log('Error:');
            printErrorAndQuit(err);
          });
      })
    });

    promiseChain = promiseChain.then(() => {
      console.log('\nDone!');
      quit();
    });
  },
  requiresCourse: true,
};
