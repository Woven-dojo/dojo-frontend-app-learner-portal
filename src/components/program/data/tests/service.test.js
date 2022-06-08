import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import ProgramService from '../service';

const ENTERPRISE_UUID = 'c2b2cbda-c25e-4efd-a845-7579a3f0258e';
const PROGRAM_UUID = '28b32b5a-ad61-403d-87b8-8cde04ff696d';
const APP_CONFIG = {
  USE_API_CACHE: true,
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
};
const PROGRAM_API_ENDPOINT = `${APP_CONFIG.DISCOVERY_API_BASE_URL}/api/v1/programs/${PROGRAM_UUID}/`;
const COURSE_KEY = 'edX+DemoX';
const COURSE_KEY2 = 'edX+WowX';
const PROGRAM_DATA = {
  courses: [
    {
      enterpriseHasCourse: true,
      key: COURSE_KEY,
      uuid: '12345678-be4c-4e1d-0000-2d60323db911',
      title: 'Introduction to Cloud Computing',
      courseRuns: [
        {
          key: 'course-v1:edX+DemoX+2T2020',
          uuid: '12345678-be4c-4e1d-0000-2d60323db911',
          title: 'Introduction to Cloud Computing',
          shortDescription: 'course run description',
          start: '2020-07-21T16:00:00Z',
        },
      ],
      shortDescription: 'course description',
    },
    {
      enterpriseHasCourse: true,
      key: COURSE_KEY2,
      uuid: '12345678-be4c-4e1d-0000-2d60323db911',
      title: 'Introduction to Cloud Computing',
      courseRuns: [
        {
          key: 'course-v1:edX+DemoX+2T2020',
          uuid: '12345678-be4c-4e1d-0000-2d60323db911',
          title: 'Introduction to Cloud Computing',
          shortDescription: 'course run description',
          start: '2020-07-21T16:00:00Z',
        },
      ],
      shortDescription: 'course description',
    },
  ],
  catalogContainsProgram: true,
};

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onGet(PROGRAM_API_ENDPOINT).reply(200, PROGRAM_DATA);
jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => (APP_CONFIG),
}));

describe('course enrollments service', () => {
  beforeEach(() => {
    axiosMock.resetHistory();
  });

  it('fetches program data with program uuid belongs to enterprise', async () => {
    const queryParams = new URLSearchParams({
      program_uuids: PROGRAM_UUID,
    });
    const CONTAINS_CONTENT_ITEMS_API_ENDPOINT = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${ENTERPRISE_UUID}/contains_content_items/?${queryParams.toString()}`;
    axiosMock.onGet(CONTAINS_CONTENT_ITEMS_API_ENDPOINT).reply(200, { contains_content_items: true });

    const programService = new ProgramService({ enterpriseUuid: ENTERPRISE_UUID, programUuid: PROGRAM_UUID });
    const { data } = await programService.fetchProgramDetails();
    expect(axiosMock.history.get[0].url).toBe(PROGRAM_API_ENDPOINT);
    const expectedResponse = camelCaseObject(PROGRAM_DATA);
    expectedResponse.courses[0].enterpriseHasCourse = true;
    expectedResponse.courses[1].enterpriseHasCourse = true;
    expect(data).toEqual(expectedResponse);
  });

  it('fetches program data with partial program uuid does not belongs to enterprise', async () => {
    // axiosMock.resetHistory();

    const paramsWithProgramUuid = new URLSearchParams({
      program_uuids: PROGRAM_UUID,
    });
    const paramsWithCourseUuid = new URLSearchParams({
      course_run_ids: COURSE_KEY,
    });
    const paramsWithCourse2Uuid = new URLSearchParams({
      course_run_ids: COURSE_KEY2,
    });
    const CONTAINS_CONTENT_ITEMS_API_ENDPOINT_1 = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${ENTERPRISE_UUID}/contains_content_items/?${paramsWithProgramUuid.toString()}`;
    axiosMock.onGet(CONTAINS_CONTENT_ITEMS_API_ENDPOINT_1).reply(200, { contains_content_items: false });

    const CONTAINS_CONTENT_ITEMS_API_ENDPOINT_2 = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${ENTERPRISE_UUID}/contains_content_items/?${paramsWithCourseUuid.toString()}`;
    axiosMock.onGet(CONTAINS_CONTENT_ITEMS_API_ENDPOINT_2).reply(200, { contains_content_items: true });

    const CONTAINS_CONTENT_ITEMS_API_ENDPOINT_3 = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${ENTERPRISE_UUID}/contains_content_items/?${paramsWithCourse2Uuid.toString()}`;
    axiosMock.onGet(CONTAINS_CONTENT_ITEMS_API_ENDPOINT_3).reply(200, { contains_content_items: false });

    const programService = new ProgramService({ enterpriseUuid: ENTERPRISE_UUID, programUuid: PROGRAM_UUID });
    const { data } = await programService.fetchProgramDetails();
    const expectedResponse = camelCaseObject(PROGRAM_DATA);
    expectedResponse.courses[0].enterpriseHasCourse = true;
    expectedResponse.courses[1].enterpriseHasCourse = true;
    expect(axiosMock.history.get[0].url).toBe(PROGRAM_API_ENDPOINT);
    expect(data).toEqual(camelCaseObject(expectedResponse));
  });
});
