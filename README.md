# Planning Poker 🃏

A simple Planning Poker app built in node using express, socket.io and handlebars. 
### Real-time updates across multiple clients:
![alt showcase](https://github.com/bjornhenriksson/planning-poker/raw/master/showcase-x640.gif)

This app is built with node version 12.4.0.

If you have nvm(https://github.com/nvm-sh/nvm), run `nvm use` to get the correct node version or just download Node manually here:  https://nodejs.org/en/

### 1. Clone Repo to your local machine

### 2. Install dependencies:
`npm ci` or `npm install`

### 3. Start app:
`npm start`

This app doesn't include or implement any data storage and does only save your session data globally while your app is running(to simulate a JSON or document based DB), so: **your data will be gone when you kill the process.** But have fun playing around!

If you are interested in using this app with a DB I would say MongoDB or any similar No-SQL or JSON storage would be a perfect fit.
