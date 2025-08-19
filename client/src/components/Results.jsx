import React from 'react'
import { useGame } from '../contexts/GameContext'
import { Trophy, Crown, Users, Star, Home, Share2 } from 'lucide-react'

const Results = () => {
  const { gameState, goHome } = useGame()
  const { finalResults } = gameState

  const winner = finalResults?.finalScores?.[0]
  const runnerUp = finalResults?.finalScores?.[1]
  const thirdPlace = finalResults?.finalScores?.[2]

  const shareResults = async () => {
    const text = `🎉 Just finished playing Make It Meme! 🏆 Winner: ${winner?.name} with ${winner?.score} points! 🎮`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Make It Meme Results',
          text: text,
          url: window.location.origin
        })
      } catch (err) {
        console.log('Share failed:', err)
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(text)
        alert('Results copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  if (!finalResults) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">Loading results...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary-600 mb-4">Game Over!</h1>
          <p className="text-xl text-gray-600">Thanks for playing Make It Meme!</p>
        </div>

        {/* Winner Section */}
        {winner && (
          <div className="card text-center mb-8">
            <div className="mb-6">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-yellow-600 mb-2">🏆 Winner! 🏆</h2>
              <h3 className="text-2xl font-bold text-gray-800">{winner.name}</h3>
              <p className="text-lg text-gray-600">Final Score: {winner.score} points</p>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-current" />
              ))}
            </div>
          </div>
        )}

        {/* Final Leaderboard */}
        <div className="card mb-8">
          <h3 className="text-2xl font-bold text-center mb-6">Final Standings</h3>
          
          <div className="space-y-4">
            {finalResults.finalScores?.map((player, index) => (
              <div
                key={player.name}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0 ? 'bg-yellow-50 border-2 border-yellow-200' :
                  index === 1 ? 'bg-gray-50 border-2 border-gray-200' :
                  index === 2 ? 'bg-orange-50 border-2 border-orange-200' :
                  'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold text-white">
                    {index === 0 ? (
                      <div className="bg-yellow-500">1</div>
                    ) : index === 1 ? (
                      <div className="bg-gray-500">2</div>
                    ) : index === 2 ? (
                      <div className="bg-orange-500">3</div>
                    ) : (
                      <div className="bg-gray-400">{index + 1}</div>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    {index === 0 && <Trophy className="w-5 h-5 text-yellow-500 mr-2" />}
                    {index === 1 && <Trophy className="w-5 h-5 text-gray-500 mr-2" />}
                    {index === 2 && <Trophy className="w-5 h-5 text-orange-500 mr-2" />}
                    <span className="text-lg font-semibold text-gray-800">
                      {player.name}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{player.score}</div>
                  <div className="text-sm text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {gameState.lobby?.players.length || 0}
            </div>
            <div className="text-gray-600">Players</div>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">5</div>
            <div className="text-gray-600">Rounds Played</div>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {gameState.lobby?.images.length || 0}
            </div>
            <div className="text-gray-600">Images Used</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={goHome}
            className="btn-primary flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Play Again
          </button>
          
          <button
            onClick={shareResults}
            className="btn-secondary flex items-center justify-center"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Results
          </button>
        </div>

        {/* Fun Message */}
        <div className="text-center mt-12">
          <div className="text-6xl mb-4">🎉 🎮 🎭</div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            You've just created {gameState.lobby?.players.length * 5} hilarious memes together! 
            Each caption was a masterpiece of comedy, and every vote counted in this epic battle of wit. 
            Until next time, keep the memes alive! 😄
          </p>
        </div>
      </div>
    </div>
  )
}

export default Results
