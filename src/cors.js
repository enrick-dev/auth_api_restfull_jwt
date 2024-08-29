const corsOptions = (req, callback) => {
  let corsOptions;
  let isDomainAllowed =
    req.header('Origin') &&
    (req.header('Origin').endsWith(process.env.CORS_ORIGIN) || req.header('Origin').endsWith(process.env.CORS_ORIGIN_API));

  if (isDomainAllowed) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

const corsOptionsWebSocket = (origin, callback) => {
  let corsOptions;
  let isDomainAllowed = origin && origin.endsWith(process.env.CORS_ORIGIN);

  if (isDomainAllowed) {
    corsOptions = true
  } else {
    corsOptions = false
  }
  callback(null, corsOptions);
};

export { corsOptions, corsOptionsWebSocket };
