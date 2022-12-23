import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { IntlProvider } from 'react-intl';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { Footer, Header } from '@woven-dojo/dojo-frontend-ui';
import { useStylesForCustomBrandColors } from './data/hooks';
import { isDefinedAndNotNull } from '../../utils/common';
import './styles/Layout.scss';

export const TITLE_TEMPLATE = '%s - edX';
export const DEFAULT_TITLE = 'edX';

export default function Layout({ children }) {
  const { BASE_URL, LOGOUT_URL } = getConfig();
  const { enterpriseConfig, authenticatedUser } = useContext(AppContext);
  const { username } = authenticatedUser;
  const enterpriseDashboardLink = '/';
  const brandStyles = useStylesForCustomBrandColors(enterpriseConfig);

  const idpPresent = isDefinedAndNotNull(enterpriseConfig.identityProvider);
  // we insert the logout=true in this case to avoid the redirect back to IDP
  // which brings the user right back in, disallowing a proper logout
  const logoutHint = idpPresent ? `${encodeURIComponent('?')}logout=true` : '';
  const nextUrl = `${BASE_URL}${enterpriseDashboardLink}${logoutHint}`;
  const logoutUrl = `${LOGOUT_URL}?next=${nextUrl}`;
  return (
    <IntlProvider locale="en">
      <>
        <Helmet titleTemplate={TITLE_TEMPLATE} defaultTitle={DEFAULT_TITLE}>
          <html lang="en" />
          {brandStyles.map(({ key, styles }) => (
            <style key={key} type="text/css">
              {styles}
            </style>
          ))}
        </Helmet>
        <header className="header">
          <Header
            logoDestination={enterpriseDashboardLink}
            username={username}
            userMenu={[
              {
                label: enterpriseConfig.name,
                href: enterpriseDashboardLink,
              },
              {
                label: 'Sign out',
                href: logoutUrl,
              },
            ]}
          />
        </header>
        <main id="content">{children}</main>
        <Footer left={`Copyright ${new Date().getFullYear()} Dojo. All rights reserved`} />
      </>
    </IntlProvider>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
