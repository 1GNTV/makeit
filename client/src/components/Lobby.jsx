import React, { useState, useEffect } from 'react'
import { useGame } from '../contexts/GameContext'
import { Crown, Users, Upload, Play, Copy, Check } from 'lucide-react'
import { UPLOAD_URL } from '../config'

const Lobby = () => {
  const { socket, gameState, goHome } = useGame()
  const [copied, setCopied] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const isHost = gameState.lobby?.hostId === gameState.playerId

  const copyLobbyCode = async () => {
    try {
      await navigator.clipboard.writeText(gameState.lobby.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const startGame = () => {
    if (isHost) {
      socket.emit('startGame')
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
    }
  }

  const uploadImage = async () => {
    if (!selectedFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append('image', selectedFile)

    try {
      const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        socket.emit('uploadImage', {
          imageData: data.imageUrl,
          imageName: selectedFile.name
        })
        setSelectedFile(null)
        // Reset file input
        event.target.value = ''
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-600">Game Lobby</h1>
            <p className="text-gray-600">Waiting for players to join...</p>
          </div>
          <button
            onClick={goHome}
            className="btn-secondary"
          >
            Leave Lobby
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lobby Info */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Crown className="w-5 h-5 mr-2 text-primary-500" />
                Lobby Code
              </h2>
              
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-primary-600">
                    {gameState.lobby?.id}
                  </span>
                  <button
                    onClick={copyLobbyCode}
                    className="text-primary-500 hover:text-primary-600"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Share this code with friends to let them join the game!
              </p>

              {/* Start Game Button */}
              {isHost && (
                <button
                  onClick={startGame}
                  disabled={gameState.lobby?.players.length < 3}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5 mr-2 inline" />
                  Start Game ({gameState.lobby?.players.length}/3+)
                </button>
              )}

              {!isHost && (
                <div className="text-center py-4 text-gray-500">
                  Waiting for host to start the game...
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-primary-500" />
                Upload Images
              </h3>
              
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                
                {selectedFile && (
                  <button
                    onClick={uploadImage}
                    disabled={uploading}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : `Upload ${selectedFile.name}`}
                  </button>
                )}
              </div>

              {/* Uploaded Images */}
              {gameState.lobby?.images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {gameState.lobby.images.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                          {image.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Players List */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-500" />
                Players ({gameState.lobby?.players.length}/{gameState.lobby?.maxPlayers})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gameState.lobby?.players.map((player) => (
                  <div
                    key={player.id}
                    className={`p-4 rounded-lg border-2 ${
                      player.isHost 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {player.isHost && (
                          <Crown className="w-5 h-5 text-primary-500 mr-2" />
                        )}
                        <span className="font-semibold text-gray-800">
                          {player.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Score: {player.score}
                      </span>
                    </div>
                    
                    {player.isHost && (
                      <span className="text-xs text-primary-600 font-medium">
                        Host
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Game Rules */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">How to Play:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Upload images to the lobby (PNG, JPG, GIF up to 5MB)</li>
                  <li>• Each round, one image is randomly selected</li>
                  <li>• Write a funny caption for the image (60 seconds)</li>
                  <li>• Vote for the funniest caption anonymously (30 seconds)</li>
                  <li>• Get +2 points for each vote received, +1 for voting</li>
                  <li>• Play 5 rounds to determine the winner!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Lobby
