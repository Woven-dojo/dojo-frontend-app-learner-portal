import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';
import { useQuery } from 'react-query';
import { LoadingSpinner } from '../loading-spinner';
import { fetchFeatureFlags } from './data/service';
import { useCatalogData, useLearningPathData } from './data/hooks';
import {
  LOADING_SCREEN_READER_TEXT,
  SHOW_LEARNING_PATH_FLAG,
  filterInitial,
  filterOptions,
  filterOptionsExpanded,
} from './data/constants';

export const UserSubsidyContext = createContext();

const UserSubsidy = ({ children }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const [catalogFilter, setCatalogFilter] = useState(filterInitial);
  const [catalogData, isLoadingCatalogData, requestCourse] = useCatalogData({
    enterpriseId: enterpriseConfig.uuid,
    filter: catalogFilter,
  });
  const [learningPathData, isLoadingLearningPathdata] = useLearningPathData();
  const featureFlagsData = useQuery('featureFlags', fetchFeatureFlags);
  const isShowLearningPathFlag = !featureFlagsData.isLoading ? featureFlagsData.data?.[SHOW_LEARNING_PATH_FLAG] : false;

  const isLoading = isLoadingCatalogData || isLoadingLearningPathdata || featureFlagsData.isLoading;

  const toggleFilter = useCallback((group, options) => {
    setCatalogFilter((currentFilter) => {
      let newFilterValues = [...currentFilter[group]];
      const allOptions = filterOptionsExpanded[group] ? filterOptionsExpanded[group][options] : options;
      allOptions.forEach((option) => {
        newFilterValues = newFilterValues.includes(option)
          ? newFilterValues.filter((value) => value !== option)
          : [...newFilterValues, option];
      });
      return {
        ...currentFilter,
        [group]: newFilterValues,
      };
    });
  }, []);

  const clearFilter = () => setCatalogFilter(filterInitial);

  const searchFilter = useCallback((options) => {
    setCatalogFilter((currentFilter) => ({
      ...currentFilter,
      search: options,
    }));
  }, []);

  const removeSearchFilter = useCallback(() => {
    setCatalogFilter((currentFilter) => ({
      ...currentFilter,
      search: '',
    }));
  }, []);

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
          current: catalogFilter,
          options: filterOptions,
          toggle: toggleFilter,
          clear: clearFilter,
          search: searchFilter,
          removeSearch: removeSearchFilter,
        },
        requestCourse,
      },
    };
  }, [
    isLoading,
    catalogData,
    learningPathData,
    catalogFilter,
    isShowLearningPathFlag,
    requestCourse,
    toggleFilter,
    searchFilter,
    removeSearchFilter,
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
