// eslint-disable-next-line import/prefer-default-export

import { languageCodeToLabel } from '../../../utils/common';
import { SORT_OPTIONS_NAME } from '../../utils/constants';

export const LOADING_SCREEN_READER_TEXT = 'loading your edX benefits from your organization';

export const filterInitial = {
  learningPaths: [],
  languages: [],
  difficultyLevels: [],
  deliveryMethods: [],
  search: '',
};

export const filterGroups = [
  { id: 'learningPaths', groupName: 'Learning Path' },
  { id: 'languages', groupName: 'Language' },
  { id: 'difficultyLevels', groupName: 'Difficulty Level' },
];

/**
 * As we want to group skills like "Data Science 1" and "Data Science 2" into one group for the
 * end user, we need to have some mapping. We should discuss moving this solution to the backend
 * so it becomes easier to maintain (e.g. by adding skill_group field).
 */
export const filterOptionsExpanded = {
  learningPaths: {
    1: ['1'],
    2: ['2'],
    3: ['3', '10', '11', '12', '13'],
    4: ['4'],
    5: ['5'],
    6: ['6', '14'],
    7: ['7'],
    8: ['8'],
    9: ['9'],
  },
};

export const filterOptions = {
  learningPaths: [
    { value: '1', label: 'Product Management' },
    { value: '2', label: 'Software Development' },
    { value: '3', label: 'Data Science' },
    { value: '4', label: 'QA/QC Engineering' },
    { value: '5', label: 'Industrial Engineering' },
    { value: '6', label: 'Machine Learning' },
    { value: '7', label: 'Systems Engineering' },
    { value: '8', label: 'Software Architecture' },
    { value: '9', label: 'Test Engineering' },
  ],
  languages: [
    {
      value: 'en',
      label: languageCodeToLabel('en'),
    },
    {
      value: 'ja',
      label: languageCodeToLabel('ja'),
    },
  ],
  difficultyLevels: [
    {
      value: 'Basic',
      label: 'Basic',
    },
    {
      value: 'Intermediate',
      label: 'Intermediate',
    },
    {
      value: 'Advanced',
      label: 'Advanced',
    },
  ],
  deliveryMethods: [
    {
      value: 'self_paced',
      label: 'Self paced',
    },
    {
      value: 'face_to_face',
      label: 'Face to face',
    },
    {
      value: 'individual_lessons',
      label: 'Individual lessons',
    },
  ],
};

export const SHOW_LEARNING_PATH_FLAG = 'lms.filter.show_learning_path';

export const COURSE_DIFFICULTY_LEVEL = {
  BASIC: 'Basic',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export const courseSortOptions = [
  { value: SORT_OPTIONS_NAME.RECOMENDED, label: 'Dojo recommended' },
  { value: SORT_OPTIONS_NAME.ALPHABETICALLY, label: 'Alphabetically' },
  { value: SORT_OPTIONS_NAME.DIFFICULTY_ASC, label: 'Difficulty: Basic to Advanced' },
  { value: SORT_OPTIONS_NAME.DIFFICULTY_DESC, label: 'Difficulty: Advanced to Basic' },
];
