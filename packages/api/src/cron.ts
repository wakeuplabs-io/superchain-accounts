import axios from "axios";

export const handler = async function () {
  const res = await Promise.all([
    axios.post(
      `${process.env.API_URL}points/submit`,
      undefined,
      { headers: { "x-cron-key": process.env.CRONJOB_KEY } }
    ),
    axios.post(
      `${process.env.API_URL}badges/submit`,
      undefined,
      { headers: { "x-cron-key": process.env.CRONJOB_KEY } }
    ),
  ]);

  console.log(res);

};
