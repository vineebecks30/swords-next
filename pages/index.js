import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const initialState = {
  currentPlayer: 1,
  previousWord: '',
  chosenLetter: '',
  forbiddenLetters: [],
  message: 'Player 1, enter a 5-letter word to begin.',
  isGameOver: false,
  inputValue: '',
};

export default function Home() {
  const [gameState, setGameState] = useState(initialState);

  const handleReset = () => {
    setGameState(initialState);
  };

  const handleLetterChoice = (letter) => {
    const forbidden = gameState.previousWord.split('').filter((l) => l !== letter);
    setGameState({
      ...gameState,
      chosenLetter: letter,
      forbiddenLetters: forbidden,
      message: `Player ${gameState.currentPlayer}, enter a word starting with '${letter}'. Forbidden: ${forbidden.join(', ')}`,
    });
  };

  const handleWordSubmit = async (e) => {
    e.preventDefault();
    const word = gameState.inputValue.toLowerCase().trim();

    // --- Game Start Logic ---
    if (!gameState.previousWord) {
      if (word.length !== 5) {
        setGameState({ ...gameState, message: 'The first word must be exactly 5 letters long.' });
        return;
      }
    }
    // --- Regular Turn Logic ---
    else {
      if (word.charAt(0) !== gameState.chosenLetter) {
        setGameState({ ...gameState, message: `Word must start with '${gameState.chosenLetter}'.` });
        return;
      }
      for (const forbidden of gameState.forbiddenLetters) {
        if (word.includes(forbidden)) {
          setGameState({ ...gameState, message: `Word cannot contain these letters: ${gameState.forbiddenLetters.join(', ')}.` });
          return;
        }
      }
    }

    // --- Validate word via our own API ---
    const response = await fetch(`/api/validate?word=${word}`);
    const { isValid } = await response.json();

    if (!isValid) {
      setGameState({
        ...gameState,
        isGameOver: true,
        message: `'${word}' is not valid. Player ${gameState.currentPlayer === 1 ? 2 : 1} wins!`,
      });
      return;
    }

    // --- Success, advance to next turn ---
    setGameState({
      ...gameState,
      previousWord: word,
      currentPlayer: gameState.currentPlayer === 1 ? 2 : 1,
      chosenLetter: '',
      forbiddenLetters: [],
      message: `Player ${gameState.currentPlayer === 1 ? 2 : 1}, choose a letter from "${word}".`,
      inputValue: '',
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Swords Game</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.gameContainer}>
          <h1>Swords</h1>
          <div className={styles.statusArea}>
            <p>{gameState.message}</p>
          </div>

          {/* Letter choice view */}
          {!gameState.isGameOver && gameState.previousWord && !gameState.chosenLetter && (
            <div className={styles.wordDisplayArea}>
              {gameState.previousWord.split('').map((letter, index) => (
                <div key={index} className={styles.letterBox} onClick={() => handleLetterChoice(letter)}>
                  {letter.toUpperCase()}
                </div>
              ))}
            </div>
          )}

          {/* Word input view */}
          {!gameState.isGameOver && (!gameState.previousWord || gameState.chosenLetter) && (
            <form onSubmit={handleWordSubmit} className={styles.inputArea}>
              <input
                type="text"
                value={gameState.inputValue}
                onChange={(e) => setGameState({ ...gameState, inputValue: e.target.value })}
                placeholder="Enter word here..."
                className={styles.wordInput}
                autoFocus
              />
              <button type="submit" className={styles.submitBtn}>Submit</button>
            </form>
          )}

          <button onClick={handleReset} className={styles.resetBtn}>New Game</button>
        </div>
      </main>
    </div>
  );
}