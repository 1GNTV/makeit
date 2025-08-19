import React, { useState } from 'react'
import { useGame } from '../contexts/GameContext'
import { Crown, Users, Gamepad2, Sparkles } from 'lucide-react'

const Home = () => {
  const { socket, setGameState } = useGame()
  const [playerName, setPlayerName] = useState('')
  const [lobbyCode, setLobbyCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  const createLobby = () => {
    if (!playerName.trim()) return
    
    setIsCreating(true)
    socket.emit('createLobby', { playerName: playerName.trim() })
  }

  const joinLobby = () => {
    if (!playerName.trim() || !lobbyCode.trim()) return
    
    setIsJoining(true)
    socket.emit('joinLobby', { 
      lobbyCode: lobbyCode.trim().toUpperCase(), 
      playerName: playerName.trim() 
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-primary-500 mr-3" />
            <h1 className="text-5xl font-bold text-primary-600">Make It Meme</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-md mx-auto">
            Create hilarious memes with friends in real-time! Upload images, write captions, and vote for the funniest ones.
          </p>
        </div>

        {/* Main Form */}
        <div className="card max-w-md mx-auto">
          <div className="mb-6">
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="input-field"
              maxLength={20}
            />
          </div>

          <div className="space-y-4">
            {/* Create Lobby */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Crown className="w-5 h-5 mr-2 text-primary-500" />
                Create New Game
              </h3>
              <button
                onClick={createLobby}
                disabled={!playerName.trim() || isCreating}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Lobby'}
              </button>
            </div>

            {/* Join Lobby */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-500" />
                Join Existing Game
              </h3>
              <input
                type="text"
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value)}
                placeholder="Enter lobby code"
                className="input-field mb-3"
                maxLength={6}
              />
              <button
                onClick={joinLobby}
                disabled={!playerName.trim() || !lobbyCode.trim() || isJoining}
                className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? 'Joining...' : 'Join Lobby'}
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Gamepad2 className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Real-time Multiplayer</h3>
            <p className="text-gray-600 text-sm">Play with friends instantly using WebSockets</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Custom Images</h3>
            <p className="text-gray-600 text-sm">Upload your own images to create unique memes</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Voting System</h3>
            <p className="text-gray-600 text-sm">Vote anonymously and compete for the highest score</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
