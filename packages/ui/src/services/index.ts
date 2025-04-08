import envParsed from '@/envParsed'
import axios from 'axios'
import { TransactionService } from './TransactionService';

const instance = axios.create({
    baseURL: envParsed().API_URL,
});

instance.interceptors.request.use(config => {
  if (config.data) {
    config.data = JSON.parse(JSON.stringify(config.data, (_, value) => 
      typeof value === 'bigint' ? value.toString() : value
    ));
  }
  return config;
});

const transactionService = new TransactionService(instance);

export {
    transactionService
}