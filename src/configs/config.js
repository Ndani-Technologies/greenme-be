module.exports = {
  local: {
    frontendUrl: "http://localhost:3000",
    entity: "localhost-dev",
    // assert: 'http://localhost:5000/assert',
    assert: "http:localhost:5000/user/login/callback",
    domain: "localhost",
  },
  dev: {
    frontendUrl: "https://dev.fleetforum.org",
    entity: "backend.dev.fleetforum.org",
    assert: "https://backend.dev.fleetforum.org/assert",
    domain: ".fleetforum.org",
  },
  live: {
    frontendUrl: "https://cleanfleet.fleetforum.org",
    entity: "cleanfleet-backend",
    assert: "https://backend.cleanfleet.fleetforum.org/assert",
    domain: ".fleetforum.org",
  },
};
