const dev = "http://localhost:8080";
const prod = "https://pmapi.krivatechnolabs.com";

export const baseURL =
  window.location.hostname.split(":")[0] === "localhost" ||
    window.location.hostname.includes("192")
    ? dev
    : prod;