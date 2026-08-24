let apiCallsToday = 0;
let apiCallsDate = new Date().toDateString();

export function trackApiCall() {
  const today = new Date().toDateString();
  if (today !== apiCallsDate) {
    apiCallsToday = 0;
    apiCallsDate = today;
  }
  apiCallsToday++;
}

export function getApiCallsToday() {
  return apiCallsToday;
}
