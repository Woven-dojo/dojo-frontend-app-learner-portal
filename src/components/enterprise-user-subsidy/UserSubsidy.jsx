import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';

import { LoadingSpinner } from '../loading-spinner';

import { useCatalogData, useLearningPathData, useShowLearningPathFlagData } from './data/hooks';
import { LOADING_SCREEN_READER_TEXT, filterInitial, filterOptions, filterOptionsExpanded } from './data/constants';

export const UserSubsidyContext = createContext();

const UserSubsidy = ({ children }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const [catalogFilter, setCatalogFilter] = useState(filterInitial);
  const [catalogData, isLoadingCatalogData, requestCourse] = useCatalogData({
    enterpriseId: enterpriseConfig.uuid,
    filter: catalogFilter,
  });
  const [learningPathData, isLoadingLearningPathdata] = useLearningPathData();

  const [showLearningPathFlagData, isLoadingShowLearningPathFlagData] = useShowLearningPathFlagData();

  const isShowLearningPathFlag = showLearningPathFlagData['lms.filter.show_learning_path'];

  const isLoading = isLoadingCatalogData || isLoadingLearningPathdata || isLoadingShowLearningPathFlagData;

  const toggleFilter = useCallback(
    (group, options) => {
      if (!isShowLearningPathFlag) {
        return {};
      }
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
      return {};
    },
    [isShowLearningPathFlag],
  );
  const contextValue = useMemo(() => {
    if (isLoading) {
      return {};
    }
    return {
      catalogData, // deprecated, please use catalog.data
      learningPathData,
      catalog: {
        data: catalogData,
        filter: isShowLearningPathFlag
          ? {
              current: catalogFilter,
              options: filterOptions,
              toggle: toggleFilter,
            }
          : null,
        requestCourse,
      },
    };
  }, [isLoading, catalogData, learningPathData, catalogFilter, requestCourse, isShowLearningPathFlag, toggleFilter]);

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
