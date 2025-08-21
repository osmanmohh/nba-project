const config = {
  development: {
    enableScrapers: true,
    scraperInterval: 60000, // 1 minute
  },
  production: {
    enableScrapers: false,
    scraperInterval: null,
  },
};

const env = process.env.NODE_ENV || "development";
module.exports = config[env];
