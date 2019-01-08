const api = require('../../../common/genInstructorAPI.js')();
const courseId = require('../../../environment.js').testCourseId;

// TODO: write more rigorous tests. These tests are crippled by the fact that
// we do not have the permissions to create sections

describe('Endpoints > Course > Sections', function () {
  it('Lists sections', function () {
    // List sections
    return api.course.section.list({
      courseId,
    })
      .then((sections) => {
        if (!sections || sections.length === 0) {
          throw new Error('Could not test if we could list sections because there were no sections in the test course.');
        }
        // Make sure all sections are of the right form
        for (let i = 0; i < sections.length; i++) {
          if (
            !sections[i].id
            || !sections[i].name
            || !sections[i].course_id
          ) {
            // Didn't have the fields we expected
            throw new Error(`One of the sections returned wasn't of the expected form. Invalid section: ${JSON.stringify(sections[i])} should've had a course_id, id, and name`);
          }
        }
      });
  });

  it('Gets a section', function () {
    // List sections so we can get one
    return api.course.section.list({
      courseId,
    })
      .then((sections) => {
        if (sections.length > 0) {
          // We have at least one section to get
          return api.course.section.get({
            courseId,
            sectionId: sections[0].id,
          });
        }
        // No section to get
        throw new Error('Could not test if we could get a section because there were no sections in the test course.');
      })
      .then((section) => {
        // Check form of the section
        if (
          !section.id
          || !section.name
          || !section.course_id
        ) {
          // Didn't have the fields we expected
          throw new Error(`The section returned wasn't of the expected form: ${JSON.stringify(section)} should've had a course_id, id, and name`);
        }
      });
  });
});
