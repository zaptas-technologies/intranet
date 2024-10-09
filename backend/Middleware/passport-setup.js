
// const passport = require('passport');
// const config = require('../config/connect');
// const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

// passport.use(
//   new LinkedInStrategy(
//     {
//         clientID: config.linkedin.clientId,
//         clientSecret: config.linkedin.clientSecret,
//         callbackURL: 'http://162.241.149.204:3060/auth/linkedin/callback',
//       scope: ['email', 'profile', 'openid'],
//       state: true,
//     },
//     function (accessToken, refreshToken, profile, done) {
//       // asynchronous verification
//       process.nextTick(function () {
//         // Normally, you'd associate the LinkedIn account with a user in your database
//         return done(null, profile);
//       });
//     }
//   )
// );

const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

passport.use(
  new LinkedInStrategy(
    {
      clientID: '868f0az3l4fldl',
      clientSecret: 'WPL_AP1.DFuj8uvIAZbsMwL0./8Lxew==',
      callbackURL: 'http://162.241.149.204:3060/auth/linkedin/callback',
    //   scope: ['email', 'profile', 'openid','w_member_social'],
      scope: ['r_emailaddress', 'r_basicprofile'],
      state: true,
    },
    function (accessToken, refreshToken, profile, done) {
        req.session.accessToken = accessToken;
      // asynchronous verification
      process.nextTick(function () {
        // Normally, you'd associate the LinkedIn account with a user in your database
        return done(null, profile);
      });
    }
  )
);

passport.serializeUser(function (user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });
