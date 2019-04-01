const genApi = require('../../common/genInstructorAPI.js');
const environment = require('../../environment.js');

const courseId = environment.testCourseId;

describe('Endpoints > Functionality > Max Pages', function () {
  it('Limits the number of pages to 1', async function () {
    const api = genApi({
      itemsPerPage: 1,
    });

    const users = await api.course.listUsers({
      courseId,
      maxPages: 1,
    });

    if (users.length !== 1) {
      throw new Error(`Requested 1 page but got ${users.length} instead`);
    }
  });

  it('Limits the number of pages to 2', async function () {
    const api = genApi({
      itemsPerPage: 1,
    });

    const users = await api.course.listUsers({
      courseId,
      maxPages: 2,
    });

    if (users.length !== 2) {
      throw new Error(`Requested 2 pages but got ${users.length} instead`);
    }
  });
});
