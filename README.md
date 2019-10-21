# README

**Description of the problem and solution.**
The task requires the creation of a multiplayer Conway's Game Of Life. This repository contains the server and client side (web) implementation.

**How to test/build/deploy/use your solution. Link to the hosted application if applicable (heroku/netlify).**
_Test_: execute `npm run test` in client repo or main repo
_build_: execute `npm run build` in client repo
_deploy_: Deploy on [heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app)
_Use_: Locally or on http://secret-forest-30430.herokuapp.com/
Locally:

- 1.  `npm install` in main repo and client repo.
- 2.  `npm run build` in client repo
- 3.  `npm run dev` in main repo.

**Reasoning behind your technical choices, including architectural.**
I decided to go with the FullStack Javascript approach despite having no experience in it. This has been an insightful experience.

The main choices were obvious then. React for FrontEnd, Express for BackEnd. SocketIO as WS library provided great convenience.

Architecture of repo is simple: Client Repo within main Server Repo. Just Style preference. Could have made two folders of Server & Client instead.

**Trade-offs you might have made, anything you left out, or what you might do differently if you were to spend additional time on the project.**
One Major tradeoff made right away was that ideally the Game Component would receive events from server and pass the changes down to the respective Cell Component. I tried doing this initially but couldn't get it to work properly.

I decided that each Cell component would receive all events and change if data pertains to it. So the first trade-off is between convenience and scalability as each Cell Component runs through all the data received from events.

If I were to spend additional time on the project, I would create better UX by adding intricate styles or animations.

**TODO**

Tests for remaining components.
Game Rooms but that is just unnecessary...

**Things I wish I knew before starting this project**
Although this has been an interesting project no doubt, here are the things I wish I knew before I committed to it:

- "Poor knowledge of version control systems. Source code (if applicable) is not under version control. Temporary/redundant/binary files (`.DS_Store`, `.idea`, `.vscode`) are in repository or result archive." I had no idea this would be a requirement. ~~I committed .vscode~~
- "Underestimation of quality standards. We would carefully assess your submission including commit messages, code comments, redundant/commented code blocks, code style and mention them in the report." ~~Commit messages are an unhelpful mess~~ Again no idea this would be scrutinized.

Reasons for blunder is I did not think I'd submit the code/github repo link.
