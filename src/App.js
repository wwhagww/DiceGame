import React from 'react';
import './App.css';

function Dice(props) {
  const className = `dice ${props.fixed ? "fixed" : ""}`;
  return <button className={className} onClick={props.onClick}>
  {props.value ? props.value : "?"}
  </button>
}

class DiceSection extends React.Component {
  render() {
    const diceList = range(5).map(idx => 
      <Dice 
        value={this.props.dices[idx]} 
        onClick={()=>this.props.fix(idx)}
        fixed={this.props.fixedStatus[idx]}
        key={idx}
      />
    );
    return (
      <div className="dice-section">
        <div>주사위 횟수 {this.props.rollCount} / 3</div>
        <div className="dices">
          {diceList}
        </div>
        <button 
          class="roll-button" 
          onClick={this.props.roll}
        >
          주사위 굴리기
        </button>
      </div>
    );
  }
}

function TurnIndicator(props) {
  return (
    <h1 className="turn-indicator">{props.turn}번째 턴</h1>
  );
}

function ScoreCell(props) {
  const className = `score-cell ${props.className} ${props.filled ? "filled" : ""}`;
  return (
    <div className={className} onClick={props.fill}>
      <div className="name">{props.name}</div>
      <div className="score">{props.score}{props.children}</div>
    </div>
  );
}

function BonusCell(props) {
  return (<ScoreCell
    name="+35 Bonus"
    score={props.score}
    filled={props.filled}
    className="bonus-cell"
  > / 63</ScoreCell>);
}

function TotalCell(props) {
  return (<ScoreCell
    name="Total"
    score={props.score}
    filled={props.filled}
    className="total-cell"
    />);
}

class ScoreSection extends React.Component {
  render() {
    const {scores, dices, RULLS} = this.props;
    return <div className="score-section">
      {RULLS.cells.map(({name, calc}, idx) => {
        const score = scores[idx] ??
          (dices[0] !== null 
            ? calc(dices) 
            : ""
          );
        return (
          <ScoreCell
            key={name}
            name={name}
            score={score}
            fill={() => this.props.fill(idx)}
            filled={scores[idx] !== null}
          />
        );
      })}
      <BonusCell 
        score={RULLS.calcSubTotal(scores)}
        filled={RULLS.isBonus(scores)}
      />
      <TotalCell 
        score={RULLS.calcTotalScore(scores)}
        filled={!scores.includes(null)}
      />
    </div>
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scores: Array(12).fill(null),
      dices: Array(5).fill(null),
      rollCount: 0,
      fixedStatus: Array(5).fill(false),
    };

    this.rollDice = this.rollDice.bind(this);
    this.fixDice = this.fixDice.bind(this);
    this.fillScore = this.fillScore.bind(this);

    this.RULLS = {
      cells: [
        {
          name: "Ones",
          calc: (dices) => countNums(dices,6)[1] * 1
        },
        {
          name: "Twos",
          calc: (dices) => countNums(dices,6)[2] * 2
        },
        {
          name: "Threes",
          calc: (dices) => countNums(dices,6)[3] * 3
        },
        {
          name: "Fours",
          calc: (dices) => countNums(dices,6)[4] * 4
        },
        {
          name: "Fives",
          calc: (dices) => countNums(dices,6)[5] * 5
        },
        {
          name: "Sixes",
          calc: (dices) => countNums(dices,6)[6] * 6
        },
        {
          name: "Choice",
          calc: (dices) => sum(dices)
        },
        {
          name: "4 of a Kind",
          calc: (dices) => {
            const counts = countNums(dices,6);
            return counts.includes(4) || counts.includes(5) ? sum(dices) : 0}
        },
        {
          name: "Full House",
          calc: (dices) => {
            const counts = countNums(dices,6);
            return counts.includes(3) && counts.includes(2) || counts.includes(5) ? sum(dices) : 0}
        },
        {
          name: "Small Straight",
          calc: (dices) => countNums(dices,6).reduce((acc, cur) => cur > 0 || acc >= 4 ? acc+1 : 0, 0) >= 4 ? 15 : 0
        },
        {
          name: "Large Straight",
          calc: (dices) => countNums(dices,6).reduce((acc, cur) => cur > 0 || acc >= 5 ? acc+1 : 0, 0) >= 5 ? 30 : 0
        },
        {
          name: "Yacht",
          calc: (dices) => countNums(dices,6).includes(5) ? 50 : 0
        },
      ],
      calcSubTotal: scores => sum(scores.slice(0,6)),
      isBonus: scores => this.RULLS.calcSubTotal(scores) >= 63,
      calcTotalScore: scores => sum(scores) + (this.RULLS.isBonus(scores) ? 35 : 0),
    };
  }

  // 계산
  getFinalComment(totalScore) {
    if (totalScore >= 200) {
      return "매우 실력이 좋네요 축하드립니다!";
    } else if (totalScore >= 150) {
      return "잘 했습니다! 다시 시도해보세요.";
    } else if (totalScore >= 100) {
      return "조금 아쉽네요. 전략을 다시 짜보세요.";
    } else {
      return "야야야 제대로 게임 안 해?";
    }
  }

  // 액션
  fillScore(idx) {
    if (this.state.dices[0] === null) return;
    if (this.state.scores[idx] !== null) return;

    this.setState(({scores}) => {
      const newScores = scores.slice();
      newScores[idx] = this.RULLS.cells[idx].calc(this.state.dices);

      return {
        scores: newScores, 
        dices: Array(5).fill(null), 
        rollCount: 0,
        fixedStatus: Array(5).fill(false),
      };
    });
  }

  rollDice() {
    if (this.state.rollCount >= 3) return;

    this.setState(({dices, rollCount}) => {
      const newDices = dices.map((v, i) => 
        this.state.fixedStatus[i] ? v : randInt(1, 6)
      );

      return {
        dices: newDices, 
        rollCount: rollCount + 1
      };
    });
  }
  
  fixDice(idx) {
    if (this.state.dices[idx] === null) return;

    this.setState(({fixedStatus}) => {
      const newFixedStatus = fixedStatus.map((fixed, i) => 
        idx === i ? !fixed : fixed
      );

      return { fixedStatus: newFixedStatus };
    });
  }
  
  render() {
    const turn = this.state.scores.filter(score => score !== null).length + 1;
    const isPlaying = this.state.scores.includes(null);
    const totalScore = this.RULLS.calcTotalScore(this.state.scores);
    return (
      <div className="game">
        {isPlaying && <TurnIndicator turn={turn}/>}
        <ScoreSection 
          scores={this.state.scores}
          dices={this.state.dices}
          RULLS={this.RULLS}
          fill={this.fillScore}
        />
        {isPlaying && <DiceSection 
          dices={this.state.dices} 
          roll={this.rollDice} 
          fix={this.fixDice} 
          rollCount={this.state.rollCount}
          fixedStatus={this.state.fixedStatus}
        />}
        {!isPlaying && (
          <div className="final-score">
            <h2>최종 점수 : {totalScore}</h2>
            <p>{this.getFinalComment(totalScore)}</p>
          </div>
        )}
      </div>
    );
  }
}

function App() {
  return (
    <div className="App">
      <Game/>
    </div>
  );
}

// 계산 함수
function randInt(min, max) {
  return Math.floor(min + Math.random() * (max-min+1));
}

function range(n) {
  return [...Array(n)].map((_,i) => i);
}

function sum(arr) {
  return arr.reduce((acc, cur) => cur !== null ? acc + cur : acc, 0);
}

function countNums(arr, maxNum) {
  const counts = Array(maxNum+1).fill(0);
  arr.forEach(n=>{counts[n] += 1});
  return counts
}

function max(arr) {
  return arr.reduce((prevMax, cur) => cur > prevMax ? cur : prevMax, -Infinity);
}

export default App;