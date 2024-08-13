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
        <button onClick={this.props.roll}>주사위 굴리기</button>
      </div>
    );
  }
}

function TurnIndicator(props) {
  return (
    <h2 className="turn-indicator">{props.turn}번째 턴</h2>
  );
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dices: Array(5).fill(null),
      turn: 1,
      rollCount: 0,
      fixedStatus: Array(5).fill(false),
    };
    this.rollDice = this.rollDice.bind(this);
    this.fixDice = this.fixDice.bind(this);
  }
  rollDice() {
    console.log("asdf");
    if (this.state.rollCount >= 3) return;
    const dices = this.state.dices.map((v, i) => 
      this.state.fixedStatus[i] ? v : randInt(1, 6)
    );
    this.setState({
      rollCount: this.state.rollCount + 1,
      dices: dices,
    });
  }
  fixDice(idx) {
    if (this.state.dices[idx] === null) return;
    this.setState((prevState) => {
      const fixedStatus = prevState.fixedStatus.map((fixed, i) => 
        idx === i ? !fixed : fixed
      );
      return { fixedStatus };
    });
  }
  render() {
    return (
      <div className="game">
        <TurnIndicator turn={this.state.turn}/>
        {/* <ScoreBoard diceValues={diceValues}/> */}
        <DiceSection 
          dices={this.state.dices} 
          roll={this.rollDice} 
          fix={this.fixDice} 
          rollCount={this.state.rollCount}
          fixedStatus={this.state.fixedStatus}
        />
      </div>
    );
  }
  
}

function App() {
  return (
    <div className="App">
      check render
      <Game/>
    </div>
  );
}

function randInt(min, max) {
  return Math.floor(min + Math.random() * (max-min));
}
function range(n) {
  return [...Array(n)].map((_,i) => i);
}

export default App;