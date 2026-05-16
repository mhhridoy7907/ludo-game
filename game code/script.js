class Page {

  constructor(
  { canvas, form, board, moveButtons, playersContainer, status, dice, 
  diceButton, moveScoreContainer, moveScoreTitle, moveScore, options } = {}
  ) {
    this.canvas = canvas;
    this.form = form;
    this.board = board;
    this.moveButtons = moveButtons;
    this.playersContainer = playersContainer;
    this.players = [];
    this.playerScores = {};
    this.status = status;
    this.dice = dice;
    this.diceButton = diceButton;
    this.moveScoreContainer = moveScoreContainer;
    this.moveScoreTitle = moveScoreTitle;
    this.moveScore = moveScore;
    this.options = options;
    this.squares = {};
    [...board.getElementsByClassName('square')].forEach((sq) => {
      this.squares[sq.id] = sq;
    });
    this.setupEvents();
    this.updateForm();
    this.adjustCanvas();
  };

  setupEvents() {
    window.addEventListener('resize', this.adjustCanvas.bind(this));
    this.options.showCoordinates.addEventListener('change', this.toggleCoordinates.bind(this));
    for (let i = 0; i < 4; i ++) {
      this.form.playerColors[i].addEventListener('input', this.updateFormPlayer.bind(this, i));
      this.form.playerNames[i].addEventListener('input', this.updateFormPlayer.bind(this, i));
    }
    this.form.submit.addEventListener('click', (event) => {
      event.preventDefault();
      this.formSubmit();
    });
  };

  formValid() {
    let n_players = 0;
    let colors = {
      'red': 0,
      'green': 0,
      'blue': 0,
      'yellow': 0
    };
    this.form.data.forEach((p) => {
      if (p.name.length > 0) {
        n_players += 1;
        colors[p.color] += 1;
      }
    });
    if (n_players >= 2) {
      if (colors['red'] < 2 && colors['green'] < 2 && colors['blue'] < 2 && colors['yellow'] < 2) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  updateFormPlayer(i) {
    const name = this.form.playerNames[i];
    const color = this.form.playerColors[i];
    const head = this.form.playerHeaders[i];
    this.form.data[i].name = name.value;
    this.form.data[i].color = color.value;
    this.form.submit.disabled = !this.formValid();
    head.classList.remove('score-red', 'score-yellow', 'score-green', 'score-blue');
    head.classList.add(`score-${color.value}`);
  };

  updateForm() {
    for (let i = 0; i <= 3; i ++) {
      this.updateFormPlayer(i);
    };
  };

  formSubmit() {
    this.form.container.style.display = 'none';
    const game = new Game(this);
    this.form.data.forEach((p) => {
      if (p.name.length > 0) {
        if (game.botNames.includes(p.name.toUpperCase())) {
          game.players.push(new Bot(p.name, p.color, game));
        } else { 
          if (game.randomNames.includes(p.name.toUpperCase())) {
            game.players.push(new Random(p.name, p.color, game));
          } else {
            game.players.push(new Player(p.name, p.color, game));
          }
        }
        this.addPlayer(p.name, p.color);
      }
    });
    game.start();
  };

  adjustCanvas() {
    this.canvas.style.left = this.board.offsetLeft+'px';
    this.canvas.style.top = this.board.offsetTop+'px';
  };

  updateStatus(message, color) {
    this.status.style.paddingLeft = '10px';
    this.status.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    this.status.style.borderLeft = '5px solid';
    this.status.style.borderRadius = '20px';
    this.status.style.borderColor = color;
    this.status.innerText = message;
  };

  getSquarePosition(sqId) {
    const sq = this.squares[sqId.toString()];
    return [sq.offsetLeft - this.canvas.offsetLeft + 13, sq.offsetTop - this.canvas.offsetTop + 14];
  };

  openTokenSelection(n) {
    const button = this.moveButtons[n];
    button.disabled = false;
    button.style.display = 'block';
  };

  closeTokenSelection() {
    this.moveButtons.forEach((b) => {
      b.disabled = true;
      b.style.display = 'none';
    });
  };

  addPlayer(name, color) {
    const player = document.createElement('div');
    player.innerText = name + ': ';
    const points = document.createElement('span');
    points.id = `score-${color}`;
    player.appendChild(points);
    player.classList.add('socre', `score-${color}`);
    player.id = `p-${color}`;
    player.style.display = 'block';
    this.players.push(player);
    this.playerScores[color] = points;
    this.playersContainer.appendChild(player);
    this.updatePlayerScore(color, 0);
  };

  updatePlayerScore(color, score) {
    this.playerScores[color].innerText = score;
  };

  updateMoveScore(score, color) {
    if (!color) {
      color = 'white';
    }
    this.moveScoreTitle.style.color = color;
    this.moveScore.innerText = score;
    this.moveScoreContainer.style.borderColor = color;
    if (color === 'green') {
      this.moveScoreContainer.style.backgroundColor = 'whitesmoke';
    } else {
      this.moveScoreContainer.style.backgroundColor = 'rgba(8 ,8 ,8, 0)';
    }
    this.moveScore.style.color = color;
    if (this.moveScoreContainer.style.display !== 'initial') {
      this.moveScoreContainer.style.display = 'initial';
    }
  };

  setDiceButton(bool) {
    this.diceButton.disabled = !bool;
  };

  drawDice(n) {
    this.dice.forEach((d) => {
      d.style.display = 'none';
    });
    this.dice[n].style.display = 'block';
  };

  toggleCoordinates() {
    const squares = Object.values(this.squares);
    squares.forEach((sq) => {
      if (sq.innerText === '') {
        sq.innerText = sq.id;
        sq.style.textAlign = 'center';
      } else {
        sq.innerText = '';
      }
    });
  }
};


class Game {

  botNames = ['BOT', 'HAL'];
  randomNames = ['RANDOM'];

  constructor(page) {
    this.page = page;
    this.turn = 0;
    this.gameObjects = [];
    this.players = [];
    this.currentPlayerIndex = 0;
    this.tokens = {
      'green': [],
      'yellow': [],
      'red': [],
      'blue': []
    };
    this.sixCount = 0;
    this.diceRolling = true;
    this.dice = 0;
    this.drawDestination = -1;
    this.ctx = page.canvas.getContext('2d');
    this.setupEvents();
  };

  setupEvents() {
    this.page.diceButton.addEventListener('click', this.rollDice.bind(this));
    for (let i = 0; i <= 3; i ++) {
      this.page.moveButtons[i].addEventListener('mouseover', this.setDrawDestination.bind(this, i));
      this.page.moveButtons[i].addEventListener('mouseout', this.setDrawDestination.bind(this, -1));
      this.page.moveButtons[i].addEventListener('click', this.inputMove.bind(this, i));
    }
  };

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min; // The maximum is inclusive and the minimum is inclusive 
  };

  setDrawDestination(n) {
    this.drawDestination = n;
  }

  getTokenStartPosition(color, index) {
    const greens = [[48.5, 49], [143,49], [48.5,143], [143, 143]];
    const yellows = [[337, 49], [431, 49], [337, 143], [431, 143]];
    const reds = [[48.5, 336], [143,336], [48.5, 430], [143, 430]];
    const blues = [[337, 336], [431, 336], [337, 430], [431, 430]]; 
    switch (color) {
      case 'green':
        return greens[index];
      case 'yellow':
        return yellows[index];
      case 'red':
        return reds[index];
      case 'blue':
        return blues[index];
      default:
        throw new Error('No such color');
    }
  };

  getTokenEndPosition(color, index) {
    const center = 480/2;
    const greens = [[center-30, center-15], [center-30,center-5], [center-30,center+5], [center-30, center+15]];
    const yellows = [[center-15, center-30], [center-5, center-30], [center+5, center-30], [center+15, center-30]];
    const reds = [[center-15, center+30], [center-5, center+30], [center+5, center+30], [center+15, center+30]];
    const blues = [[center+30, center-15], [center+30, center-5], [center+30, center+5], [center+30, center+15]]; 
    switch (color) {
      case 'green':
        return greens[index];
      case 'yellow':
        return yellows[index];
      case 'red':
        return reds[index];
      case 'blue':
        return blues[index];
      default:
        throw new Error('No such color');
    }
  };

  getPath(color) {
    let result = [];
    switch (color) {
      case 'green':
        for (let  i = 1; i <= 52; i++) {
          result.push(i.toString());
        }
        result.push(result[0])
        for (let i = 1; i <= 5; i++) {
          result.push(`g${i.toString()}`);
        }
        return result;
      case 'yellow':
        for (let  i = 14; i <= 52; i++) {
          result.push(i.toString());
        }
        for (let i = 1; i <= 14; i++) {
          result.push(i.toString());
        }
        for (let i = 1; i <= 5; i++) {
          result.push(`y${i.toString()}`);
        }
        return result;
      case 'red':
        for (let  i = 40; i <= 52; i++) {
          result.push(i.toString());
        }
        for (let i = 1; i <= 40; i++) {
          result.push(i.toString());
        }
        for (let i = 1; i <= 5; i++) {
          result.push(`r${i.toString()}`);
        }
        return result;
      case 'blue':
        for (let  i = 27; i <= 52; i++) {
          result.push(i.toString());
        }
        for (let i = 1; i <= 27; i++) {
          result.push(i.toString());
        }
        for (let i = 1; i <= 5; i++) {
          result.push(`b${i.toString()}`);
        }
        return result;
      default:
        throw new Error('No such color');
    }
  };

  checkKill(token) {
    let r = false;
    const otherTokens = this.gameObjects.map((obj) => {
      if (obj.color && obj.color != token.color) {
        return obj;
      } else {
        return null;
      }
    });
    otherTokens.forEach((t) => {
      if (t && t.steps >= 0) {
        if (token.path[token.steps] === t.path[t.steps] && !t.finished) {
          r = t;
        }
      }
    })
    return r;
  };

  tokensInRange(token) {
    let distances = [];
    if (token.steps < 0 || token.steps > 52) {
      return distances;
    }
    let _t = {...token};
    for (let i = 1; i < 7; i++) {
      _t.steps -= 1;
      if (_t.steps < -0) {
        _t.steps = 51;
      }
      let collision = this.checkKill(_t);
      if (collision && collision.steps + i <= 52) {
        distances.push(i);
        }
    }
    return distances;
  };

  currentPlayer() {
    return this.players[this.currentPlayerIndex];
  };

  checkWinner() {
    let r = false;
    this.players.forEach((p) => {
      if (p.score >= 4) {
        r = p;
      }
    });
    return r;
  };

  nextMove() {
    if (!this.checkWinner()) {
      if (this.dice !== 6) {
        this.currentPlayerIndex += 1;
      } else {
        if (this.sixCount >= 3) {
          this.currentPlayerIndex += 1;
          this.sixCount = 0;
        }
      }
      if (this.currentPlayerIndex >= this.players.length) {
        this.currentPlayerIndex = 0;
      }
      const p = this.currentPlayer();
      this.diceRolling = true;
      this.page.setDiceButton(true);
      this.page.updateStatus(`${p.name}, roll the dice!`, p.color);
      this.turn += 1;
      if (p.bot) {
        setTimeout(() => {
          this.rollDice();
        }, p.diceTimeout);
      }
    }
  };

  inputMove(tokenIndex) {
    this.drawDestination = -1;
    const player = this.currentPlayer();
    player.tokens.forEach((token) => {
      token.showNumber = false;
    });
    let token = player.tokens[tokenIndex];
    this.page.closeTokenSelection();
    token.callback = () => {
      let kill = this.checkKill(token);
      if (kill) {
        kill.reset();
      };
      this.nextMove();
      token.callback = () => null;
    }
    token.walkSteps(this.dice);
  };

  rollDice() {
    this.page.setDiceButton(false);
    this.diceRolling = false;
    const player = this.currentPlayer();
    if (player.name.toUpperCase() === 'BEAST') {
      this.dice = 6;
    }
    const n = this.dice;
    this.page.drawDice(n);
    if (n === 6) {
      this.sixCount += 1
    } else {
      this.sixCount = 0;
    }
    let noMoves = true;
    for (let i = 0; i <= 3; i++) {
      let token = player.tokens[i];
      if (token.canMove(n)) {
        this.page.openTokenSelection(i);
        noMoves = false;
        token.showNumber = true;
      }
    }
    if (noMoves) {
      this.page.updateStatus(`${player.name} cannot move!`, player.color);
      setTimeout(() => {
        this.nextMove();
      }, 800);
    } else {
      this.page.updateStatus(`${player.name}, select a token to move.`, player.color);
      if (player.bot) {
        setTimeout(() => {
          player.pickToken();
        }, player.pickTimeout);
      }
    }
  };

  draw() {
    this.ctx.clearRect(0, 0, this.page.canvas.width, this.page.canvas.height);
    this.ctx.globalAlpha = 1;
    this.gameObjects.forEach((gameobj) => {
      gameobj.draw(this.ctx);
    });
    this.currentPlayer().redrawTokens(this.ctx);
    const winner = this.checkWinner();
    if (winner) {
      this.ctx.fillStyle = 'rgba(2, 2, 2, 0.6)';
      this.ctx.fillRect(60, 60, 350, 110);
      this.ctx.fillStyle = winner.color;
      this.ctx.font = '44px Helvetica';
      this.ctx.fontWeight = 'bolder';
      this.ctx.fillText(`${winner.name} wins!`, 65, 120, 335);
      this.page.updateStatus(`${winner.name} wins!`, winner.color);
    }
  };

  gameLoop() {
    this.gameObjects.forEach((gameObj) => {
      gameObj.move();
    });
    this.players.forEach((p) => {
      p.updateStepsWaled();
    });
    if (this.diceRolling) {
      this.dice = this.getRandomInt(1,6);
      this.page.drawDice(this.dice);
    }
    this.draw();
    requestAnimationFrame(this.gameLoop.bind(this));
  };

  start() {
    if (this.players.length >= 2) {
      const p = this.currentPlayer();
      this.page.setDiceButton(true);
      this.page.updateStatus(`${p.name}, roll the dice!`, p.color);
      this.gameLoop();
      if (p.bot) {
        setTimeout(() => {
          this.rollDice();
        }, p.diceTimeout);
      }
    }
  };
};


class Token {

  constructor(color, index, player, game) {
    this.game = game;
    this.player = player;
    this.steps = -1;
    this.path = game.getPath(color);
    this.color = color; 
    this.index = index;
    this.showNumber = false;
    this.finished = false;
    this.size = 10;
    const position = game.getTokenStartPosition(color, index);
    this.x = position[0];
    this.y = position[1];
    this.target = [this.x, this.y];
    this.hspeed = 0;
    this.vspeed = 0;
    this.shrinking = false;
    this.itinerary = [];
    this.callback = () => null;
    game.tokens[color].push(this);
    game.gameObjects.push(this);
  };

  canMove(n) {
    let r = true;
    if (this.game.sixCount >= 3) {
      r = false;
    }
    if (this.steps < 0 && this.game.dice !== 6) {
      r = false;
    }
    if (this.finished) {
      r = false;
    }
    this.player.tokens.forEach((t) => {
      if (!t.finished && this.steps + n === t.steps) {
        r = false;
      }
    })
    return r;
  };

  walkSteps(n) {
    let hasFinished = false;
    const step = n / Math.abs(n);
    for (let i = step; Math.abs(i) <= Math.abs(n); i += step) {
      let target = [];
      const s = this.steps;
      if (s + i >= this.path.length) {
        target = this.game.getTokenEndPosition(this.color, this.index);
        hasFinished = true;
      } else {
        const sqId = this.path[s + i];
        target = this.game.page.getSquarePosition(sqId);
      }
      this.itinerary.push([...target, step]);
    }
    if (hasFinished) {
      this.finished = true;
      this.player.score += 1;
      this.shrinking = true;
      this.player.redrawScore();
    }
  };

  move() {
    if (this.shrinking) {
      this.size -= 0.1;
      if (this.size < 5) {
        this.size = 5;
        this.shrinking = false;
      }
    }
    if (this.itinerary.length > 0) {
      this.target = this.itinerary[0];
      if (this.target !== [this.x, this.y]) {
        if (this.hspeed === 0 && this.vspeed === 0) {
          this.hspeed = (this.target[0] - this.x) / 8;
          this.vspeed = (this.target[1] - this.y) / 8;
        }
        if (Math.abs(this.x - this.target[0]) <= Math.abs(this.hspeed)) {
          this.x = this.target[0];
          this.hspeed = 0;
        }
        if (Math.abs(this.y - this.target[1]) <= Math.abs(this.vspeed)) {
          this.y = this.target[1];
          this.vspeed = 0;
        }
        if (this.hspeed === 0 && this.vspeed === 0) {
          const move = this.itinerary.shift();
          if (move[2]) {
            this.steps += move[2];
          } else {
            this.steps += 1;
          }
          if (this.itinerary.length === 0) {
            this.callback();
          }
        }
        this.x += this.hspeed;
        this.y += this.vspeed;
      } else {
        this.hspeed = 0;
        this.vspeed = 0;
      }
    }
  };

  reset() {
    if (this.steps >= 0) {
      this.callback = () => {
        this.steps = -1;
        this.callback = () => null;
      }
      this.itinerary.push([...this.game.getTokenStartPosition(this.color, this.index), 0]);
    }
  };

  draw(ctx) {
    const p = this.game.currentPlayer();
    ctx.strokeStyle = 'black';
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fill();
    if (p.color === this.color && this.game.drawDestination === this.index) {
      const d = this.game.dice;
      let position;
      let gSize = this.size;
      if (this.steps + d < this.path.length) {
        position = this.game.page.getSquarePosition(this.path[this.steps + d]);
      } else {
        position = this.game.getTokenEndPosition(this.color, this.index);
        gSize = this.size / 2;
      }
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(...position, gSize, 0, 2 * Math.PI);
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2;
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(...position);
      ctx.strokeStyle = 'silver';
      ctx.stroke();
    }
    if (this.showNumber) {
      ctx.fillStyle = 'white';
      if (this.color === 'yellow') {
        ctx.fillStyle = 'black';
      }
      ctx.font = '18px Helvetica';
      ctx.fillText((this.index+1), this.x-5, this.y+6);
    }
  };
};


class Player {
  constructor(name, color, game) {
    this.game = game;
    this.name = name;
    this.color = color;
    this.score = 0;
    this.stepsWalked = -4;
    this.tokens = [];
    for (let i = 0; i <= 3; i++) {
      this.tokens.push(new Token(color, i, this, this.game));
    }
  };

  updateStepsWaled() {
    let n = 0;
    this.tokens.forEach((t) => {
      n += t.steps;
    })
    this.stepsWalked = n;
  };

  redrawScore() {
    this.game.page.updatePlayerScore(this.color, this.score);
  };

  redrawTokens(c) {
    this.tokens.forEach((t) => {
      t.draw(c);
    })
  };

  hasTokensHome() {
    let r = false;
    this.tokens.forEach((t) => {
      if (t.steps == -1) {
        r = true;
      }
    })
    return r;
  };
};

class Random extends Player {
  constructor(name, color, game) {
    super(name, color, game);
    this.bot = true;
    this.clickTimeout = 400;
    this.diceTimeout = 400;
    this.pickTimeout = 800;
  };

  pickToken() {
    let moveTokenButtons = [];
    this.game.page.moveButtons.forEach((b) => {
      if (b.style.display !== 'none') {
        moveTokenButtons.push(b);
      }
    });
    let pick = this.game.getRandomInt(0, moveTokenButtons.length - 1);
    moveTokenButtons[pick].classList.add('bot-select');
    let n = parseInt(moveTokenButtons[pick].id.charAt(5) - 1);
    this.game.setDrawDestination(n);
    setTimeout(() => {
      moveTokenButtons[pick].classList.remove('bot-select');
      this.game.setDrawDestination(-1);
      moveTokenButtons[pick].click();
    }, this.clickTimeout);
  };
};

class Bot extends Player {
  constructor(name, color, game) {
    super(name, color, game);
    this.bot = true;
    this.clickTimeout = 800;
    this.diceTimeout = 600;
    this.pickTimeout = 1600;
    this.safety = 10;
    this.killBonus = 300;
  }
  pickToken() {
    let moveTokenButtons = [];
    this.game.page.moveButtons.forEach((b) => {
      if (b.style.display !== 'none') {
        moveTokenButtons.push(b);
      }
    })
    let pick;
    const baseDistanceBonus = this.safety * 10;
    if (moveTokenButtons.length > 0) {
      let movableTokens = moveTokenButtons.map((b) => {
        let index = parseInt(b.id.charAt(5) - 1);
        let t = this.tokens[index];
        return t;
      })
      let moveScores = [];
      const d = this.game.dice;
      console.log(`Turn: ${this.game.turn}: ${this.color} rolls ${d}`);
      for (let id = 0; id < movableTokens.length; id++) {
        const _token = { ...movableTokens[id] };
        let score = 0;
        const s = _token.steps;
        const sqSixBonus = (s * this.safety / 10);
        const previousDs = this.game.tokensInRange(_token);
        if (previousDs.length > 0) {
          previousDs.forEach((distance) => {
            score += baseDistanceBonus;
            score += (7 - distance) * this.safety;
          })
        }
        if (s === 5 && this.hasTokensHome()) {
          score += 1 * this.safety; // vacate sq6 bonus
        }
        if (s === -1) {
          score += baseDistanceBonus * 3; // exit home bonus
        }
        if (s <= 52 && s + d > 52) {
          score += baseDistanceBonus; 
        }
        if (s > 52) {
          score = (s - 52) * (this.safety * -1) + 1; // inside safe zone
        }
        const oldSq = _token.path[_token.steps];
        if (oldSq) {
          this.game.players.forEach((p) => {
            // Check if square six is dangerous.
            if (p.color !== _token.color && p.hasTokensHome()) {
              if (p.color === 'green' && oldSq === '6') {
                score -= baseDistanceBonus + sqSixBonus;
              }
              if (p.color === 'yelow' && oldSq === '19') {
                score -= baseDistanceBonus + sqSixBonus;
              }
              if (p.color === 'blue' && oldSq === '32') {
                score -= baseDistanceBonus + sqSixBonus;
              }
              if (p.color === 'red' && oldSq === '45') {
                score -= baseDistanceBonus + sqSixBonus;
              }
            }
          });
        }
        _token.steps += d; // Simulate token movement.
        const victim = this.game.checkKill(_token);
        if (victim) {
          if (victim instanceof Bot) {
            score -= victim.player.stepsWalked+4;
            score -= victim.steps/10;
            score -= this.killBonus*1.5;
          } else {
            score += victim.player.stepsWalked+4;
            score += victim.steps/10;
            score += this.killBonus;
          }
        }
        const newSq = _token.path[_token.steps];
        this.game.players.forEach((p) => {
          // Check if square six is dangerous.
          if (p.color !== _token.color && p.hasTokensHome()) {
            if (p.color === 'green' && newSq === '6') {
              score -= baseDistanceBonus + sqSixBonus;
            }
            if (p.color === 'yelow' && newSq === '19') {
              score -= baseDistanceBonus + sqSixBonus;
            }
            if (p.color === 'blue' && newSq === '32') {
              score -= baseDistanceBonus + sqSixBonus;
            }
            if (p.color === 'red' && newSq === '45') {
              score -= baseDistanceBonus + sqSixBonus;
            }
          }
        });
        const nextDs = this.game.tokensInRange(_token);
        if (nextDs.length > 0) {
          nextDs.forEach((distance) => {
            score -= baseDistanceBonus;
            score -= (7 - distance) * this.safety;
          });
        }
        moveScores.push({
          'id': id,
          'num': _token.index + 1,
          'score': score,
          'steps': s
        });
        }
        moveScores.sort((a, b) => {
          if (a.score < b.score) return 1;
          if (a.score > b.score) return -1;
          if (a.steps < b.steps) return 1;
          if (a.steps > b.steps) return -1;
          return 0;
        })
        pick = moveScores[0]['id'];
        const moveSc = moveScores[0].score;
        this.game.page.updateMoveScore(moveSc, this.color);
      }
    moveTokenButtons[pick].classList.add('bot-select');
    let n = parseInt(moveTokenButtons[pick].id.charAt(5) - 1);
    this.game.setDrawDestination(n);
    setTimeout(() => {
      moveTokenButtons[pick].classList.remove('bot-select');
      this.game.setDrawDestination(-1);
      moveTokenButtons[pick].click();
    }, this.clickTimeout);
  };
};


function loadPage() {
  const pageConfig = {
    form: {
      container: document.getElementById('game-form'),
      playerNames: [],
      playerColors: [],
      playerHeaders: [],
      submit: document.getElementById('start'),
      data: []
    },
    canvas: document.getElementById('gameBoard'),
    board: document.getElementsByClassName('board')[0],
    playersContainer: document.getElementById('players'),
    moveButtons: [],
    status: document.getElementById('status'),
    dice: [],
    diceButton: document.getElementById('roll'),
    moveScoreContainer: document.getElementsByClassName('move-score-container')[0],
    moveScoreTitle: document.getElementsByClassName('move-title')[0],
    moveScore: document.getElementById('move-score'),
    options: {
      showCoordinates: document.getElementById('show-coordinates')
    }
  };
  for (let i = 0; i < 4; i ++) {
    pageConfig.form.playerNames.push(document.getElementById(`p${(i+1)}-name`));
    pageConfig.form.playerColors.push(document.getElementById(`p${(i+1)}-color`));
    pageConfig.form.playerHeaders.push(document.getElementById(`p${(i+1)}-h`));
    pageConfig.form.data.push({ name: '', color: '' });
    pageConfig.moveButtons.push(document.getElementById(`move-${i+1}`));
  }
  for (let i = 0; i <= 6; i ++) {
    pageConfig.dice.push(document.getElementById(`d${i}`));
  }
  return new Page(pageConfig);
};

function main() {
  page = loadPage();
};
