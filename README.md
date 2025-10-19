# AI-Powered Campaign Management Tool

A comprehensive Campaign Management tool inspired by IBM Unica, with AI assistance for segment creation and campaign generation. Built for non-technical users with visual interfaces and natural language processing.

## 🚀 Features

### Core Functionality
- **Customer Management**: CSV upload, data validation, and customer filtering
- **Visual Segment Builder**: Drag-and-drop interface for creating customer segments
- **AI-Powered Suggestions**: Natural language processing for segment creation
- **Campaign Builder**: Create and manage marketing campaigns
- **Journey Designer**: Visual multi-step campaign flows with React Flow
- **Analytics Dashboard**: Campaign performance and customer insights

### AI Capabilities
- Natural language segment creation ("customers who spent more than $100")
- AI-powered campaign suggestions
- Segment optimization recommendations
- Customer behavior insights

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **shadcn/ui** for beautiful, accessible components
- **React Flow** for visual journey designer
- **Tailwind CSS** for styling
- **React Router** for navigation

### Backend
- **FastAPI** for high-performance API
- **SQLAlchemy** for database ORM
- **PostgreSQL** with JSONB for flexible data storage
- **Pandas** for data processing
- **OpenAI API** for AI features

### Database
- **PostgreSQL** with optimized indexes
- **JSONB** for flexible filter and flow storage
- **Automatic timestamps** and triggers

## 📁 Project Structure

```
D:\ai-cvm-tool/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   └── main.py         # FastAPI app
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and API client
│   │   └── App.tsx        # Main app component
│   ├── package.json       # Node dependencies
│   └── tailwind.config.js # Tailwind configuration
├── database/              # Database files
│   ├── schema.sql         # Database schema
│   └── sample_data.sql    # Sample data
├── IMPLEMENTATION_PLAN.md # Detailed implementation plan
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 13+
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database and API keys
   ```

5. **Setup database**
   ```bash
   # Create PostgreSQL database
   createdb cvm_ai_tool
   
   # Run schema
   psql cvm_ai_tool < ../database/schema.sql
   ```

6. **Start the server**
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📊 Database Schema

### Core Tables
- **customers**: Customer data with demographics and purchase history
- **segments**: Customer segments with visual filters and SQL queries
- **campaigns**: Marketing campaigns with journey flows
- **offers**: Campaign offers with flexible value structures
- **campaign_executions**: Campaign tracking and performance data

### Key Features
- **JSONB columns** for flexible filter and flow storage
- **Automatic timestamps** with triggers
- **Optimized indexes** for fast queries
- **Foreign key constraints** for data integrity

## 🎯 Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Project structure and database setup
- Basic customer management
- Simple segment builder

### Phase 2: AI Integration (Week 3-4)
- Natural language segment creation
- AI-powered suggestions and optimization

### Phase 3: Campaign Management (Week 5-6)
- Campaign builder and dashboard
- Basic analytics and reporting

### Phase 4: Journey Designer (Week 6-7)
- Visual flow builder with React Flow
- Multi-step campaign execution

### Phase 5: Advanced Features (Week 7+)
- A/B testing and attribution
- Advanced AI features
- Performance optimization

## 🔧 Development

### Code Standards
- **TypeScript** for type safety
- **ESLint** and **Prettier** for code formatting
- **Pydantic** for data validation
- **SQLAlchemy** for database operations

### Testing
- **Unit tests** for business logic
- **Integration tests** for API endpoints
- **Component tests** for React components
- **E2E tests** for critical user flows

### Performance
- **Database indexing** for fast queries
- **Pagination** for large datasets
- **Caching** for expensive operations
- **Lazy loading** for frontend components

## 🔐 Security

- **Input validation** and sanitization
- **SQL injection** prevention
- **CORS** configuration
- **API rate limiting**
- **Data encryption** for sensitive information

## 📈 Monitoring

- **Structured logging** with timestamps
- **Performance metrics** tracking
- **Error monitoring** and alerting
- **User activity** analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the implementation plan

## 🗺️ Roadmap

### Short Term (Next 3 months)
- Complete MVP with basic features
- User testing and feedback
- Performance optimization

### Medium Term (3-6 months)
- Advanced AI features
- Multi-tenant support
- API integrations

### Long Term (6+ months)
- Machine learning models
- Real-time personalization
- Global deployment

---

**Built with ❤️ for marketers who want to create better campaigns with AI assistance.**
