import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Container, Row, Col, Pagination, TransitionReplace,
} from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import PropTypes from 'prop-types';
import { CourseCard, CourseDetails } from '@reustleco/dojo-frontend-common';

import emptyStateImage from '../../assets/images/empty-state.svg';
import noResultsImage from '../../assets/images/no-results.svg';

import DashboardPanel from './DashboardPanel';
import DashboardDrawer from './DashboardDrawer';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { Filter, ActiveFilter } from '../filter/Filter';
import {
  Alarm,
  Baseline,
  Certificate,
  Checklist,
  Dash,
  World,
} from './data/svg';

import { languageCodeToLabel } from '../../utils/common';

function EmptyState({ title, text, image = emptyStateImage }) {
  return (
    <div className="dashboard-empty-state">
      {image && <img src={image} alt="" />}
      {title && (
        <h3 className="dashboard-empty-state-title">
          {title}
        </h3>
      )}
      {text && (
        <p className="dashboard-empty-state-text">
          {text}
        </p>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string,
  text: PropTypes.node,
  image: PropTypes.string,
};

EmptyState.defaultProps = {
  title: '',
  text: null,
  image: emptyStateImage,
};

const COURSES_PER_CATALOG_PAGE = 12;

export default function Dashboard() {
  const {
    enterpriseConfig: {
      name,
    },
    authenticatedUser,
  } = useContext(AppContext);
  const { state } = useLocation();
  const history = useHistory();
  const {
    learningPathData: { learning_path_name: learningPathName, courses, count = 0 },
    catalog: { data: { courses_metadata: catalogCourses }, filter },
  } = useContext(UserSubsidyContext);

  const catalogPageCount = Math.ceil(catalogCourses.length / COURSES_PER_CATALOG_PAGE);
  const [activeCatalogPage, setActiveCatalogPage] = useState(1);
  const catalogCoursesOnActivePage = catalogCourses?.slice(
    (activeCatalogPage - 1) * COURSES_PER_CATALOG_PAGE,
    (activeCatalogPage - 1) * COURSES_PER_CATALOG_PAGE + COURSES_PER_CATALOG_PAGE,
  ) ?? [];
  const [activeCourse, setActiveCourse] = useState(null);

  useEffect(() => {
    if (state?.activationSuccess) {
      const updatedLocationState = { ...state };
      delete updatedLocationState.activationSuccess;
      history.replace({
        ...history.location,
        state: updatedLocationState,
      });
    }
  }, []);

  useEffect(() => {
    setActiveCatalogPage(1);
  }, [filter.current]);

  const userFirstName = authenticatedUser?.name.split(' ').shift();
  const onDrawerClose = () => setActiveCourse(null);

  return (
    <>
      <Helmet title={`Dashboard - ${name}`} />

      <Container size="lg" className="py-5">
        <h2 className="h2">
          {userFirstName ? `Welcome, ${userFirstName}!` : 'Welcome!'}
        </h2>
        <p className="mb-5 small">Today is a great day for education.</p>
        <DashboardPanel
          title="My learning path"
          subtitle={learningPathName}
          headerAside={(
            <div>
              <div className="small text-dark-400">
                Available for kick-off
              </div>
              <div className="h4">
                {count} {count === 1 ? 'course' : 'courses'}
              </div>
            </div>
          )}
        >
          {count === 0
            ? (
              <EmptyState
                title="You don't have a course in Learning path yet"
                text="Check out our complete course catalog for courses that might interest you"
              />
            )
            : (
              <Row data-testid="learningPath">
                {courses?.map((course) => (
                  <Col xs={12} md={6} lg={4} key={course.id} className="mb-4">
                    <CourseCard
                      active={activeCourse?.id === course.id}
                      title={course.title}
                      hours={course.hours_required}
                      languages={[course.primary_language].map(languageCodeToLabel)}
                      skills={[course.difficulty_level]}
                      bgKey={course.id % 10}
                      onClick={() => setActiveCourse(course)}
                    />
                  </Col>
                ))}
              </Row>
            )}
        </DashboardPanel>
        <DashboardPanel
          title="Course catalog"
        >
          <hr />
          <Row>
            <Col lg={8} data-testid="courseCatalog">
              <ActiveFilter filter={filter} />
              {catalogCoursesOnActivePage.length === 0 && (
                <EmptyState
                  image={noResultsImage}
                  title="Can't find what you're looking for?"
                  text={<>Get in touch with us at #dojo-help or <a href="mailto:dojo@woven-planet.global">dojo@woven-planet.global</a></>}
                />
              )}
              <div className="dashboard-catalog-wrap">
                <TransitionReplace>
                  <Row key={activeCatalogPage} className="dashboard-catalog-page">
                    {catalogCoursesOnActivePage.map((course) => (
                      <Col xs={12} md={6} key={course.id} className="mb-4">
                        <CourseCard
                          key={course.id}
                          title={course.title}
                          hours={course.hours_required}
                          languages={[course.primary_language].map(languageCodeToLabel)}
                          skills={[course.difficulty_level]}
                          bgKey={course.id % 10}
                          onClick={() => setActiveCourse(course)}
                        />
                      </Col>
                    ))}
                  </Row>
                </TransitionReplace>
                {catalogPageCount > 1 && (
                  <Row>
                    <Col className="d-flex justify-content-center">
                      <Pagination
                        paginationLabel={`Page ${activeCatalogPage} of ${catalogPageCount}`}
                        pageCount={catalogPageCount}
                        currentPage={activeCatalogPage}
                        onPageSelect={(pageNumber) => setActiveCatalogPage(pageNumber)}
                      />
                    </Col>
                  </Row>
                )}
              </div>
            </Col>
            <Col lg={4}>
              <Filter filter={filter} />
            </Col>
          </Row>
        </DashboardPanel>
        <DashboardDrawer open={activeCourse !== null} onClose={onDrawerClose}>
          { activeCourse && (
            <CourseDetails
              title={activeCourse.title}
              description={activeCourse.full_description}
              details={[
                {
                  key: 'Time investment',
                  value: activeCourse.hours_required && `${activeCourse.hours_required} hours`,
                  icon: <Alarm />,
                },
                {
                  key: 'Certificate',
                  value: activeCourse.has_certificate ? 'Avaliable' : 'Not avaliable',
                  icon: <Certificate />,
                },
                {
                  key: 'Difficulty level',
                  value: activeCourse.difficulty_level,
                  icon: <Dash />,
                },
                {
                  key: 'Primary language',
                  value: languageCodeToLabel(activeCourse.primary_language),
                  icon: <World />,
                },
                {
                  key: 'Subtitles',
                  value: activeCourse.subtitles_available ? 'Available' : 'Not avaliable',
                  icon: <Baseline />,
                },
                {
                  key: 'Prerequisites',
                  value: activeCourse.prerequisites,
                  icon: <Checklist />,
                },
              ].filter(item => !!item.value)}
              buttons={[
                {
                  type: 'outline-primary',
                  text: 'Close',
                  onClick: onDrawerClose,
                },
                {
                  type: 'primary',
                  text: 'Start course',
                  onClick: () => window.open(activeCourse.course_link, '_blank'),
                },
              ]}
            />
          )}
        </DashboardDrawer>
      </Container>
    </>
  );
}
