import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import Home from './components/Home'
import Lobby from './components/Lobby'
import Game from './components/Game'
import Results from './components/Results'
import { GameProvider } from './contexts/GameContext'
import { SOCKET_URL } from './config'

const socket = io(SOCKET_URL)

function App() {
  const [gameState, setGameState] = useState({
    lobby: null,
    playerId: null,
    gamePhase: 'home', // home, lobby, playing, results
    error: null
  })

  useEffect(() => {
    // Socket event listeners
    socket.on('lobbyCreated', ({ lobby, playerId }) => {
      setGameState(prev => ({
        ...prev,
        lobby,
        playerId,
        gamePhase: 'lobby'
      }))
    })

    socket.on('joinedLobby', ({ lobby, playerId }) => {
      setGameState(prev => ({
        ...prev,
        lobby,
        playerId,
        gamePhase: 'lobby'
      }))
    })

    socket.on('lobbyUpdate', (lobby) => {
      setGameState(prev => ({
        ...prev,
        lobby
      }))
    })

    socket.on('gameStarted', (lobby) => {
      setGameState(prev => ({
        ...prev,
        lobby,
        gamePhase: 'playing'
      }))
    })

    socket.on('gameEnded', (data) => {
      setGameState(prev => ({
        ...prev,
        gamePhase: 'results',
        finalResults: data
      }))
    })

    socket.on('error', ({ message }) => {
      setGameState(prev => ({
        ...prev,
        error: message
      }))
    })

    return () => {
      socket.off('lobbyCreated')
      socket.off('joinedLobby')
      socket.off('lobbyUpdate')
      socket.off('gameStarted')
      socket.off('gameEnded')
      socket.off('error')
    }
  }, [])

  const clearError = () => {
    setGameState(prev => ({ ...prev, error: null }))
  }

  const goHome = () => {
    setGameState({
      lobby: null,
      playerId: null,
      gamePhase: 'home',
      error: null
    })
    socket.emit('leaveLobby')
  }

  return (
    <GameProvider value={{ socket, gameState, setGameState, goHome }}>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
        {gameState.error && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center justify-between">
              <span>{gameState.error}</span>
              <button 
                onClick={clearError}
                className="ml-4 text-white hover:text-red-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <Routes>
          <Route 
            path="/" 
            element={
              gameState.gamePhase === 'home' ? 
                <Home /> : 
                <Navigate to={`/${gameState.gamePhase}`} replace />
            } 
          />
          <Route 
            path="/lobby" 
            element={
              gameState.gamePhase === 'lobby' ? 
                <Lobby /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/playing" 
            element={
              gameState.gamePhase === 'playing' ? 
                <Game /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/results" 
            element={
              gameState.gamePhase === 'results' ? 
                <Results /> : 
                <Navigate to="/" replace />
            } 
          />
        </Routes>
      </div>
    </GameProvider>
  )
}

export default App
