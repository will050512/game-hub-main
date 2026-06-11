export const mascotAssets = {
  rabbit: {
    idle: '/images/mascots/rabbit.svg',
    happy: '/images/mascots/rabbit-happy.svg',
    surprised: '/images/mascots/rabbit-surprised.svg',
    hurt: '/images/mascots/rabbit-hurt.svg',
    win: '/images/mascots/rabbit-win.svg',
    lose: '/images/mascots/rabbit-lose.svg',
  },
  panda: {
    idle: '/images/mascots/panda.svg',
  },
  frog: {
    idle: '/images/mascots/frog.svg',
  },
}

export const mascotConfig = {
  defaultMascot: 'rabbit',
  lobbyMascot: 'rabbit',
  useExpressions: true,
}

export const expressionTriggers = {
  scoreIncrease: 'happy',
  comboMilestone: 'happy',
  bossSpawn: 'surprised',
  playerDamaged: 'hurt',
  levelUp: 'win',
  gameOver: 'lose',
  idle: 'idle',
}