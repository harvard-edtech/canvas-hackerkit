const api = require('../common/genInstructorAPI.js')();
const environment = require('../environment.js');

const courseId = environment.testCourseId;

describe('Integration > Paging', function () {
  it('Limits the number of pages', function () {
    return api.course.listStudents({
      courseId,
      itemsPerPage: 7,
      maxPages: 1,
    })
      .then((students) => {
        if (students.length !== 7) {
          throw new Error(`We expected to find 7 students but we found ${students.length} instead.`);
        }
        return api.course.listStudents({
          courseId,
          itemsPerPage: 3,
          maxPages: 2,
        });
      })
      .then((students) => {
        if (students.length !== 6) {
          throw new Error(`We expected to find 6 students but we found ${students.length} instead.`);
        }
      });
  });

  it('Limits the items per page', function () {
    return api.course.listStudents({
      courseId,
      itemsPerPage: 7,
      maxPages: 1,
    })
      .then((students) => {
        if (students.length !== 7) {
          throw new Error(`We expected to find 7 students but we found ${students.length} instead.`);
        }
        return api.course.listStudents({
          courseId,
          itemsPerPage: 3,
          maxPages: 1,
        });
      })
      .then((students) => {
        if (students.length !== 3) {
          throw new Error(`We expected to find 3 students but we found ${students.length} instead.`);
        }
      });
  });
});
