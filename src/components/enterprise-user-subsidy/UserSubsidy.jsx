import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
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
  SORT_OPTIONS_NAME,
  filterInitial,
  filterOptions,
  filterOptionsExpanded,
} from './data/constants';

export const UserSubsidyContext = createContext();

const convertToArray = (value) => {
  if (value.length > 0) {
    return typeof value === 'string' ? value.split(',') : value;
  }
  return [];
};

const UserSubsidy = ({ children }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const [searchUrl, setSearchUrl] = useUrlParams('q');
  const [sortingUrl, setSortingUrl] = useUrlParams('s');
  const [difficultyLevelsUrl, setDifficultyLevelsUrl] = useUrlParams('f_dif');
  const [languagesUrl, setLanguagesUrl] = useUrlParams('f_lan');
  const [learningPathsUrl, setLearningPathsUrl] = useUrlParams('f_lern');
  const [catalogFilter, setCatalogFilter] = useState(filterInitial);
  const [sortingOption, setSortingOption] = useState(sortingUrl || SORT_OPTIONS_NAME.RECOMENDED);
  const [catalogData, isLoadingCatalogData, requestCourse] = useCatalogData({
    enterpriseId: enterpriseConfig.uuid,
    filter: catalogFilter,
    sorting: sortingOption,
  });
  const [learningPathData, isLoadingLearningPathdata] = useLearningPathData();
  const featureFlagsData = useQuery('featureFlags', fetchFeatureFlags);
  const isShowLearningPathFlag = !featureFlagsData.isLoading ? featureFlagsData.data?.[SHOW_LEARNING_PATH_FLAG] : false;

  const isLoading = isLoadingCatalogData || isLoadingLearningPathdata || featureFlagsData.isLoading;

  useEffect(() => {
    setCatalogFilter((currentFilter) => ({
      ...currentFilter,
      search: searchUrl,
      difficultyLevels: convertToArray(difficultyLevelsUrl),
      languages: convertToArray(languagesUrl),
      learningPaths: convertToArray(learningPathsUrl),
    }));
  }, [searchUrl, difficultyLevelsUrl, languagesUrl, learningPathsUrl]);

  const setFilterUrl = useCallback(
    (group, value) => {
      if (group === 'difficultyLevels') {
        setDifficultyLevelsUrl(value);
        return;
      }
      if (group === 'languages') {
        setLanguagesUrl(value);
        return;
      }
      if (group === 'learningPaths') {
        setLearningPathsUrl(value);
      }
    },
    [setDifficultyLevelsUrl, setLanguagesUrl, setLearningPathsUrl],
  );

  const toggleFilter = useCallback(
    (group, options) => {
      setCatalogFilter((currentFilter) => {
        let newFilterValues = [...currentFilter[group]];
        const allOptions = filterOptionsExpanded[group] ? filterOptionsExpanded[group][options] : options;
        allOptions.forEach((option) => {
          newFilterValues = newFilterValues.includes(option)
            ? newFilterValues.filter((value) => value !== option)
            : [...newFilterValues, option];
        });
        setFilterUrl(group, newFilterValues);
        return {
          ...currentFilter,
          [group]: newFilterValues,
        };
      });
    },
    [setFilterUrl],
  );

  const clearFilter = useCallback(() => {
    setSearchUrl('');
    setDifficultyLevelsUrl('');
    setLanguagesUrl('');
    setLearningPathsUrl('');
    setCatalogFilter(filterInitial);
  }, [setSearchUrl, setDifficultyLevelsUrl, setLanguagesUrl, setLearningPathsUrl, setCatalogFilter]);

  const searchFilter = useCallback(
    (options) => {
      setCatalogFilter((currentFilter) => ({
        ...currentFilter,
        search: options,
      }));
      setSearchUrl(options);
    },
    [setSearchUrl],
  );

  const removeSearchFilter = useCallback(() => {
    setCatalogFilter((currentFilter) => ({
      ...currentFilter,
      search: '',
    }));
    setSearchUrl('');
  }, [setSearchUrl]);

  const toggleSort = useCallback(
    (option) => {
      setSortingOption(option);
      setSortingUrl(option);
    },
    [setSortingOption, setSortingUrl],
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
        filter: {
          isShowLearningPathFlag,
          current: catalogFilter,
          options: filterOptions,
          toggle: toggleFilter,
          clear: clearFilter,
          search: searchFilter,
          removeSearch: removeSearchFilter,
        },
        sorting: {
          option: sortingOption,
          sort: toggleSort,
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
    sortingOption,
    clearFilter,
    toggleSort,
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
