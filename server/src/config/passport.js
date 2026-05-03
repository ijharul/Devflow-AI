const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

const handleOAuthUser = async ({ email, name, providerId, providerField, accessToken }) => {
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      password: `oauth_${providerId}_${Math.random().toString(36).slice(2)}`,
      [providerField]: providerId,
      ...(providerField === 'githubId' && { githubAccessToken: accessToken }),
    });
  } else {
    let changed = false;
    if (!user[providerField]) { user[providerField] = providerId; changed = true; }
    if (providerField === 'githubId') { user.githubAccessToken = accessToken; changed = true; }
    if (changed) await user.save();
  }
  return user;
};

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://devflow-ai-91vt.onrender.com/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email returned from Google'), null);
        const user = await handleOAuthUser({ email, name: profile.displayName, providerId: profile.id, providerField: 'googleId' });
        return done(null, user);
      } catch (err) { return done(err, null); }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'https://devflow-ai-91vt.onrender.com/api/github/auth/callback',
      scope: ['user:email', 'repo'],
    },
    async (accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `github_${profile.id}@devflow.ai`;
        const user = await handleOAuthUser({
          email,
          name: profile.displayName || profile.username,
          providerId: profile.id,
          providerField: 'githubId',
          accessToken,
        });
        return done(null, user);
      } catch (err) { return done(err, null); }
    }
  )
);

module.exports = passport;
