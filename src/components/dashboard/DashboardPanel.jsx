import React from 'react';
import PropTypes from 'prop-types';

export default function DashboardPanel({
  children, title, subtitle, headerAside, id, className,
}) {
  const isHeaderVisible = !!title || !!subtitle || !!headerAside;
  return (

    <div className={`dashboard-panel ${className}`} id={id}>
      {isHeaderVisible && (
        <div className="dashboard-panel-header">
          <div>
            <h3 className="dashboard-panel-header-title">{title}</h3>
            <p className="dashboard-panel-header-subtitle">{subtitle}</p>
          </div>
          <div>
            {headerAside}
          </div>
        </div>
      ) }

      <div className="dashboard-panel-main">
        {children}
      </div>
    </div>

  );
}

DashboardPanel.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  headerAside: PropTypes.node,
  id: PropTypes.string,
  className: PropTypes.string,
};

DashboardPanel.defaultProps = {
  title: null,
  subtitle: null,
  headerAside: null,
  id: null,
  className: null,
};
