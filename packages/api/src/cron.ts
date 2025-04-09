import axios from "axios";

export default async function handler() {
  await Promise.all([
    axios.post(`${process.env.API_URL}/points/submit`, {
      Headers: { "x-api-key": process.env.API_KEY },
    }),
    axios.post(`${process.env.API_URL}/badges/submit`, {
      Headers: { "x-api-key": process.env.API_KEY },
    }),
  ]);
}
