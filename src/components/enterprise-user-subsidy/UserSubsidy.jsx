import React, { createContext, useCallback, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';
import { useQuery } from 'react-query';
import { LoadingSpinner } from '../loading-spinner';
import { useUrlParams } from '../utils/hooks';
import { fetchFeatureFlags } from './data/service';
import { useCatalogData, useLearningPathData } from './data/hooks';
import {
  LOADING_SCREEN_READER_TEXT,
  SHOW_LEARNING_PATH_FLAG,
  filterOptions,
  filterOptionsExpanded,
} from './data/constants';

export const UserSubsidyContext = createContext();

const UserSubsidy = ({ children }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const [queryFilters, handleQuery] = useUrlParams(['q', 's', 'fDiff', 'fLan', 'fLern']);
  const [catalogData, isLoadingCatalogData, requestCourse] = useCatalogData({
    enterpriseId: enterpriseConfig.uuid,
    filter: queryFilters,
    sorting: queryFilters.sort,
  });
  const [learningPathData, isLoadingLearningPathdata] = useLearningPathData();
  const featureFlagsData = useQuery('featureFlags', fetchFeatureFlags);
  const isShowLearningPathFlag = !featureFlagsData.isLoading ? featureFlagsData.data?.[SHOW_LEARNING_PATH_FLAG] : false;
  const isLoading = isLoadingCatalogData || isLoadingLearningPathdata || featureFlagsData.isLoading;

  const toggleFilter = useCallback(
    (group, options) => {
      let newFilterValues = [...queryFilters[group]];
      const allOptions = filterOptionsExpanded[group] ? filterOptionsExpanded[group][options] : options;
      allOptions.forEach((option) => {
        newFilterValues = newFilterValues.includes(option)
          ? newFilterValues.filter((value) => value !== option)
          : [...newFilterValues, option];
      });
      if (group === 'difficultyLevels') {
        handleQuery('fDiff', newFilterValues);
        return;
      }
      if (group === 'languages') {
        handleQuery('fLan', newFilterValues);
        return;
      }
      if (group === 'learningPaths') {
        handleQuery('fLern', newFilterValues);
      }
    },
    [queryFilters, handleQuery],
  );

  const clearFilter = useCallback(() => {
    ['q', 'fDiff', 'fLan', 'fLern'].map((queryParam) => handleQuery(queryParam, ''));
  }, [handleQuery]);

  const contextValue = useMemo(() => {
    if (isLoading) {
      return {};
    }
    return {
      catalogData, // deprecated, please use catalog.data
      learningPathData,
      catalog: {
        data: catalogData,
        filter: {
          isShowLearningPathFlag,
          current: queryFilters,
          options: filterOptions,
          toggle: toggleFilter,
          clear: clearFilter,
          search: (option) => handleQuery('q', option),
        },
        sorting: {
          option: queryFilters.sort,
          sort: (option) => handleQuery('s', option),
        },
        requestCourse,
      },
    };
  }, [
    isLoading,
    catalogData,
    learningPathData,
    queryFilters,
    isShowLearningPathFlag,
    requestCourse,
    toggleFilter,
    clearFilter,
    handleQuery,
  ]);

  if (isLoading) {
    return (
      <Container className="py-5">
        <LoadingSpinner screenReaderText={LOADING_SCREEN_READER_TEXT} />
      </Container>
    );
  }

  return (
    <>
      {/* Render the children so the rest of the page shows */}
      <UserSubsidyContext.Provider value={contextValue}>{children}</UserSubsidyContext.Provider>
    </>
  );
};

UserSubsidy.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserSubsidy;
