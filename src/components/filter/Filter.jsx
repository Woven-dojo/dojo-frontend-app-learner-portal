import { Form } from '@edx/paragon';
import React from 'react';
import PropTypes from 'prop-types';
import { SearchBar } from '@woven-dojo/dojo-frontend-common/dist';
import { filterGroups } from '../enterprise-user-subsidy/data/constants';
import closeIcon from '../../assets/icons/close.svg';

const getFilterGroups = (isShowLearningPathFlag) =>
  filterGroups.filter((filterGroup) => {
    if (!isShowLearningPathFlag) {
      return filterGroup.id !== 'learningPaths';
    }
    return filterGroup;
  });
const FilterGroup = ({ options, label, onChange, active = [] }) => (
  <div className="filter-group">
    <h4 className="filter-group__title">{label}</h4>
    {options.map((option) => (
      <div key={option.value} className="filter-group__item">
        <Form.Checkbox checked={active.includes(option.value)} onChange={onChange} value={option.value}>
          {option.label}
        </Form.Checkbox>
      </div>
    ))}
  </div>
);

export const Filter = ({ filter }) => {
  const handleChange = (group) => (event) => {
    filter.toggle(group, [event.target.value]);
  };
  const filtredFilterGroups = getFilterGroups(filter.isShowLearningPathFlag);
  const onSubmit = (value) => filter.search(value);

  return (
    <>
      <h3 className="mb-4">Search and filter</h3>
      <SearchBar onSubmit={onSubmit} btnSubmitTitle="Search" />
      <hr className="my-4" />
      {filtredFilterGroups.map((group, index) => (
        <React.Fragment key={group.id}>
          {index !== 0 && <hr />}
          <FilterGroup
            options={filter.options[group.id]}
            active={filter.current[group.id]}
            label={group.label}
            onChange={handleChange(group.id)}
          />
        </React.Fragment>
      ))}
    </>
  );
};

const ActiveFilterTag = ({ children, onClick }) => (
  <span className="active-filter__tag">
    {children}
    <button onClick={onClick} className="active-filter__icon" type="button">
      <img src={closeIcon} alt="Remove this filter" />
    </button>
  </span>
);

export const ActiveFilter = ({ filter }) => {
  const filtredFilterGroups = getFilterGroups(filter.isShowLearningPathFlag);
  const activeFilters = filtredFilterGroups.reduce(
    (accumulator, group) =>
      accumulator.concat(
        filter.options[group.id]
          .filter((option) => filter.current[group.id].includes(option.value))
          .map((item) => ({ ...item, group: group.id })),
      ),
    [],
  );
  const searchFilter = filter.current.search.length ? [{ value: filter.current.search, group: 'search' }] : [];
  const activeSearchAndFilters = [...activeFilters, ...searchFilter];

  const handleChange = (group, value) => {
    filter.toggle(group, [value]);
  };

  return (
    <div className="active-filter">
      {activeSearchAndFilters.map((item) =>
        item.group === 'search' ? (
          <ActiveFilterTag onClick={() => filter.removeSearch()} key={`search-${item.value}`}>
            {item.value}
          </ActiveFilterTag>
        ) : (
          <ActiveFilterTag onClick={() => handleChange(item.group, item.value)} key={`${item.group}-${item.value}`}>
            {item.label}
          </ActiveFilterTag>
        ),
      )}
    </div>
  );
};

const filterPropTypes = PropTypes.shape({
  toggle: PropTypes.func.isRequired,
  current: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])).isRequired,
  options: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string,
        label: PropTypes.string,
      }),
    ),
  ).isRequired,
  isShowLearningPathFlag: PropTypes.bool.isRequired,
});

Filter.propTypes = {
  filter: filterPropTypes.isRequired,
};

FilterGroup.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
  label: PropTypes.node.isRequired,
  onChange: PropTypes.func.isRequired,
  active: PropTypes.arrayOf(PropTypes.string),
};

FilterGroup.defaultProps = {
  active: [],
};

ActiveFilter.propTypes = {
  filter: filterPropTypes.isRequired,
};

ActiveFilterTag.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};
