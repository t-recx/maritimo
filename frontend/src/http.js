import axios from "axios";

const plain = axios.create({
  baseURL: process.env.REACT_APP_WEB_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default { plain };
