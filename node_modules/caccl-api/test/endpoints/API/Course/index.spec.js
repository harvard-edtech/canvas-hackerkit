const api = require('../../../common/genInstructorAPI.js')();
const courseId = require('../../../environment.js').testCourseId;

describe('Endpoints > Course', function () {
  describe('Course', function () {
    it('Gets a course', function () {
      return api.course.get({
        courseId,
      })
        .then((course) => {
          // We can't check the content of the course because we're not
          // restricting the setup of the test course itself. All we can do is
          // spot check if the returned object has the fields we expect
          if (
            !course
            || !course.id
            || !course.name
            || !course.course_code
            || !course.time_zone
          ) {
            throw new Error('The course we retrieved didn\'t have the correct fields.');
          }
        });
    });
  });

  describe('Enrollment', function () {
    it('Lists enrollments', function () {
      return api.course.listEnrollments({
        courseId,
      })
        .then((enrollments) => {
          if (!enrollments || enrollments.length === 0) {
            throw new Error('No enrollments returned');
          }
        });
    });

    it('Lists students', function () {
      return api.course.listStudents({
        courseId,
      })
        .then((students) => {
          // Check to make sure role is 'StudentEnrollment'
          for (let i = 0; i < students.length; i++) {
            if (students[i].type !== 'StudentEnrollment') {
              throw new Error('At least one incorrect enrollment was returned! An enrollment didn\'t have type "StudentEnrollment".');
            }
          }
        });
    });

    it('Lists teaching team members', function () {
      return api.course.listTeachingTeamMembers({
        courseId,
      })
        .then((members) => {
          // Check to make sure role is 'TaEnrollment' or 'TeacherEnrollment'
          for (let i = 0; i < members.length; i++) {
            if (
              members[i].type !== 'TaEnrollment'
              && members[i].type !== 'TeacherEnrollment'
            ) {
              throw new Error('At least one incorrect enrollment was returned! An enrollment didn\'t have type "TaEnrollment" or "TeacherEnrollment".');
            }
          }
        });
    });

    it('Lists designers', function () {
      return api.course.listDesigners({
        courseId,
      })
        .then((designers) => {
          // Check to make sure role is 'DesignerEnrollment'
          for (let i = 0; i < designers.length; i++) {
            if (designers[i].type !== 'DesignerEnrollment') {
              throw new Error('At least one incorrect enrollment was returned! An enrollment didn\'t have type "DesignerEnrollment".');
            }
          }
        });
    });

    it('Lists observers', function () {
      return api.course.listObservers({
        courseId,
      })
        .then((observers) => {
          // Check to make sure role is 'ObserverEnrollment'
          for (let i = 0; i < observers.length; i++) {
            if (observers[i].type !== 'ObserverEnrollment') {
              throw new Error('At least one incorrect enrollment was returned! An enrollment didn\'t have type "ObserverEnrollment".');
            }
          }
        });
    });
  });
});
