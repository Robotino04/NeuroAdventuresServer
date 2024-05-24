# Neuro Adventures! server

The server code for the Neuro Adventures! leaderboard.

# Running
To run this code from a newly cloned repo, use the following commands.
``` sh
npm install
npm run dev -- --host
```

# Deploying
``` sh
npm install
npm run build

cd build/
node index.js # starts the server on port 3000. can be changed with the PORT env variable
```