const genApi = require('../../common/genInstructorAPI.js');
const environment = require('../../environment.js');

const courseId = environment.testCourseId;

describe('Endpoints > Functionality > Items Per Page', function () {
  describe('Using Defaults', async function () {
    it('Limits the number of items per page to 1', async function () {
      const api = genApi({
        itemsPerPage: 1,
      });

      const users = await api.course.listUsers({
        courseId,
        maxPages: 1,
      });

      if (users.length !== 1) {
        throw new Error(`Requested 1 item per page but got ${users.length} instead`);
      }
    });

    it('Limits the number of items per page to 2', async function () {
      const api = genApi({
        itemsPerPage: 2,
      });

      const users = await api.course.listUsers({
        courseId,
        maxPages: 1,
      });

      if (users.length !== 2) {
        throw new Error(`Requested 2 item per page but got ${users.length} instead`);
      }
    });
  });

  describe('Using On-call Config', async function () {
    it('Limits the number of items per page to 1', async function () {
      const api = genApi();

      const users = await api.course.listUsers({
        courseId,
        itemsPerPage: 1,
        maxPages: 1,
      });

      if (users.length !== 1) {
        throw new Error(`Requested 1 item per page but got ${users.length} instead`);
      }
    });

    it('Limits the number of items per page to 2', async function () {
      const api = genApi();

      const users = await api.course.listUsers({
        courseId,
        itemsPerPage: 2,
        maxPages: 1,
      });

      if (users.length !== 2) {
        throw new Error(`Requested 2 item per page but got ${users.length} instead`);
      }
    });
  });
});
