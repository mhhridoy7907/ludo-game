# 🎲 MH2 LUDO – Dynamic Online Multiplayer Game

A fully functional, real-time online Ludo game built using Vanilla HTML, CSS, and JavaScript with Firebase integration.

The game will support online multiplayer gameplay, AI bots, dynamic game settings, and a powerful Admin Control Panel.

## 🚀 Core Features

- Real-time Ludo gameplay
- 2–4 player support
- Online multiplayer with multiple users
- Create Room and Join Room using Room ID
- Private and public game rooms
- Bot and Random AI players
- Real-time dice rolling
- Smart token movement and validation
- Token killing and capture system
- Safe zones
- Winning detection (4 tokens home)
- Extra turn when rolling 6
- Responsive desktop and mobile UI
- Smooth animations and sound effects

## 🌐 Online Multiplayer System

Players can play together from different devices using the internet.

Features:
- Create a new online room
- Join an existing room using Room ID
- Invite friends using a shareable room link
- Show online players and their status
- Real-time player positions and dice updates
- Automatic turn synchronization
- Reconnect after internet disconnection
- Handle player leaving or disconnecting
- Room owner can start the game
- Prevent unauthorized moves and cheating

## 👑 Admin Control Panel

Create a separate, secure Admin Dashboard where the administrator can dynamically control the entire game without editing the source code.

### Game Management
- Enable/Disable online multiplayer
- Enable/Disable bot players
- Enable/Disable private rooms
- Set maximum players (2–4)
- Control dice rolling rules
- Control extra turns
- Enable/Disable token capture
- Enable/Disable safe zones
- Set game timer
- Enable/Disable sound and animations

### Player Management
- View all registered players
- View online/offline status
- Search players
- View player game history
- Block/Unblock players
- Remove players from active rooms

### Room Management
- View all active rooms
- View room IDs and players
- Monitor ongoing matches
- Close or delete rooms
- Force-end a match
- Remove inactive rooms

### Dashboard Statistics
- Total registered users
- Currently online users
- Active game rooms
- Total completed matches
- Total games played
- Player win statistics

### Admin Settings
- Secure admin login
- Admin-only permissions
- Dynamic game configuration
- Real-time settings synchronization
- Admin activity logs

## 🛠️ Technologies

**Frontend**
- HTML5
- CSS3
- Vanilla JavaScript (ES6)
- Canvas API

**Backend**
- Firebase Authentication
- Firebase Realtime Database
- Firebase Security Rules
- Firebase Cloud Functions (where needed)

**Hosting**
- Firebase Hosting

## 🔥 Firebase Database Structure

Suggested database structure:

```text
MH2-LUDO/
│
├── users/
│   └── userId/
│       ├── name
│       ├── photo
│       ├── status
│       └── statistics
│
├── rooms/
│   └── roomId/
│       ├── host
│       ├── players
│       ├── gameState
│       ├── currentTurn
│       ├── dice
│       └── status
│
├── settings/
│   └── game/
│       ├── maxPlayers
│       ├── botsEnabled
│       ├── multiplayerEnabled
│       └── gameRules
│
├── admin/
│   └── admins/
│
└── matchHistory/
```

## 🔐 Security Requirements

- Only authenticated users can join online games.
- Only authorized admins can access the Admin Dashboard.
- Players can only update their own permitted game actions.
- Validate dice rolls and token movements on a trusted backend.
- Prevent unauthorized database modifications.
- Protect admin settings and player management operations using Firebase Security Rules and trusted backend functions.

## 📂 Project Structure

```text
MH2-LUDO/
│
├── index.html
├── style.css
├── script.js
│
├── admin/
│   ├── index.html
│   ├── admin.css
│   └── admin.js
│
├── multiplayer/
│   ├── room.js
│   ├── online.js
│   └── sync.js
│
├── img/
│   ├── d0.png
│   ├── d1.png
│   ├── d2.png
│   ├── d3.png
│   ├── d4.png
│   ├── d5.png
│   └── d6.png
│
└── firebase/
    ├── firebase-config.js
    └── database-rules.json
```

## 🎮 How to Play

1. Open the game website.
2. Select Offline or Online Multiplayer.
3. Enter your player name.
4. Create a room or join using Room ID.
5. Invite friends.
6. Wait for players to join.
7. Start the game.
8. Roll the dice and move your tokens.
9. First player to bring all 4 tokens home wins!

## 📌 Development Requirements

- Keep the frontend in Vanilla HTML, CSS and JavaScript.
- Do not use React, Vue, Angular or unnecessary frameworks.
- Use Firebase Realtime Database for real-time multiplayer synchronization.
- Make all admin-controlled settings dynamic.
- Changes made by the admin should automatically synchronize with connected players.
- Keep offline gameplay working even when Firebase is unavailable.
- Separate game logic, multiplayer logic and admin logic.
- Build a modern, professional, responsive gaming interface.

## 👨‍💻 Developer

**Murad Hasan Hridoy**

Brand: MH2 HRIDOY  
GitHub: https://github.com/mhhridoy7907  
Portfolio: https://mh2-hridoy.web.app  
WhatsApp: +880 1962-388570

## 📜 License

Open-source project for learning and development purposes.
