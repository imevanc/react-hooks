import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
	calculateNextValue,
	calculateStatus,
	calculateWinner, type GameState, isValidGameState,
	// 💰 these could be handy
	// isValidGameState,
	// type GameState,
	type Squares,
} from '#shared/tic-tac-toe-utils'

function Board({
	squares,
	onClick,
}: {
	squares: Squares
	onClick: (index: number) => void
}) {
	function renderSquare(i: number) {
		const value = squares[i]
		const label = value ? `square ${i}, ${value}` : `square ${i} empty`

		return (
			<button className="square" onClick={() => onClick(i)} aria-label={label}>
				{squares[i]}
			</button>
		)
	}

	return (
		<div>
			<div className="board-row">
				{renderSquare(0)}
				{renderSquare(1)}
				{renderSquare(2)}
			</div>
			<div className="board-row">
				{renderSquare(3)}
				{renderSquare(4)}
				{renderSquare(5)}
			</div>
			<div className="board-row">
				{renderSquare(6)}
				{renderSquare(7)}
				{renderSquare(8)}
			</div>
		</div>
	)
}

// 🐨 our new default state will be a GameState object
const defaultState: GameState = {
	history: [Array(9).fill(null)],
	currentStep: 0,
}

// 🐨 probably makes sense to change the name of the localStorageKey to 'tic-tac-toe'
const localStorageKey = 'tic-tac-toe'
function App() {
	// 🐨 You can now call this simply "state" and "setState" and it's now GameState instead of Squares
	const [state, setState] = useState<GameState>(() => {
		let localStorageValue
		try {
			localStorageValue = JSON.parse(
				window.localStorage.getItem(localStorageKey) ?? 'null',
			)
		} catch {
			// something is wrong in localStorage, so don't use it
		}
		return isValidGameState(localStorageValue)
			? localStorageValue
			: defaultState
	})

	// 🐨 get the "currentSquares" from state.history[state.currentStep]
	const currentSquares = state.history[state.currentStep]


	// 🐨 any reference to "squares" below should be changed to "currentSquares"
	const winner = calculateWinner(currentSquares)
	const nextValue = calculateNextValue(currentSquares)
	const status = calculateStatus(winner, currentSquares, nextValue)

	useEffect(() => {
		window.localStorage.setItem(localStorageKey, JSON.stringify(state))
	}, [state])

	function selectSquare(index: number) {
		if (winner || currentSquares[index]) return

		setState(previousState => {
			const { currentStep, history } = previousState
			const newHistory = history.slice(0, currentStep + 1)
			const squares = history[currentStep].with(index, nextValue)

			return {
				history: [...newHistory, squares],
				currentStep: newHistory.length,
			}
		})
	}

	function restart() {
		setState(defaultState)
	}

	const moves = state.history.map((_stepSquares, step) => {
		const desc = step ? `Go to move number ${step}` : 'Go to game start'
		const isCurrentStep = step === state.currentStep
		return (
			<li key={step}>
				<button
					onClick={() =>
						setState(previousState => ({ ...previousState, currentStep: step }))
					}
					disabled={isCurrentStep}
				>
					{desc} {isCurrentStep ? '(current)' : null}
				</button>
			</li>
		)
	})

	return (
		<div className="game">
			<div className="game-board">
				<Board onClick={selectSquare} squares={currentSquares} />
				<button className="restart" onClick={restart}>
					restart
				</button>
			</div>
			<div className="game-info">
				<div aria-live="polite">{status}</div>
				<ol>{moves}</ol>
			</div>
		</div>
	)
}


const rootEl = document.createElement('div')
document.body.append(rootEl)
createRoot(rootEl).render(<App />)
