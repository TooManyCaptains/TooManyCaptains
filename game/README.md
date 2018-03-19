## What's in here?

Thanks for your interest in the project! The game is still in pre-alpha phase, and many things do not work yet. Moreover, the game is designed to be used with custom hardware controllers, and played by 3+ people, so you might not have much fun playing with it by yourself!

Our hope is to open source all the hardware and provide detailed instructions on how to set up your own version of the game. If you're interested in learning more and staying up to date, please sign up for our mailing list at http://www.toomanycaptains.com/.

...having said that, if you want to try to play with the game yourself, we've built a fully-functional (if cumbersome) software "simulator" for the various hardware-controlled aspects of the game. You can access that here if you want to poke around: http://simulator.toomanycaptains.com/

## Getting set up

1.  Install Node.JS and [yarn](https://yarnpkg.com/en/): `brew install yarn`

2.  Install project dependencies: `yarn install`

## Developing locally

1.  `yarn hack`
2.  Open http://localhost:3000

## Deploying to http://play.toomanycaptains.com

1.  `yarn deploy`

### Setting up the controller

1.  `sudo dd bs=1m if=starship_controller_mar_18_2018.img of=/dev/diskX`
