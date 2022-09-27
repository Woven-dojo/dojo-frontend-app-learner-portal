import React from 'react';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import moment from 'moment';
import {
  courseEnrollmentFactory,
  createCourseEnrollmentWithStatus,
} from './enrollment-testutils';
import CourseEnrollments, { COURSE_SECTION_TITLES } from '../CourseEnrollments';
import { MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL } from '../course-cards/move-to-in-progress-modal/MoveToInProgressModal';
import { updateCourseCompleteStatusRequest } from '../course-cards/mark-complete-modal/data/service';
import { COURSE_STATUSES } from '../data/constants';
import CourseEnrollmentsContextProvider from '../CourseEnrollmentsContextProvider';
import * as hooks from '../data/hooks';
import { createManyMocks, factory } from '../../../../../utils/tests';

jest.mock('@edx/frontend-platform/auth');
jest.mock('@edx/frontend-enterprise-utils');
getAuthenticatedUser.mockReturnValue({ username: 'test-username' });

jest.mock('../course-cards/mark-complete-modal/data/service');

jest.mock('../data/service');
jest.mock('../data/hooks');

const enterpriseConfig = {
  uuid: 'test-enterprise-uuid',
};

const inProgCourseRun = createCourseEnrollmentWithStatus(
  COURSE_STATUSES.inProgress,
);
const upcomingCourseRun = createCourseEnrollmentWithStatus(
  COURSE_STATUSES.upcoming,
);
const completedCourseRun = createCourseEnrollmentWithStatus(
  COURSE_STATUSES.completed,
);
const savedForLaterCourseRun = createCourseEnrollmentWithStatus(
  COURSE_STATUSES.savedForLater,
);
const requestedCourseRun = createCourseEnrollmentWithStatus(
  COURSE_STATUSES.requested,
);

hooks.useCourseEnrollments.mockReturnValue({
  courseEnrollmentsByStatus: {
    inProgress: [inProgCourseRun],
    upcoming: [upcomingCourseRun],
    completed: [completedCourseRun],
    savedForLater: [savedForLaterCourseRun],
    requested: [requestedCourseRun],
  },
  updateCourseEnrollmentStatus: jest.fn(),
});

const renderEnrollmentsComponent = () => render(
  <AppContext.Provider value={{ enterpriseConfig }}>
    <CourseEnrollmentsContextProvider>
      <CourseEnrollments />
    </CourseEnrollmentsContextProvider>
  </AppContext.Provider>,
);

describe('Course enrollments', () => {
  beforeEach(() => {
    updateCourseCompleteStatusRequest.mockImplementation(() => ({ data: {} }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders course sections', () => {
    renderEnrollmentsComponent();
    expect(screen.getByText(COURSE_SECTION_TITLES.completed));
    expect(screen.getByText(COURSE_SECTION_TITLES.savedForLater));
  });

  it.skip('generates course status update on move to in progress action', async () => {
    const { getByText } = renderEnrollmentsComponent();
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', {
          name: MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL,
        }),
      );
    });

    // TODO This test only validates 'half way', we ideally want to update it to
    // validate the UI results. Skipping at the time of writing since need to
    // figure out the right markup for testability. This give a base level of confidence
    // that move to in progress is not failing, that's all.

    expect(updateCourseCompleteStatusRequest).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(getByText('Your course was saved for later.')));
  });

  it('renders courses enrollments within sections by created timestamp', async () => {
    const courseFactory = courseEnrollmentFactory.extend({
      title: factory.index(i => `title ${i}`),
      courseRunId: factory.index(i => `course-run-${i}`),
      created: factory.datetime(moment(), {
        increment: { seconds: 100 },
      }),
    });

    const courses = createManyMocks(5, courseFactory);

    const inProgressCourses = [courses[0], courses[3]];
    const upcomingCourses = [courses[2], courses[1], courses[4]];

    const setCoursesStatus = (coursesList, status) => coursesList.forEach(
      course => {
        // eslint-disable-next-line no-param-reassign
        course.status = status;
      },
    );

    setCoursesStatus(inProgressCourses, COURSE_STATUSES.inProgress);
    setCoursesStatus(upcomingCourses, COURSE_STATUSES.upcoming);

    hooks.useCourseEnrollments.mockReturnValueOnce({
      courseEnrollmentsByStatus: {
        inProgress: inProgressCourses,
        upcoming: upcomingCourses,
        completed: [],
        savedForLater: [],
        requested: [],
      },
    });

    renderEnrollmentsComponent();
  });
});
