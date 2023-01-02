export const QUERY_PARAMS = {
  q: 'search',
  s: 'sort',
  fDiff: 'difficultyLevels',
  fLan: 'languages',
  fLern: 'learningPaths',
  fDel: 'deliveryMethods',
  pAct: 'paginCurrentPage',
  pPer: 'paginPerPage',
};

export const SORT_OPTIONS_NAME = {
  RECOMENDED: 'recomended',
  ALPHABETICALLY: 'alphabetically',
  DIFFICULTY_ASC: 'difficultyASC',
  DIFFICULTY_DESC: 'difficultyDESC',
};

export const queryInit = {
  search: '',
  sort: SORT_OPTIONS_NAME.RECOMENDED,
  difficultyLevels: [],
  languages: [],
  learningPaths: [],
  deliveryMethods: [],
  paginCurrentPage: 1,
  paginPerPage: 12,
};
