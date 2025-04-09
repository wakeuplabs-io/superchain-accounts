import axios from "axios";

export default async function handler() {
  await Promise.all([
    axios.post(`${process.env.API_URL}/points/submit`, {
      Headers: { "x-cron-key": process.env.CRONJOB_KEY },
    }),
    axios.post(`${process.env.API_URL}/badges/submit`, {
      Headers: { "x-cron-key": process.env.CRONJOB_KEY },
    }),
  ]);
}
