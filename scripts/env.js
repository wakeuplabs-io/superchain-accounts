function handler(outputs, serverless, options) {
  console.log({ outputs });
  return outputs;
}
 
module.exports = handler;