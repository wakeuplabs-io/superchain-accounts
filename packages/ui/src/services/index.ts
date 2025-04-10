import envParsed from "@/envParsed";
import axios from "axios";
import { TransactionService } from "./transaction";
import { UserService } from "./user";

const instance = axios.create({
  baseURL: envParsed().API_URL,
});

instance.interceptors.request.use(config => {
  if (config.data) {
    config.data = JSON.parse(JSON.stringify(config.data, (_, value) => 
      typeof value === "bigint" ? value.toString() : value
    ));
  }
  return config;
});

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      return Promise.reject(new Error(error.response.data.message));
    } else if (error.request) {
      return Promise.reject(error.request);
    } else {
      return Promise.reject(error.message);
    }
    
  }
);


const transactionService = new TransactionService(instance);
const userService = new UserService(instance);

export {
  transactionService,
  userService,
};