import { useState, useEffect, useCallback } from 'react';
import { SORT_OPTIONS_NAME, COURSE_DIFFICULTY_LEVEL } from './constants';
import { fetchEnterpriseCatalogData, fetchLearningPathData, requestCourse } from './service';

/**
 * This is a temporary solution in order to implement filtering on FE. Once we have
 * proper API capable of filtering, we will pass the params to BE and cache the results
 * on FE side. At that point we will also need to redo the loading mechanics, as otherwise
 * triggering a new query (via filters) will result in the UserSubsidyContext.Provider
 * returning a loading screen.
 */
const applyFilter = (courses = [], filter = {}, locales = []) => {
  let filteredCourses = [...courses];
  if (filter.learningPaths.length) {
    filteredCourses = filteredCourses.filter((course) =>
      course.learning_path.find((path) => filter.learningPaths.includes(path.internal_id?.toString())),
    );
  }

  if (filter.difficultyLevels.length) {
    filteredCourses = filteredCourses.filter((course) => filter.difficultyLevels.includes(course.difficulty_level));
  }

  if (filter.languages.length) {
    filteredCourses = filteredCourses.filter((course) => filter.languages.includes(course.primary_language));
  }

  if (filter.deliveryMethods.length) {
    filteredCourses = filteredCourses.filter((course) => filter.deliveryMethods.includes(course.delivery_method));
  }

  if (filter.search.length) {
    filteredCourses = filteredCourses.filter((course) =>
      course.full_description.toLocaleLowerCase(locales).includes(filter.search.toLocaleLowerCase(locales)),
    );
  }

  return filteredCourses;
};

const applySorting = (courses = [], sorting = '', locales = []) => {
  let sortededCourses = [...courses];

  const sortMap = [
    COURSE_DIFFICULTY_LEVEL.BASIC,
    COURSE_DIFFICULTY_LEVEL.INTERMEDIATE,
    COURSE_DIFFICULTY_LEVEL.ADVANCED,
  ];

  if (sorting === SORT_OPTIONS_NAME.ALPHABETICALLY) {
    sortededCourses = courses.sort((courseA, courseB) => courseA.title.localeCompare(courseB.title, locales));
  }
  if (sorting === SORT_OPTIONS_NAME.DIFFICULTY_ASC) {
    sortededCourses = courses.sort(
      (courseA, courseB) =>
        (courseA.difficulty_level === null) - (courseB.difficulty_level === null) ||
        sortMap.indexOf(courseA.difficulty_level) - sortMap.indexOf(courseB.difficulty_level),
    );
  }
  if (sorting === SORT_OPTIONS_NAME.DIFFICULTY_DESC) {
    sortededCourses = courses.sort(
      (courseA, courseB) =>
        (courseA.difficulty_level === null) - (courseB.difficulty_level === null) ||
        -(sortMap.indexOf(courseA.difficulty_level) - sortMap.indexOf(courseB.difficulty_level)),
    );
  }
  return sortededCourses;
};

export function useCatalogData({ enterpriseId, filter = {}, sorting = '' }) {
  const [catalogData, setCatalogData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const response = await fetchEnterpriseCatalogData(enterpriseId);
        setCatalogData(response.data);
      } catch {
        setCatalogData({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogData();
  }, [enterpriseId]);

  const requestCourseHandler = useCallback(async (courseId) => {
    await requestCourse(courseId);
    setCatalogData((data) => ({
      ...data,
      courses_metadata: data.courses_metadata.map((course) => ({
        ...course,
        user_requested_access: course.id === courseId ? true : course.user_requested_access,
      })),
    }));
  }, []);
  return [
    {
      ...catalogData,
      courses_metadata: applySorting(applyFilter(catalogData.courses_metadata, filter), sorting),
    },
    isLoading,
    requestCourseHandler,
  ];
}

export function useLearningPathData() {
  const [learningPathData, setLearningPathData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const response = await fetchLearningPathData();
        setLearningPathData(response.data);
      } catch {
        setLearningPathData({});
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalogData();
  }, []);

  return [learningPathData, isLoading];
}
