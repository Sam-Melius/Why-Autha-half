const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const UserService = require('../services/UserService');
const { sign } = require('../utils/jwt');

const ONE_DAY = 1000 * 60 * 60 * 24;

module.exports = Router()
  .get('/login', async (req, res) => {
    // TODO: Kick-off the github oauth flow
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user&redirect_uri=http://localhost:7890/api/v1/github/login/callback`
    );
  })
  .get('/login/callback', async (req, res, next) => {
    /*
      TODO:
     * get code
     * exchange code for token
     * get info from github about user with token
     * get existing user if there is one
     * if not, create one
     * create jwt
     * set cookie and redirect
     */
    try {
      const user = await UserService.create(req.query.code);
      res.cookie(process.env.COOKIE_NAME, sign(user), {
        httpOnly: true,
        maxAge: ONE_DAY,

      })
        .redirect('/');
    } catch (error) {
      next(error);
    }
    
    
  }
  )
  .get('/dashboard', authenticate, async (req, res) => {
    // require req.user
    // get data about user and send it as json
    res.json(req.user);
  })
  .delete('/sessions', (req, res) => {
    res
      .clearCookie(process.env.COOKIE_NAME)
      .json({ success: true, message: 'Signed out successfully!' });
  });
