Index

1.0 We are applying JWT (jsonwebtoken) in careercode project that's why to clearly understand the jwt we have delete the all comment to understand how to apply jwt.

2.0 How jwt works?
when client is call any api the server sent a token (AccessToken) and in client side the token is saved using HTTPOnlyCookies (Best method) or localStorage (not a best method). When user want to get the user's data like jobsApply etc every time cookies is sent to server. then server decide if the user is authentic it will send the data. sometimes another token is also sent which is called refresh token. This refresh token works by renew the access token.

3.0 How to install?
// go to jwt website => Libraries => filter to node.js. Now copy the npm install jsonwebtoken or u can go to the view repo for setup documentation and run in server side. also install cookie-parser by npm i cookie-parser and import it in 3.1.

4.0 My requirement is after install jsonwebtoken import jwt from repo documentation

5.0 Now our requirement is to verify the token. That's why created a custom middleware which takes 3 parameter req, res, next. এখানে logger দিয়ে check করা হচ্ছে যে api টা logger টাকে hit করে কিনা।

6.0 finally we are going to verify the token

7.0 before this token verification we have to verify that the token is exist or not
