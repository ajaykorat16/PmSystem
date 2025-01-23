const dev = "http://localhost:8080";
const prod = "http://143.110.244.228:8081";

export const baseURL =
  window.location.hostname.split(":")[0] === "localhost" ||
  window.location.hostname.includes("192")
    ? dev
    : prod;