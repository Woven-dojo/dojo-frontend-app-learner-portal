import { useState, useEffect, useCallback } from 'react';

import { fetchEnterpriseCatalogData, fetchLearningPathData, requestCourse } from './service';

/**
 * This is a temporary solution in order to implement filtering on FE. Once we have
 * proper API capable of filtering, we will pass the params to BE and cache the results
 * on FE side. At that point we will also need to redo the loading mechanics, as otherwise
 * triggering a new query (via filters) will result in the UserSubsidyContext.Provider
 * returning a loading screen.
 */
const applyFilter = (courses = [], filter = {}, locales = '') => {
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

export function useCatalogData({ enterpriseId, filter = {} }) {
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
      courses_metadata: applyFilter(catalogData.courses_metadata, filter),
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
