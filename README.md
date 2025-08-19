# Make It Meme - Multiplayer Game 🎮

A real-time multiplayer web game where players upload images, write funny captions, and vote for the best memes! Built with React, Node.js, and Socket.IO.

## ✨ Features

- **Real-time Multiplayer**: Play with friends instantly using WebSockets
- **Custom Image Uploads**: Upload your own images (PNG, JPG, GIF up to 5MB)
- **Anonymous Voting**: Vote for captions without knowing who wrote them
- **Scoring System**: +2 points for votes received, +1 bonus for voting
- **Beautiful UI**: Modern, responsive design with TailwindCSS
- **Lobby System**: Create/join games with unique lobby codes
- **Game Phases**: Caption writing (60s) → Voting (30s) → Results
- **Leaderboard**: Real-time score tracking and rankings

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd make-it-meme-multiplayer
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Start both client and server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Client: http://localhost:5173
   - Server: http://localhost:3001

## 🎯 How to Play

### 1. Create or Join a Lobby
- Enter your name and create a new game
- Or join an existing game using a lobby code
- Share the lobby code with friends

### 2. Upload Images
- Each player can upload images to the lobby
- Supported formats: PNG, JPG, GIF
- Maximum file size: 5MB

### 3. Game Flow
- **Round Setup**: One image is randomly selected
- **Caption Phase**: Write a funny caption (60 seconds)
- **Voting Phase**: Vote for the funniest caption (30 seconds)
- **Results**: See scores and winner
- **Repeat**: 5 rounds total

### 4. Scoring
- **+2 points** for each vote your caption receives
- **+1 bonus point** for participating in voting
- Highest score wins!

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TailwindCSS** - Styling
- **Socket.IO Client** - Real-time communication
- **React Router** - Navigation
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Socket.IO** - Real-time server
- **Multer** - File upload handling
- **UUID** - Unique identifiers

### Features
- **Real-time WebSocket communication**
- **Image upload and storage**
- **Anonymous voting system**
- **Automatic game progression**
- **Responsive design**

## 📁 Project Structure

```
make-it-meme-multiplayer/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Game context
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── index.html         # HTML template
│   ├── tailwind.config.js # TailwindCSS config
│   └── package.json       # Frontend dependencies
├── server/                 # Node.js backend
│   ├── server.js          # Main server file
│   ├── uploads/           # Image storage (auto-created)
│   └── package.json       # Backend dependencies
├── package.json            # Root package.json
└── README.md              # This file
```

## 🔧 Development

### Available Scripts

```bash
# Root level
npm run dev              # Start both client and server
npm run install:all      # Install all dependencies
npm run build            # Build client for production
npm run start            # Start production server

# Client only
cd client
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Server only
cd server
npm run dev              # Start with nodemon
npm start                # Start production server
```

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=3001
NODE_ENV=development
```

## 🌐 Deployment

### Frontend (Vercel/Netlify)
1. Build the client: `npm run build`
2. Deploy the `client/dist` folder

### Backend (Heroku/Railway)
1. Set environment variables
2. Deploy the `server` folder
3. Update client Socket.IO connection URL

## 🎨 Customization

### Game Settings
- Modify `totalRounds` in `server/server.js`
- Adjust timers for caption/voting phases
- Change maximum players per lobby

### Styling
- Customize colors in `client/tailwind.config.js`
- Modify component styles in `client/src/index.css`
- Add new UI components in `client/src/components/`

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**
   - Change ports in `server/server.js` and `client/vite.config.js`

2. **Image upload fails**
   - Check server uploads directory permissions
   - Verify file size limits (5MB)

3. **Socket connection errors**
   - Ensure server is running on correct port
   - Check CORS settings in server

4. **Build errors**
   - Clear node_modules and reinstall: `npm run install:all`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- TailwindCSS for beautiful styling
- React team for the amazing framework
- All the meme creators who inspired this game! 😄

---

**Happy Memeing! 🎭✨**
