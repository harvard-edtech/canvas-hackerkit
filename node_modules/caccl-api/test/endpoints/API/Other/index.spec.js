const api = require('../../../common/genInstructorAPI.js')();
const courseId = require('../../../environment.js').testCourseId;

describe('Endpoints > Other', function () {
  it('Lists apps', async function () {
    const listA = await api.course.app.list({ courseId });
    const listB = await api.other.endpoint({
      path: `/api/v1/courses/${courseId}/external_tools`,
      params: {
        include_parents: true,
      },
    });

    if (JSON.stringify(listA) !== JSON.stringify(listB)) {
      throw new Error('The course list should match the result of api.course.app.list but doesn\'t');
    }
  });

  it('Lists enrollments', async function () {
    const listA = await api.course.listEnrollments({ courseId });
    const listB = await api.other.endpoint({
      path: `/api/v1/courses/${courseId}/enrollments`,
    });

    if (JSON.stringify(listA) !== JSON.stringify(listB)) {
      throw new Error('The course enrollments list should match the result of api.course.listEnrollments but doesn\'t');
    }
  });
});
