const genInstructorAPI = require('../../common/genInstructorAPI.js');

let api;
const utils = require('../../common/utils.js');
const environment = require('../../environment.js');

const courseId = environment.testCourseId;

describe('Endpoints > Functionality > Caching', function () {
  beforeEach(function () {
    api = genInstructorAPI({
      cacheType: 'memory',
    });
  });

  it('Caches a request', function () {
    this.timeout(25000);
    return api.course.listEnrollments({ courseId })
      .then((enrollments1) => {
        return utils.resolvesInTimeframe({
          promise: api.course.listEnrollments({ courseId }),
          maxSeconds: 1,
        })
          .then((enrollments2) => {
            if (JSON.stringify(enrollments1) !== JSON.stringify(enrollments2)) {
              throw new Error('Cached enrollments didn\'t match true enrollments');
            }
          });
      });
  });

  it('Caches and chains promises', function () {
    this.timeout(25000);

    return Promise.all(
      [0, 1, 2, 3, 4, 5].map(() => {
        return api.course.listEnrollments({ courseId })
          .then(() => {
            return Date.now();
          });
      })
    )
      .then((timestamps) => {
        let earliest;
        let latest;
        timestamps.forEach((timestamp) => {
          if (!earliest || timestamp < earliest) {
            earliest = timestamp;
          }
          if (!latest || timestamp > latest) {
            latest = timestamp;
          }
        });
        // Ensure that the promises resolve at approx. the same time
        if (latest - earliest > 500) {
          throw new Error(`Promises should've resolved in less than 500ms but they differed by ${latest - earliest}ms`);
        }
      });
  });
});
