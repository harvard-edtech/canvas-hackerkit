/**
 * Functions for interacting with courses
 * @class api.course
 */

const EndpointCategory = require('../../../classes/EndpointCategory');
const prefix = require('../../common/prefix');
const utils = require('../../common/utils');

// Import subcategories
const Assignment = require('./Assignment');
const AssignmentGroup = require('./AssignmentGroup');
const App = require('./App');
const GradebookColumn = require('./GradebookColumn');
const Group = require('./Group');
const GroupSet = require('./GroupSet');
const Page = require('./Page');
const Quiz = require('./Quiz');
const Rubric = require('./Rubric');
const Section = require('./Section');

class Course extends EndpointCategory {
  constructor(config) {
    super(config, Course);
  }
}

/*------------------------------------------------------------------------*/
/*                             Subcategories:                             */
/*------------------------------------------------------------------------*/

Course.assignment = Assignment;
Course.assignmentGroup = AssignmentGroup;
Course.app = App;
Course.gradebookColumn = GradebookColumn;
Course.group = Group;
Course.groupSet = GroupSet;
Course.page = Page;
Course.quiz = Quiz;
Course.rubric = Rubric;
Course.section = Section;

/*------------------------------------------------------------------------*/
/*                               Endpoints:                               */
/*------------------------------------------------------------------------*/

/**
 * Gets info on a specific course
 * @author Gabriel Abrams
 * @method get
 * @memberof api.course
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to get info on
 * @param {boolean} [options.includeSyllabus=false] - If truthy, includes
 *   syllabus body
 * @param {boolean} [options.includeTerm=false] - If truthy, includes term
 * @param {boolean} [options.includeAccount=false] - If truthy, includes account
 *   Id
 * @param {boolean} [options.includeDescription=false] - If truthy, includes
 *   public description
 * @param {boolean} [options.includeSections=false] - If truthy, includes
 *   sections
 * @param {boolean} [options.includeTeachers=false] - If truthy, includes
 *   teachers
 * @param {boolean} [options.includeCourseImage=false] - If truthy, includes the
 *   course image
 * @param {boolean} [options.includeNeedsGradingCount=false] - If truthy,
 *   includes the number of students who still need to be graded
 * @return {Promise.<Object>} Canvas course {@link https://canvas.instructure.com/doc/api/courses.html#Course}
 */
Course.get = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}`,
    method: 'GET',
    params: {
      include: utils.genIncludesList({
        syllabus_body: options.includeSyllabus,
        term: options.includeTerm,
        account: options.includeAccount,
        public_description: options.includeDescription,
        sections: options.includeSections,
        teachers: options.includeTeachers,
        course_image: options.includeCourseImage,
        needs_grading_count: options.includeNeedsGradingCount,
      }),
    },
  });
};
Course.get.action = 'get info on a specific course';
Course.get.requiredParams = ['courseId'];

/*------------------------------------------------------------------------*/
/*                               Enrollments                              */
/*------------------------------------------------------------------------*/

/**
 * Gets the list of enrollments in a course
 * @author Gabriel Abrams
 * @method listEnrollments
 * @memberof api.course
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {string} [options.types=all] - list of enrollment types to include:
 *   ['student', 'ta', 'teacher', 'designer', 'observer']
 *   Defaults to all types.
 * @param {string} [options.activeOnly=false] - If truthy, only active
 *   enrollments included
 * @param {string} [options.includeAvatar=false] - If truthy, avatar_url is
 *   included
 * @param {string} [options.includeGroups=false] - If truthy, group_ids is
 *   included
 * @return {Promise.<Object[]>} list of Canvas Enrollments {@link https://canvas.instructure.com/doc/api/enrollments.html#Enrollment}
 */
Course.listEnrollments = function (options) {
  const params = {};

  // Pre-process enrollment types
  if (options.types) {
    params.type = options.types.map((type) => {
      if (type.includes('Enrollment')) {
        return type;
      }
      return type.charAt(0).toUpperCase() + type.substr(1) + 'Enrollment';
    });
  }

  // Filter to only active
  if (options.activeOnly) {
    params.state = ['active'];
  }

  // Include avatar
  if (options.includeAvatar) {
    params.include = ['avatar_url'];
  }

  // Include groups
  if (options.includeGroups) {
    if (!params.include) {
      params.include = [];
    }
    params.include.push('group_ids');
  }

  return this.visitEndpoint({
    params,
    path: `${prefix.v1}/courses/${options.courseId}/enrollments`,
    method: 'GET',
  });
};
Course.listEnrollments.action = 'get enrollments from a course';
Course.listEnrollments.requiredParams = ['courseId'];

/**
 * Gets the list of student enrollmentss in a course
 * @author Gabriel Abrams
 * @method listStudentEnrollments
 * @memberof api.course
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {string} [options.activeOnly=false] - If truthy, only active
 *   enrollments included
 * @param {string} [options.includeAvatar=false] - If truthy, avatar_url is
 *   included
 * @param {string} [options.includeGroups=false] - If truthy, group_ids is
 *   included
 * @return {Promise.<Object[]>} list of Canvas Enrollments {@link https://canvas.instructure.com/doc/api/enrollments.html#Enrollment}
 */
Course.listStudentEnrollments = function (options) {
  const newOptions = options;
  newOptions.types = ['student'];
  return this.api.course.listEnrollments(newOptions);
};
Course.listStudentEnrollments.action = 'get the list of student enrollments in a course';
Course.listStudentEnrollments.requiredParams = ['courseId'];

/**
 * Gets the list of TAs and Teacher enrollments in a course
 * @author Gabriel Abrams
 * @method listTeachingTeamMemberEnrollments
 * @memberof api.course
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {string} [options.activeOnly=false] - If truthy, only active
 *   enrollments included
 * @param {string} [options.includeAvatar=false] - If truthy, avatar_url is
 *   included
 * @param {string} [options.includeGroups=false] - If truthy, group_ids is
 *   included
 * @return {Promise.<Object[]>} list of Canvas Enrollments {@link https://canvas.instructure.com/doc/api/enrollments.html#Enrollment}
 */
Course.listTeachingTeamMemberEnrollments = function (options) {
  const newOptions = options;
  newOptions.types = ['ta', 'teacher'];
  return this.api.course.listEnrollments(newOptions);
};
Course.listTeachingTeamMemberEnrollments.action = 'get the list of TAs and Teacher enrollments in a course';
Course.listTeachingTeamMemberEnrollments.requiredParams = ['courseId'];

/**
 * Gets the list of designer enrollments in a course
 * @author Gabriel Abrams
 * @method listDesignerEnrollments
 * @memberof api.course
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {string} [options.activeOnly=false] - If truthy, only active
 *   enrollments included
 * @param {string} [options.includeAvatar=false] - If truthy, avatar_url is
 *   included
 * @param {string} [options.includeGroups=false] - If truthy, group_ids is
 *   included
 * @return {Promise.<Object[]>} list of Canvas Enrollments {@link https://canvas.instructure.com/doc/api/enrollments.html#Enrollment}
 */
Course.listDesignerEnrollments = function (options) {
  const newOptions = options;
  newOptions.types = ['designer'];
  return this.api.course.listEnrollments(newOptions);
};
Course.listDesignerEnrollments.action = 'get the list of designer enrollments in a course';
Course.listDesignerEnrollments.requiredParams = ['courseId'];

/**
 * Gets the list of observer enrollments in a course
 * @author Gabriel Abrams
 * @method listObserverEnrollments
 * @memberof api.course
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {string} [options.activeOnly=false] - If truthy, only active
 *   enrollments included
 * @param {string} [options.includeAvatar=false] - If truthy, avatar_url is
 *   included
 * @param {string} [options.includeGroups=false] - If truthy, group_ids is
 *   included
 * @return {Promise.<Object[]>} list of Canvas Enrollments {@link https://canvas.instructure.com/doc/api/enrollments.html#Enrollment}
 */
Course.listObserverEnrollments = function (options) {
  const newOptions = options;
  newOptions.types = ['observer'];
  return this.api.course.listEnrollments(newOptions);
};
Course.listObserverEnrollments.action = 'get the list of observer enrollments in a course';
Course.listObserverEnrollments.requiredParams = ['courseId'];

/*------------------------------------------------------------------------*/
/*                                  Users                                 */
/*------------------------------------------------------------------------*/

/**
 * Gets info on a specific user in a course
 * @author Gabriel Abrams
 * @method getUser
 * @memberof api.course
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {number} options.userId - Canvas user Id to get
 * @param {boolean} [options.includeEmail] - If true, user email is included
 * @param {boolean} [options.includeEnrollments] - If true, user's enrollments
 *   in this course are included
 * @param {boolean} [options.includeLocked] - If true, includes whether this
 *   enrollment is locked
 * @param {boolean} [options.includeAvatar] - If true, user avatar url is
 *   included
 * @param {boolean} [options.includeBio] - If true, user bio is included
 * @return {Promise.<Object>} Canvas user {@link https://canvas.instructure.com/doc/api/users.html#User}
 */
Course.getUser = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/users/${options.userId}`,
    method: 'GET',
    params: {
      include: utils.genIncludesList({
        email: options.includeEmail,
        enrollments: options.includeEnrollments,
        locked: options.includeLocked,
        avatar_url: options.includeAvatar,
        bio: options.includeBio,
      }),
    },
  });
};
Course.getUser.action = 'get info on a user in a course';
Course.getUser.requiredParams = ['courseId', 'userId'];

/**
 * Gets info on all users in a course
 * @author Gabriel Abrams
 * @method listUsers
 * @memberof api.course
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {string} [options.types=all] - list of enrollment types to include:
 *   ['student', 'ta', 'teacher', 'designer', 'observer']
 *   Defaults to all types.
 * @param {boolean} [options.includeEmail] - If true, user email is included
 * @param {boolean} [options.includeEnrollments] - If true, user's enrollments
 *   in this course are included
 * @param {boolean} [options.includeLocked] - If true, includes whether this
 *   enrollment is locked
 * @param {boolean} [options.includeAvatar] - If true, user avatar url is
 *   included
 * @param {boolean} [options.includeBio] - If true, user bio is included
 * @return {Promise.<Object[]>} Canvas users {@link https://canvas.instructure.com/doc/api/users.html#User}
 */
Course.listUsers = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/users`,
    method: 'GET',
    params: {
      enrollment_type: options.types,
      include: utils.genIncludesList({
        email: options.includeEmail,
        enrollments: options.includeEnrollments,
        locked: options.includeLocked,
        avatar_url: options.includeAvatar,
        bio: options.includeBio,
      }),
    },
  });
};
Course.listUsers.action = 'get info on all users in a course';
Course.listUsers.requiredParams = ['courseId'];

/**
 * Gets the list of students in a course
 * @author Gabriel Abrams
 * @method listStudents
 * @memberof api.course
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {string} [options.activeOnly=false] - If truthy, only active
 *   enrollments included
 * @param {boolean} [options.includeEmail] - If true, user email is included
 * @param {boolean} [options.includeEnrollments] - If true, user's enrollments
 *   in this course are included
 * @param {boolean} [options.includeLocked] - If true, includes whether this
 *   enrollment is locked
 * @param {boolean} [options.includeAvatar] - If true, user avatar url is
 *   included
 * @param {boolean} [options.includeBio] - If true, user bio is included
 * @return {Promise.<Object[]>} list of Canvas Users {@link https://canvas.instructure.com/doc/api/users.html#User}
 */
Course.listStudents = function (options) {
  const newOptions = options;
  newOptions.types = ['student'];
  return this.api.course.listUsers(newOptions);
};
Course.listStudents.action = 'get the list of students in a course';
Course.listStudents.requiredParams = ['courseId'];

/**
 * Gets the list of TAs and Teachers in a course
 * @author Gabriel Abrams
 * @method listTeachingTeamMembers
 * @memberof api.course
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {string} [options.activeOnly=false] - If truthy, only active
 *   enrollments included
 * @param {boolean} [options.includeEmail] - If true, user email is included
 * @param {boolean} [options.includeEnrollments] - If true, user's enrollments
 *   in this course are included
 * @param {boolean} [options.includeLocked] - If true, includes whether this
 *   enrollment is locked
 * @param {boolean} [options.includeAvatar] - If true, user avatar url is
 *   included
 * @param {boolean} [options.includeBio] - If true, user bio is included
 * @return {Promise.<Object[]>} list of Canvas Users {@link https://canvas.instructure.com/doc/api/users.html#User}
 */
Course.listTeachingTeamMembers = function (options) {
  const newOptions = options;
  newOptions.types = ['ta', 'teacher'];
  return this.api.course.listUsers(newOptions);
};
Course.listTeachingTeamMembers.action = 'get the list of TAs and Teachers in a course';
Course.listTeachingTeamMembers.requiredParams = ['courseId'];

/**
 * Gets the list of designers in a course
 * @author Gabriel Abrams
 * @method listDesigners
 * @memberof api.course
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {string} [options.activeOnly=false] - If truthy, only active
 *   enrollments included
 * @param {boolean} [options.includeEmail] - If true, user email is included
 * @param {boolean} [options.includeEnrollments] - If true, user's enrollments
 *   in this course are included
 * @param {boolean} [options.includeLocked] - If true, includes whether this
 *   enrollment is locked
 * @param {boolean} [options.includeAvatar] - If true, user avatar url is
 *   included
 * @param {boolean} [options.includeBio] - If true, user bio is included
 * @return {Promise.<Object[]>} list of Canvas Users {@link https://canvas.instructure.com/doc/api/users.html#User}
 */
Course.listDesigners = function (options) {
  const newOptions = options;
  newOptions.types = ['designer'];
  return this.api.course.listUsers(newOptions);
};
Course.listDesigners.action = 'get the list of designers in a course';
Course.listDesigners.requiredParams = ['courseId'];

/**
 * Gets the list of observers in a course
 * @author Gabriel Abrams
 * @method listObservers
 * @memberof api.course
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to query
 * @param {string} [options.activeOnly=false] - If truthy, only active
 *   enrollments included
 * @param {boolean} [options.includeEmail] - If true, user email is included
 * @param {boolean} [options.includeEnrollments] - If true, user's enrollments
 *   in this course are included
 * @param {boolean} [options.includeLocked] - If true, includes whether this
 *   enrollment is locked
 * @param {boolean} [options.includeAvatar] - If true, user avatar url is
 *   included
 * @param {boolean} [options.includeBio] - If true, user bio is included
 * @return {Promise.<Object[]>} list of Canvas Users {@link https://canvas.instructure.com/doc/api/users.html#User}
 */
Course.listObservers = function (options) {
  const newOptions = options;
  newOptions.types = ['observer'];
  return this.api.course.listUsers(newOptions);
};
Course.listObservers.action = 'get the list of observers in a course';
Course.listObservers.requiredParams = ['courseId'];

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = Course;
