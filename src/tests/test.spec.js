import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';

export const getContactsDuration = new Trend('get_contacts', true);
export const RateContentOK = new Rate('content_OK');

const status = {
  OK: 200,
  CREATED: 201
};

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.25'],
    get_contacts: ['p(90)<6800'],
    content_OK: ['rate>0.95']
  },
  stages: [
    { duration: '30s', target: 7 },
    { duration: '1m', target: 92 },
    { duration: '1m', target: 92 },
    { duration: '1m', target: 0 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const res = http.get("https://fakestoreapi.com", {
    headers: { 'Content-Type': 'application/json' }
  });

  getContactsDuration.add(res.timings.duration);
  RateContentOK.add(res.status === status.OK);

  check(res, {
    'GET Contacts - Status 200': () => res.status === status.OK
  });
}
