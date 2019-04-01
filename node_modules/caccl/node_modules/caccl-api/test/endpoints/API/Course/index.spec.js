const api = require('../../../common/genInstructorAPI.js')();
const environment = require('../../../environment.js');

const courseId = environment.testCourseId;
const { students, graders } = environment;

/*------------------------------------------------------------------------*/
/*                                 Helpers                                */
/*------------------------------------------------------------------------*/

const usersIncludeAll = (users, mustInclude) => {
  const ids = {};
  users.forEach((user) => {
    ids[user.id] = true;
  });
  for (let i = 0; i < mustInclude.length; i++) {
    const id = mustInclude[i].canvasId || mustInclude[i].id;
    if (!ids[id]) {
      return false;
    }
  }
  return true;
};

const usersExcludeAll = (users, mustExclude) => {
  const ids = {};
  users.forEach((user) => {
    ids[user.id] = true;
  });
  for (let i = 0; i < mustExclude.length; i++) {
    const id = mustExclude[i].canvasId || mustExclude[i].id;
    if (ids[id]) {
      return false;
    }
  }
  return true;
};

/*------------------------------------------------------------------------*/
/*                                  Tests                                 */
/*------------------------------------------------------------------------*/

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
      return api.course.listStudentEnrollments({
        courseId,
      })
        .then((enrollments) => {
          // Check to make sure role is 'StudentEnrollment'
          for (let i = 0; i < enrollments.length; i++) {
            if (enrollments[i].type !== 'StudentEnrollment') {
              throw new Error('At least one incorrect enrollment was returned! An enrollment didn\'t have type "StudentEnrollment".');
            }
          }
        });
    });

    it('Lists teaching team members', function () {
      return api.course.listTeachingTeamMemberEnrollments({
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
      return api.course.listDesignerEnrollments({
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
      return api.course.listObserverEnrollments({
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

  describe('User', function () {
    it('Lists users', function () {
      return api.course.listUsers({
        courseId,
      })
        .then((users) => {
          // Make sure it contains all the users from the environment
          if (!usersIncludeAll(users, students)) {
            throw new Error('Expected all students from environment to appear in response, but at least one student was excluded.');
          }
          if (!usersIncludeAll(users, graders)) {
            throw new Error('Expected all graders from environment to appear in response, but at least one grader was excluded.');
          }
        });
    });

    it('Lists students', function () {
      return api.course.listStudents({
        courseId,
      })
        .then((users) => {
          // Make sure it contains all students and no other users
          if (!usersIncludeAll(users, students)) {
            throw new Error('Expected all students from environment to appear in response, but at least one student was excluded.');
          }
          if (!usersExcludeAll(users, graders)) {
            throw new Error('Expected all graders from environment to appear in response, but at least one grader was excluded.');
          }
        });
    });

    it('Lists teaching team members', function () {
      return api.course.listTeachingTeamMembers({
        courseId,
      })
        .then((users) => {
          // Make sure it contains all graders and no students
          if (!usersIncludeAll(users, graders)) {
            throw new Error('Expected all graders from environment to appear in response, but at least one grader was excluded.');
          }
          if (!usersExcludeAll(users, students)) {
            throw new Error('Expected all students from environment to appear in response, but at least one student was excluded.');
          }
        });
    });

    it('Lists designers', function () {
      return api.course.listDesigners({
        courseId,
      })
        .then((users) => {
          // TODO: find a way to test this without any designers in the course
          // Check to make sure no students or graders are in the list
          if (!usersExcludeAll(users, students)) {
            throw new Error('Expected all students from environment to appear in response, but at least one student was excluded.');
          }
          if (!usersExcludeAll(users, graders)) {
            throw new Error('Expected all students from environment to appear in response, but at least one student was excluded.');
          }
        });
    });

    it('Lists observers', function () {
      return api.course.listObservers({
        courseId,
      })
        .then((users) => {
          // TODO: find a way to test this without any observers in the course
          // Check to make sure no students or graders are in the list
          if (!usersExcludeAll(users, students)) {
            throw new Error('Expected all students from environment to appear in response, but at least one student was excluded.');
          }
          if (!usersExcludeAll(users, graders)) {
            throw new Error('Expected all students from environment to appear in response, but at least one student was excluded.');
          }
        });
    });
  });
});
