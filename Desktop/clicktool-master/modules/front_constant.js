var moment = require('moment');
var momentTz = require('moment-timezone');

//url parameters
// const BASE_URL = 'http://localhost:3000/';
const BASE_URL = 'http://35.181.25.39:3000/';
//const BASE_URL = "https://www.wissenx.com/";
//const BASE_URL = "https://dev.wissenx.com/";

// const BASE_URL_ADMIN = "http://localhost:3000/admin/";
const BASE_URL_ADMIN = 'http://35.181.25.39:3000/';
//const BASE_URL_ADMIN = "https://www.wissenx.com/admin/";
//const BASE_URL_ADMIN = "https://dev.wissenx.com/admin/";

//const COMPLIANCE_TEST_URL = "https://www.classmarker.com/online-test/start/?quiz=h7e57fb7da371830&iframe=1&cm_user_id=";
const COMPLIANCE_TEST_URL = 'https://www.classmarker.com/online-test/start/?quiz=den58ff1150d8de7&iframe=1&cm_user_id=';

// mentor listing constants
const LISTINGPERPAGE = '10';
// mentor detail page, review listing constants
const REVIEWCOUNT = '10';

//Help Email for Wissenx
const HELP_EMAIL = 'support@wissenx.com';
const INFO_EMAIL = 'info@wissenx.com';
const CONNECT_EMAIL = 'connect@wissenx.com';

// social Login
// google api key
const GOOGLE_API_KEY = '1010642876159-t0vl5hm681mmns0l1r6fedjsfoj4fq01.apps.googleusercontent.com';

// linkedin api key
const LINKEDIN_API_KEY = '81h87vn0e8nfxo';

const MAILCONTEXTBG = 'rgba(246, 246, 246, 0.34)';

const MESSAGECONTEXTBG = 'rgb(181, 234, 255)';

// admin email
const ADMIN_EMAIL = 'wissenxadmin@wissenx.com';

module.exports = {
  ACCESSURL: BASE_URL,
  ACCESSURL_ADMIN: BASE_URL_ADMIN,
  COMPLIANCE_TEST_URL: COMPLIANCE_TEST_URL,
  LISTINGPERPAGE: LISTINGPERPAGE,
  GOOGLE_API_KEY: GOOGLE_API_KEY,
  LINKEDIN_API_KEY: LINKEDIN_API_KEY,
  HELP_EMAIL: HELP_EMAIL,
  INFO_EMAIL: INFO_EMAIL,
  CONNECT_EMAIL: CONNECT_EMAIL,
  REVIEWCOUNT: REVIEWCOUNT,
  MAILCONTEXTBG: MAILCONTEXTBG,
  MESSAGECONTEXTBG: MESSAGECONTEXTBG,
  ADMIN_EMAIL: ADMIN_EMAIL
};
