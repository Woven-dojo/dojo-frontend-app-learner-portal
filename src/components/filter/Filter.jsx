import { Form } from '@edx/paragon';
import React from 'react';
import PropTypes from 'prop-types';
import { SearchBar } from '@woven-dojo/dojo-frontend-ui';
import { filterGroups } from '../enterprise-user-subsidy/data/constants';
import closeIcon from '../../assets/icons/close.svg';

const getFilterGroups = (isShowLearningPathFlag) =>
  filterGroups.filter((filterGroup) => {
    if (!isShowLearningPathFlag) {
      return filterGroup.id !== 'learningPaths';
    }
    return filterGroup;
  });
const FilterGroup = ({ options, groupName, onChange, active = [] }) => (
  <div className="filter-group">
    <h4 className="filter-group__title">{groupName}</h4>
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
  return (
    <>
      <h3 className="mb-4">Search and filter</h3>
      <SearchBar
        onSubmit={(value) => filter.search(value)}
        value={filter.current.search || ''}
        btnSubmitTitle="Search"
      />
      <hr className="my-4" />
      {filtredFilterGroups.map((group, index) => (
        <React.Fragment key={group.id}>
          {index !== 0 && <hr />}
          <FilterGroup
            options={filter.options[group.id]}
            active={filter.current[group.id]}
            groupName={group.groupName}
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
      <img className="active-filter__icon__img" src={closeIcon} alt="Remove this filter" />
    </button>
  </span>
);

export const ActiveFilter = ({ filter }) => {
  const filtredFilterGroups = getFilterGroups(filter.isShowLearningPathFlag);
  const activeFilters = filtredFilterGroups.reduce(
    (accumulator, group) =>
      accumulator.concat(
        filter.options[group.id]
          .filter((option) => filter.current?.[group.id].includes(option.value))
          .map((item) => ({ ...item, group: group.id, groupName: group.groupName })),
      ),
    [],
  );

  if (filter.current?.search?.length) activeFilters.push({ value: filter.current.search, group: 'search' });

  const handleChange = (group, value) => {
    filter.toggle(group, [value]);
  };

  return (
    <div className="active-filter">
      {activeFilters.map((item, key) =>
        item.group === 'search' ? (
          <div key={`${item.group}-${item.value}`}>
            <span className="active-filter__group-name">Search:</span>
            <ActiveFilterTag onClick={() => filter.search('')} key={`search-${item.value}`}>
              {item.value}
            </ActiveFilterTag>
          </div>
        ) : (
          <div key={`${item.group}-${item.value}`}>
            {item.group !== activeFilters[key - 1]?.group && (
              <span className="active-filter__group-name">{item.groupName}:</span>
            )}
            <ActiveFilterTag onClick={() => handleChange(item.group, item.value)} key={`${item.group}-${item.value}`}>
              {item.label}
            </ActiveFilterTag>
          </div>
        ),
      )}
      {activeFilters.length !== 0 && (
        <button className="active-filter__clear-all" type="button" onClick={() => filter.clear()}>
          Clear All
        </button>
      )}
    </div>
  );
};

const filterPropTypes = PropTypes.shape({
  toggle: PropTypes.func.isRequired,
  current: PropTypes.objectOf(PropTypes.any).isRequired,
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
  groupName: PropTypes.node.isRequired,
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
