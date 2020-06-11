import qs from 'query-string';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const ENROLL_ENDPOINT = '/enterprise_learner_portal/api/v1/enterprise_course_enrollments/';

/**
 * @typedef {object} RequestOptions
 * @property {string} course_id CourseId
 * @property {string} enterprise_id EnterpriseId
 * @property {string} marked_done True/False. True archives a course.
 */

/**
 * Request to archive/unarchive a course.
 * @param {RequestOptions} options
 * @requires {Promise} Request promise.
 */
// eslint-disable-next-line import/prefer-default-export
export const updateCourseCompleteStatusRequest = (options) => {
  let url = `${process.env.LMS_BASE_URL}${ENROLL_ENDPOINT}`;
  if (options) {
    url += `?${qs.stringify(options)}`;
  }
  return getAuthenticatedHttpClient().patch(url);
};
