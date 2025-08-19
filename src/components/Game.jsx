import React, { useState, useEffect } from 'react'
import { useGame } from '../contexts/GameContext'
import { Clock, Users, Trophy, Laugh, Heart, Meh } from 'lucide-react'

const Game = () => {
  const { socket, gameState } = useGame()
  const [currentPhase, setCurrentPhase] = useState('caption')
  const [timeLeft, setTimeLeft] = useState(60)
  const [caption, setCaption] = useState('')
  const [captions, setCaptions] = useState([])
  const [votes, setVotes] = useState([])
  const [currentImage, setCurrentImage] = useState(null)
  const [round, setRound] = useState(1)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    // Socket event listeners for game updates
    socket.on('roundStarted', (data) => {
      setCurrentPhase('caption')
      setTimeLeft(data.timeLeft || 60)
      setCurrentImage(data.image)
      setRound(data.round)
      setCaption('')
      setCaptions([])
      setVotes([])
      setHasSubmitted(false)
      setHasVoted(false)
    })

    socket.on('votingStarted', (data) => {
      setCurrentPhase('voting')
      setTimeLeft(data.timeLeft || 30)
      setCaptions(data.captions)
      setHasSubmitted(true)
    })

    socket.on('roundResults', (data) => {
      setCurrentPhase('results')
      setCaptions(data.captions)
      setVotes(data.votes)
      setHasVoted(true)
    })

    socket.on('captionSubmitted', (data) => {
      // Update captions list when someone submits
      setCaptions(prev => {
        const existing = prev.find(c => c.playerId === data.playerId)
        if (existing) {
          return prev.map(c => 
            c.playerId === data.playerId ? { ...c, text: data.caption } : c
          )
        } else {
          return [...prev, { playerId: data.playerId, text: data.caption, votes: 0 }]
        }
      })
    })

    return () => {
      socket.off('roundStarted')
      socket.off('votingStarted')
      socket.off('roundResults')
      socket.off('captionSubmitted')
    }
  }, [socket])

  useEffect(() => {
    // Timer countdown
    if (timeLeft > 0 && currentPhase !== 'results') {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, currentPhase])

  const submitCaption = () => {
    if (caption.trim() && !hasSubmitted) {
      socket.emit('submitCaption', { caption: caption.trim() })
      setHasSubmitted(true)
    }
  }

  const voteForCaption = (captionId) => {
    if (!hasVoted) {
      socket.emit('voteCaption', { captionId })
      setHasVoted(true)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPhaseTitle = () => {
    switch (currentPhase) {
      case 'caption':
        return 'Write Your Caption'
      case 'voting':
        return 'Vote for the Funniest Caption'
      case 'results':
        return 'Round Results'
      default:
        return 'Game in Progress'
    }
  }

  const getPhaseDescription = () => {
    switch (currentPhase) {
      case 'caption':
        return 'Write a funny caption for the image below. You have 60 seconds!'
      case 'voting':
        return 'Vote for the funniest caption. You have 30 seconds!'
      case 'results':
        return 'See how everyone voted and check the scores!'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-600">Round {round}</h1>
            <p className="text-gray-600">{getPhaseTitle()}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {gameState.lobby?.players.length} players
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">{getPhaseDescription()}</h2>
              
              {/* Current Image */}
              {currentImage && (
                <div className="mb-6">
                  <img
                    src={currentImage.url}
                    alt={currentImage.name}
                    className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    {currentImage.name}
                  </p>
                </div>
              )}

              {/* Caption Phase */}
              {currentPhase === 'caption' && !hasSubmitted && (
                <div className="space-y-4">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write your hilarious caption here..."
                    className="input-field h-24 resize-none"
                    maxLength={200}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {caption.length}/200 characters
                    </span>
                    <button
                      onClick={submitCaption}
                      disabled={!caption.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Caption
                    </button>
                  </div>
                </div>
              )}

              {currentPhase === 'caption' && hasSubmitted && (
                <div className="text-center py-8">
                  <div className="text-green-500 mb-2">
                    <Laugh className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-lg font-semibold text-green-600">Caption Submitted!</p>
                  <p className="text-gray-600">Waiting for other players...</p>
                </div>
              )}

              {/* Voting Phase */}
              {currentPhase === 'voting' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {captions.map((captionItem, index) => (
                      <div
                        key={captionItem.playerId}
                        className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer"
                        onClick={() => voteForCaption(captionItem.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            Caption #{index + 1}
                          </span>
                          {votes.find(v => v.captionId === captionItem.id) && (
                            <span className="text-green-500">
                              <Heart className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                        <p className="text-gray-800 font-medium">{captionItem.text}</p>
                      </div>
                    ))}
                  </div>
                  
                  {!hasVoted && (
                    <p className="text-center text-gray-600">
                      Click on a caption to vote for it!
                    </p>
                  )}
                  
                  {hasVoted && (
                    <div className="text-center py-4">
                      <p className="text-green-600 font-medium">Vote submitted!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Results Phase */}
              {currentPhase === 'results' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {captions.map((captionItem, index) => (
                      <div
                        key={captionItem.playerId}
                        className={`p-4 border-2 rounded-lg ${
                          captionItem.votes > 0 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            Caption #{index + 1}
                          </span>
                          <span className="text-sm font-semibold text-primary-600">
                            {captionItem.votes} vote{captionItem.votes !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-gray-800 font-medium">{captionItem.text}</p>
                        {captionItem.votes > 0 && (
                          <div className="flex items-center mt-2 text-primary-500">
                            <Trophy className="w-4 h-4 mr-1" />
                            <span className="text-sm">Winner!</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Current Round Info */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold mb-4">Round {round} of 5</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phase:</span>
                  <span className="font-medium capitalize">{currentPhase}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Left:</span>
                  <span className="font-medium">{formatTime(timeLeft)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Images:</span>
                  <span className="font-medium">{gameState.lobby?.images.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Player Scores */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Leaderboard</h3>
              <div className="space-y-3">
                {gameState.lobby?.players
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0 ? 'bg-yellow-50 border-2 border-yellow-200' :
                        index === 1 ? 'bg-gray-50 border-2 border-gray-200' :
                        index === 2 ? 'bg-orange-50 border-2 border-orange-200' :
                        'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        {index === 0 && <Trophy className="w-4 h-4 text-yellow-500 mr-2" />}
                        {index === 1 && <Trophy className="w-4 h-4 text-gray-500 mr-2" />}
                        {index === 2 && <Trophy className="w-4 h-4 text-orange-500 mr-2" />}
                        <span className="font-medium text-gray-800">
                          {player.name}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">{player.score}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Game
