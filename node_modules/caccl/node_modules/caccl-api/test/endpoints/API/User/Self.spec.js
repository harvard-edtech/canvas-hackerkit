const utils = require('../../../common/utils.js');
const api = require('../../../common/genInstructorAPI.js')();
const studentAPI = require('../../../common/genStudentAPI.js')();
const environment = require('../../../environment.js');

const studentInfo = environment.students[0];
const courseId = environment.testCourseId;

describe('Endpoints > User > Self', function () {
  it('Gets the current user', function () {
    return studentAPI.user.self.getProfile()
      .then((currentUser) => {
        const comparison = utils.checkTemplate({
          id: studentInfo.canvasId,
          name: `${studentInfo.first} ${studentInfo.last}`,
          sortable_name: `${studentInfo.last}, ${studentInfo.first}`,
        }, currentUser);

        if (!comparison.isMatch) {
          throw new Error(`The current user info we got wasn't what we expected:\n${comparison.description}`);
        }
      });
  });

  it('Lists the current user\'s courses', function () {
    return api.user.self.listCourses()
      .then((courses) => {
        // Make sure the test course is in the list
        let found;
        for (let i = 0; i < courses.length; i++) {
          if (courses[i].id === courseId) {
            // Found!
            found = true;
            break;
          }
        }
        if (!found) {
          throw new Error('Could not find the test course');
        }
      });
  });
});
