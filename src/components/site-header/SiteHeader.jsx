import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { AppContext } from '@edx/frontend-platform/react';
import { Container, MediaQuery } from '@edx/paragon';

import AvatarDropdown from './AvatarDropdown';
import dojoLogo from '../../assets/images/dojo-logo.png';

export default function SiteHeader() {
  const { enterpriseConfig } = useContext(AppContext);

  const renderDojoLogo = () => (
    <Link to="/">
      <img
        className="d-block logo"
        src={dojoLogo}
        alt="Dojo logo"
      />
    </Link>
  );

  const renderEnterpriseLogo = () => (
    enterpriseConfig.branding.logo && (
      <Link to="/" data-testid="header-logo-link-id">
        <img
          className="d-block logo"
          src={enterpriseConfig.branding.logo}
          alt={`${enterpriseConfig.name} logo`}
          data-testid="header-logo-image-id"
        />
      </Link>
    )
  );

  const renderDesktopHeader = () => (
    <header className="site-header-desktop">
      <Container size="lg">
        <div className="nav-container position-relative d-flex align-items-center">
          {renderDojoLogo()}
          <nav aria-label="Main" className="nav main-nav" />
          <nav aria-label="Secondary" className="nav secondary-menu-container align-items-center ml-auto">
            {renderEnterpriseLogo()}
            <AvatarDropdown />
          </nav>
        </div>
      </Container>
    </header>
  );

  const renderMobileHeader = () => (
    <header
      aria-label="Main"
      className="site-header-mobile d-flex justify-content-between align-items-center shadow"
    >
      <div className="w-100 d-flex justify-content-start py-3 ml-2.5">
        {renderDojoLogo()}
      </div>
      <div className="w-100 d-flex justify-content-center " />
      <div className="w-100 d-flex justify-content-end align-items-center">
        {renderEnterpriseLogo()}
        <AvatarDropdown showLabel={false} />
      </div>
    </header>
  );

  return (
    <>
      <div className="position-absolute">
        <HashLink to="#content" className="skip-nav-link sr-only sr-only-focusable btn btn-primary mt-3 ml-2">
          Skip to main content
        </HashLink>
      </div>
      <MediaQuery maxWidth={768}>
        {renderMobileHeader()}
      </MediaQuery>
      <MediaQuery minWidth={769}>
        {renderDesktopHeader()}
      </MediaQuery>
    </>
  );
}
