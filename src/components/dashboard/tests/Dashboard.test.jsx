import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, within } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

import { renderWithRouter } from '../../../utils/tests';
import Dashboard from '../Dashboard';
import { filterInitial, filterOptions } from '../../enterprise-user-subsidy/data/constants';

const mockAuthenticatedUser = { username: 'myspace-tom', name: 'John Doe' };

const defaultAppState = {
  enterpriseConfig: {
    name: 'BearsRUs',
    uuid: 'BearsRUs',
  },
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
  authenticatedUser: mockAuthenticatedUser,
};

const defaultLearningPathData = {
  learning_path_name: 'My Learning Path',
};

const defaultCatalogData = {
  courses_metadata: [],
};

const filterMock = {
  current: filterInitial,
  options: filterOptions,
  set: jest.fn(),
};

const defaultCatalog = {
  data: defaultCatalogData,
  filter: filterMock,
};

const defaultUserSubsidyState = {
  learningPathData: defaultLearningPathData,
  catalog: defaultCatalog,
};

const mockLocation = {
  pathname: '/welcome',
  hash: '',
  search: '',
  state: { activationSuccess: true },
};

/* eslint-disable react/prop-types */
const DashboardWithContext = ({
  initialAppState = defaultAppState,
  initialUserSubsidyState = defaultUserSubsidyState,
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <Dashboard />
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => mockAuthenticatedUser,
}));

jest.mock('universal-cookie');

// eslint-disable-next-line no-console
console.error = jest.fn();

describe('<Dashboard />', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders user first name if available', () => {
    renderWithRouter(<DashboardWithContext />);
    expect(screen.getByText('Welcome, John!'));
  });

  it('does not render user first name if not available', () => {
    const appState = {
      ...defaultAppState,
      authenticatedUser: {
        ...defaultAppState.authenticatedUser,
        name: '',
      },
    };
    renderWithRouter(<DashboardWithContext initialAppState={appState} />);
    expect(screen.getByText('Welcome!'));
  });

  it('renders name of learning path if available', () => {
    renderWithRouter(<DashboardWithContext />);
    expect(screen.getByText('My Learning Path'));
  });

  it('shows empty state when no courses on learning path', () => {
    const userSubsidyState = {
      learningPathData: { ...defaultLearningPathData, courses: [], count: 0 },
      catalog: defaultCatalog,
    };
    renderWithRouter(<DashboardWithContext initialUserSubsidyState={userSubsidyState} />);
    expect(screen.getByText("You don't have a course in Learning path yet"));
  });

  it('shows 0 available courses on learning path with empty learning path', () => {
    const userSubsidyState = {
      learningPathData: { ...defaultLearningPathData, courses: [], count: 0 },
      catalog: defaultCatalog,
    };
    renderWithRouter(<DashboardWithContext initialUserSubsidyState={userSubsidyState} />);
    expect(screen.getByText('0 courses'));
  });

  it('shows 1 available course on learning path with 1 course', () => {
    const userSubsidyState = {
      learningPathData: {
        ...defaultLearningPathData,
        courses: [
          {
            title: 'Course 1',
            primary_language: 'en',
            hours_required: 42,
          },
        ],
        count: 1,
      },
      catalog: defaultCatalog,
    };
    renderWithRouter(<DashboardWithContext initialUserSubsidyState={userSubsidyState} />);
    expect(screen.getByText('1 course'));
  });

  it('shows course card on learning path with 1 course', async () => {
    const userSubsidyState = {
      learningPathData: {
        ...defaultLearningPathData,
        courses: [
          {
            title: 'How to train your dragon',
            primary_language: 'en',
            hours_required: 42,
          },
        ],
        count: 1,
      },
      catalog: defaultCatalog,
    };
    renderWithRouter(<DashboardWithContext initialUserSubsidyState={userSubsidyState} />);
    const learningPathContainer = within(screen.getByTestId('learningPath'));
    expect(learningPathContainer.getByText('How to train your dragon'));
    expect(learningPathContainer.getByText('ENG'));
    expect(learningPathContainer.getByText('42 h'));
  });

  it('shows 2 cards in the course catalog', async () => {
    const userSubsidyState = {
      learningPathData: defaultLearningPathData,
      catalog: {
        ...defaultCatalog,
        data: {
          ...defaultCatalog.data,
          courses_metadata: [
            {
              title: 'How to train your dragon',
              primary_language: 'en',
              hours_required: 42,
            },
            {
              title: 'Large numbers in Python',
              primary_language: 'en',
              hours_required: 13,
            },
          ],
        },
      },
    };
    renderWithRouter(<DashboardWithContext initialUserSubsidyState={userSubsidyState} />);
    const courseCatalogContainer = within(screen.getByTestId('courseCatalog'));
    expect(courseCatalogContainer.getByText('How to train your dragon'));
    expect(courseCatalogContainer.getByText('42 h'));
    expect(courseCatalogContainer.getByText('Large numbers in Python'));
    expect(courseCatalogContainer.getByText('13 h'));
    expect((await courseCatalogContainer.findAllByText('ENG')).length === 2);
  });
});
