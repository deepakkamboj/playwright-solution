/* eslint-disable no-console */
/* eslint-disable jest/require-top-level-describe */
//jest.setTimeout(60000);
//if (process.env.RUN_TYPE === "runner") {
const retries = Number(process.env.RETRIES) || 2;
jest.retryTimes(retries);
//}
