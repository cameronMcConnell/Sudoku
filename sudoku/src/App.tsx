import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';

// Interface for options button rendering.
interface optionsObject {
  title: string,
  brdrClr: string
}

// Interface for objects that make up the elements of the board.
interface boardObject {
  val: number,
  index: number,
  isStatic: boolean
}

const App = () => {

  // Create the board.
  const createBoard = (): boardObject[][] => {
    let b: boardObject[][] = [];
    
    for (let i: number = 0; i < 9; i++) {
      b.push([]);
      for (let j: number = 0; j < 9; j++) {
        b[i].push({val: 0, index: (i * 9) + j, isStatic: false});
      }
    }

    return b;
  }
  
  // The board that will be edited and changed to solve the sudoku.
  // Needed to make 2D array of special objects that have unqiue indexs.
  let [board, setBoard] = useState<boardObject[][]>(createBoard());

  // 0 = easy, 1 = medium, 2 = hard
  let [curDiff, setCurDiff] = useState<number>(0);

  // Used for check button press.
  const [solved, setSolved] = useState<boolean>(false);

  // Used to help solved state in button on click event.
  const [newBoard, setNewBoard] = useState<boolean>(true);
  
  // Used to render difficulty buttons.
  const difficulties: string[] = ['Easy', 'Medium', 'Hard'];

  // Used for animation after solving board.
  let animations: number[][] = [];
  
  // Used to render options buttons and their colors. 
  const options: optionsObject[] = [
    {
      title: 'Solve',
      brdrClr: '#0cf345'
    }, 
    { 
      title: 'Check',
      brdrClr: '#f30cba'
    }
  ];

  // Set initial board difficulty to easy.
  useEffect(() => { generateEasy() }, []);

  // Switch to chosen difficuly.
  const chooseDifficulty = (diff: number): void => {
    setNewBoard(true);
    setSolved(false);

    switch (diff) {
      case 0:
        generateEasy();
        break;
      case 1:
        generateMedium();
        break;
      case 2:
        generateHard();
        break;
    }
  }

  // Switch to choose option.
  const optionsLogic = (option: string) => {
    let result: boolean;
    switch (option) {
      case 'Solve':
        solveBoard();
        setNewBoard(false);
        setSolved(true);
        break;
      case 'Check':
        result= checkSolution();
        setNewBoard(false);
        if (result) {
          setSolved(true);
        }
        break;
    }
  }

  // Api requet for easy board.
  const generateEasy = (): void => {
    fetch('https://sugoku.onrender.com/board?difficulty=easy')
    .then(response => response.json())
    .then(data => {
      let b: boardObject[][] = createBoard();
      for (let i: number = 0; i < 9; i++) {
        for (let j: number = 0; j < 9; j++) {
          b[i][j].val = data.board[i][j];
          if ( b[i][j].val ) { b[i][j].isStatic = true; }
        }
      }
      setCurDiff(0);
      setBoard(b);
    })
    .catch(error => {
      console.log('Error: ', error);
    })
  }

  // Api request for medium board.
  const generateMedium = (): void => {
    fetch('https://sugoku.onrender.com/board?difficulty=medium')
    .then(response => response.json())
    .then(data => {
      let b: boardObject[][] = createBoard();
      for (let i: number = 0; i < 9; i++) {
        for (let j: number = 0; j < 9; j++) {
          b[i][j].val = data.board[i][j];
          if ( b[i][j].val ) { b[i][j].isStatic = true; }
        }
      }
      setCurDiff(1);
      setBoard(b);
    })
    .catch(error => {
      console.log('Error: ', error);
    })
  }

  // Api request for hard board.
  const generateHard = (): void => {
    fetch('https://sugoku.onrender.com/board?difficulty=hard')
    .then(response => response.json())
    .then(data => {
      let b: boardObject[][] = createBoard();
      for (let i: number = 0; i < 9; i++) {
        for (let j: number = 0; j < 9; j++) {
          b[i][j].val = data.board[i][j];
          if ( b[i][j].val ) { b[i][j].isStatic = true; }
        }
      }
      setCurDiff(2);
      setBoard(b);
    })
    .catch(error => {
      console.log('Error: ', error);
    })
  }

  // Checks to see if valid sudoku board.
  const checkSolution = (): boolean => {
    let rows: Set<number>[] = Array.from({ length: 9 }, () => new Set());
    let cols: Set<number>[] = Array.from({ length: 9}, () => new Set());
    let boxes: Set<number>[] = Array.from({ length: 9}, () => new Set());

    for (let i: number = 0; i < 9; i++) {
      for (let j: number = 0; j < 9; j++) {
        let boxInd: number = Math.floor(i / 3) * 3 + Math.floor(j / 3); 
        
        if (board[i][j].val === 0 || board[i][j].val < 0 || board[i][j].val > 9) {
          return false;
        }

        if (rows[i].has(board[i][j].val)) {
          return false;
        } else {
          rows[i].add(board[i][j].val);
        }

        if (cols[j].has(board[i][j].val)) {
          return false;
        } else {
          cols[j].add(board[i][j].val);
        }

        if (boxes[boxInd].has(board[i][j].val)) {
          return false;
        } else {
          boxes[boxInd].add(board[i][j].val)
        }
      }
    }
    return true;
  }

  // Check if current number in position is valid.
  const isValid = (i: number, j: number, val: number, boardCopy: boardObject[][]): boolean => {
    for (let k: number = 0; k < 9; k++) {
      if (boardCopy[i][k].val === val || boardCopy[k][j].val === val) {
        return false;
      }
    }

    var i0: number = Math.floor(i / 3) * 3;
    var j0: number = Math.floor(j / 3) * 3;

    for (let l: number = 0; l < 3; l++) {
      for (let m: number = 0; m < 0; m++) {
        if (boardCopy[i + i0][j + j0].val === val) {
          return false;
        }
      }
    }

    return true;
  }

  // Brute-force and backtracking algorithm to solve the board.
  const solve = (boardCopy: boardObject[][]): boolean => {
    for (let i: number = 0; i < 9; i++) {
      for (let j: number = 0; j < 9; j++) {
        if (boardCopy[i][j].val === 0) {
          for (let val: number = 1; val < 10; val++) {
            if (isValid(i, j, val, boardCopy)) {
              animations.push([boardCopy[i][j].index, val]);
              boardCopy[i][j].val = val;
              if (solve(boardCopy)) {return true};
              animations.push([boardCopy[i][j].index, 0]);
              boardCopy[i][j].val = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  // Goes through the animations array and shows the process on the board.
  const animate = (): void => {
    let inputs: HTMLInputElement[] = Array.from(document.querySelectorAll('input'));
    let inputsDict: {[key: string]: HTMLInputElement} = {};
    
    for (let input of inputs) {
      inputsDict[input.name] = input;
    }
    
    let kft: number = 0;
    let animationSpeed: number = 1.5;
    
    for (const x of animations) {
      setTimeout(() => {
        if (x[1] === 0) {
          inputsDict[x[0].toString()].value = '';
        } else {
          inputsDict[x[0].toString()].value = x[1].toString();
        }
      }, (kft * 4));
      kft += animationSpeed;
    }

    animations = [];
    setBoard(board);
  }

  // Solves the board and does animation.
  const solveBoard = (): void => {
    var boardCopy: boardObject[][] = JSON.parse(JSON.stringify(board));
    solve(boardCopy);
    animate();
  }

  // Used for on change event from input in grid.
  const updateBoard = (e: React.ChangeEvent<HTMLInputElement>, i: number, j: number) => {
    e.preventDefault();
    let inputVal: number | undefined = parseInt(e.target.value);
    
    if (inputVal && inputVal < 10 && inputVal > -1 ) {
      board[i][j].val = inputVal;
    } else {
      board[i][j].val = 0;
    }
    
    setBoard(board);
  }

  // Sets all non-static values in board to empty.
  const clearBoard = (): void => {
    let inputs: HTMLInputElement[] = Array.from(document.querySelectorAll('input'));

    for (let input of inputs) { input.value = ''; }

    for (let i: number = 0; i < 9; i++) {
      for (let j: number = 0; j < 9; j++) {
        if (!board[i][j].isStatic) { board[i][j].val = 0; }
      }
    }

    setSolved(false);
    setNewBoard(true);
    setBoard(board);
  }

  return (
    <div className='container'>
      <header id='header'>
        <h1>Sudoku</h1>
        <h2 key={curDiff}>Difficulty: {curDiff === 0 ? 'Easy': curDiff === 1 ? 'Medium' : 'Hard'}</h2>
        <div id='header-button-container'>
          {difficulties.map((diffs: string, ind: number) => (
            <button className='diff-button' key={ind} onClick={() => chooseDifficulty(ind)}>{diffs}</button>
          ))}
          <button className='diff-button' style={{borderColor: '#26f7fd'}} onClick={() => clearBoard()}>Clear</button>
          {options.map((option: optionsObject) => (
            <button className='diff-button' style={{borderColor: option.brdrClr}}
            key={option.title} onClick={() => optionsLogic(option.title)}>{option.title}</button>
          ))}
          {(!newBoard && solved) ? <div className='thumb-div'>👍</div>: ''}
          {(!newBoard && !solved) ? <div className='thumb-div'>👎</div>: ''}
        </div>
      </header>
      <div id='board-container'>
        <table>
          <tbody>
            {board.map((row: boardObject[], i: number) => (
              <tr>
                {row.map((col: boardObject, j: number) => (
                  <td>
                    {col.isStatic ? col.val
                     : <input name={col.index.toString()} onChange={(e) => updateBoard(e, i, j)}></input>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
