import {
  useState, useEffect, useCallback,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import _camelCase from 'lodash.camelcase';
import _cloneDeep from 'lodash.clonedeep';

import * as service from './service';
import { groupCourseEnrollmentsByStatus, transformCourseEnrollment } from './utils';
import { reportFatalError } from '../../../../../utils/errorHandling';


export const useCourseEnrollments = (enterpriseUUID) => {
  const [courseEnrollmentsByStatus, setCourseEnrollmentsByStatus] = useState(groupCourseEnrollmentsByStatus([]));
  const [programEnrollments, setProgramEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await service.fetchEnterpriseCourseEnrollments(enterpriseUUID);
        // TODO: fetch enrollment requests, transform them, and merge with actual course enrollments
        const enrollments = camelCaseObject(resp.data).map(transformCourseEnrollment);
        const enrollmentsByStatus = groupCourseEnrollmentsByStatus(enrollments);
        setCourseEnrollmentsByStatus(enrollmentsByStatus);
      } catch (error) {
        reportFatalError(error);
        setFetchError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [enterpriseUUID]);

  useEffect(() => {
    const fetchProgramEnrollments = async () => {
      try {
        const response = await service.fetchEnterpriseProgramEnrollments(enterpriseUUID);
        setProgramEnrollments(response.data);
      } catch (error) {
        reportFatalError(error);
        setFetchError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgramEnrollments();
  }, [enterpriseUUID]);

  const updateCourseEnrollmentStatus = useCallback(({
    courseRunId,
    originalStatus,
    newStatus,
    savedForLater,
  }) => {
    const originalStatusCamelCased = _camelCase(originalStatus);
    const newStatusCamelCased = _camelCase(newStatus);

    const newCourseEnrollmentsByStatus = _cloneDeep(courseEnrollmentsByStatus);
    const courseEnrollmentToUpdate = newCourseEnrollmentsByStatus[originalStatusCamelCased].find(
      ce => ce.courseRunId === courseRunId,
    );
    newCourseEnrollmentsByStatus[
      originalStatusCamelCased
    ] = newCourseEnrollmentsByStatus[originalStatusCamelCased].filter(
      ce => ce.courseRunId !== courseRunId,
    );
    newCourseEnrollmentsByStatus[newStatusCamelCased].push({
      ...courseEnrollmentToUpdate,
      courseRunStatus: newStatus,
      savedForLater,
    });

    setCourseEnrollmentsByStatus(newCourseEnrollmentsByStatus);
  }, [courseEnrollmentsByStatus]);

  return {
    courseEnrollmentsByStatus,
    programEnrollments,
    isLoading,
    fetchError,
    updateCourseEnrollmentStatus,
  };
};
