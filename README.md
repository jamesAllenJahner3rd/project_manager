# Project Manager - Real-Time Collaborative Kanban Board

A full-stack project management application featuring real-time collaborative Kanban boards, user authentication, and comprehensive project tracking capabilities.

![Project Status](https://img.shields.io/badge/Status-Development%20in%20Progress-orange)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-blue)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8+-orange)

> **Note**: This project is currently in active development. Demo deployment coming soon!

## 🚀 Features

### Core Functionality
- **Real-Time Kanban Boards**: Drag-and-drop interface with live updates across all connected users
- **Multi-User Collaboration**: Real-time synchronization using Socket.IO
- **Project Management**: Create, edit, and track multiple projects
- **Document Management**: Add, edit, and organize documents within projects
- **User Authentication**: Local and Google OAuth authentication
- **Role-Based Access**: Admin and regular user permissions
- **Real-Time Chat**: In-project communication system

### Advanced Features
- **Progress Tracking**: Visual progress indicators with automatic status updates
- **Burn-up Charts**: Project progress visualization
- **Document Status Management**: Four-stage workflow (To Do → In Progress → Testing → Done)
- **Color Customization**: Customizable document and column colors
- **Responsive Design**: Mobile-friendly interface
- **Real-Time Notifications**: Live updates for all project activities

### Technical Highlights
- **Real-Time Updates**: Instant synchronization across all connected clients
- **Drag-and-Drop**: Smooth document and column reordering
- **Auto-Save**: Automatic state persistence to database and localStorage
- **Error Handling**: Comprehensive error handling and user feedback
- **Security**: CSRF protection, input validation, and secure session management

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **Passport.js** - Authentication middleware
- **bcrypt** - Password hashing
- **Express Session** - Session management

### Frontend
- **EJS** - Template engine
- **Dragula** - Drag and drop library
- **Socket.IO Client** - Real-time client communication
- **Chart.js** - Data visualization
- **CSS3** - Styling and animations

### Development Tools
- **Nodemon** - Development server with auto-reload
- **Morgan** - HTTP request logger
- **Dotenv** - Environment variable management

## 📁 Project Structure

```
project_manager/
├── config/                 # Configuration files
├── controllers/           # Business logic
├── middleware/           # Custom middleware
├── models/              # Database schemas
│   ├── Project.js       # Project model
│   ├── Document.js      # Document model
│   ├── Kanban.js        # Kanban board model
│   ├── Profile.js       # User profile model
│   └── Chat.js          # Chat model
├── public/              # Static assets
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   └── images/         # Image assets
├── routes/             # API routes
├── views/              # EJS templates
│   └── partials/       # Reusable template components
├── server.js           # Main application entry point
└── package.json        # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/project_manager.git
   cd project_manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `config/` directory:
   ```env
   NODE_ENV=development
   PORT=8000
   DB_STRING=mongodb://localhost:27017/project_manager
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SESSION_SECRET=your_session_secret
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:8000`

## 🔧 Configuration

### Database Setup
The application uses MongoDB with Mongoose ODM. Ensure MongoDB is running and the connection string is properly configured in your environment variables.

### Authentication Setup
1. Create a Google OAuth application in the Google Cloud Console
2. Add your client ID and secret to the environment variables
3. Configure the authorized redirect URIs

### Socket.IO Configuration
Real-time features are automatically configured. The application handles:
- Room-based communication
- User presence tracking
- Real-time board updates
- Chat functionality

## 📊 Key Features in Detail

### Real-Time Kanban Board
- **Drag-and-Drop**: Move documents between columns with smooth animations
- **Auto-Save**: Changes are automatically saved to both localStorage and database
- **Live Updates**: All connected users see changes instantly
- **Status Tracking**: Documents progress through four stages automatically

### Document Management
- **Rich Editing**: Double-click to edit titles and descriptions
- **Color Customization**: Change document and column colors
- **Progress Tracking**: Visual indicators show document status
- **Bulk Operations**: Delete multiple documents with confirmation

### User Management
- **Authentication**: Local and Google OAuth login
- **Profile Management**: User profiles with project associations
- **Role Management**: Admin and regular user permissions
- **Team Collaboration**: Invite users to projects

## 🔒 Security Features

- **Password Hashing**: bcrypt for secure password storage
- **Session Management**: Secure session handling with MongoDB store
- **Input Validation**: Server-side validation for all inputs
- **CSRF Protection**: Cross-site request forgery protection
- **XSS Prevention**: Input sanitization and output encoding

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexing
- **Caching**: Local storage for offline functionality
- **Lazy Loading**: Efficient resource loading
- **Compression**: Gzip compression for static assets
- **CDN Ready**: Static assets optimized for CDN deployment

## 🚀 Deployment

### Heroku Deployment
1. Create a Heroku app
2. Set environment variables
3. Deploy using Git:
   ```bash
   git push heroku main
   ```

### Docker Deployment
```bash
# Build the image
docker build -t project-manager .

# Run the container
docker run -p 8000:8000 project-manager
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer**: Christopher Ament
- **Lead Developer**: James Jahner
- **Full-Stack Development**: Christopher Ament & James Jahner

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact: christopher.ament@example.com
- Documentation: [Coming Soon]

## 🔮 Roadmap

- [ ] Live demo deployment
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Integration with third-party tools
- [ ] Advanced reporting features
- [ ] API for external integrations
- [ ] Multi-language support

---

**Built with ❤️ by Christopher Ament & James Jahner using modern web technologies**
