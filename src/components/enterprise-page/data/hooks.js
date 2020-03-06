import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { fetchEntepriseCustomerConfig } from './service';

const initialConfig = {
  name: undefined,
  slug: undefined,
  uuid: undefined,
  contactEmail: undefined,
  branding: {
    logoUrl: undefined,
    banner: {
      borderColor: '#007D88',
      backgroundColor: '#D7E3FC',
    },
  },
};

// eslint-disable-next-line import/prefer-default-export
export function useEnterpriseCustomerConfig() {
  const { enterpriseSlug } = useParams();
  const [enterpriseConfig, setEnterpriseConfig] = useState(initialConfig);

  useEffect(() => {
    fetchEntepriseCustomerConfig(enterpriseSlug)
      .then((response) => {
        const { results } = camelCaseObject(response.data);
        const config = results.pop();
        if (config) {
          const {
            name,
            uuid,
            slug,
            contactEmail,
            brandingConfiguration: {
              logo,
              bannerBackgroundColor,
              bannerBorderColor,
            },
          } = config;
          setEnterpriseConfig({
            name,
            uuid,
            slug,
            contactEmail,
            branding: {
              logo,
              banner: {
                backgroundColor: bannerBackgroundColor || initialConfig.branding.banner.backgroundColor,
                borderColor: bannerBorderColor || initialConfig.branding.banner.borderColor,
              },
            },
          });
        }
      })
      .catch((error) => {
        logError(new Error(error));
      });
  }, [enterpriseSlug]);

  return [enterpriseConfig];
}
