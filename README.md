# 🏢 SocietySphere

> **A Multi-Tenant Smart Society Management & Analytics Platform**

SocietySphere is a full-stack SaaS web application developed as a combined academic project for **Full Stack Development (FSD-2)** and **Python for Data Analytics (FCSP-2)**.

The platform digitizes residential society operations while providing analytics, reporting, ETL pipelines, and machine learning-based insights.

---

# ✨ Features

## Platform Features (Completed)
- Multi-Tenant Architecture
- Society Registration & Approval
- JWT Authentication
- Role-Based Access Control (RBAC)
- Society Setup Wizard
- Resident Management
- Occupancy Management
- Visitor Management
- QR Visitor Passes
- Walk-in Visitors
- Service Management (Complaints & Work Orders)
- Maintenance Billing
- Expense Tracking
- Parking Management
- Amenity Booking
- Notice Board
- Notifications
- Dashboard & Reports

## Analytics Features (Completed)
- Synthetic Dataset Generation
- ETL Pipeline (Extraction, Cleaning, Transformation)
- Feature Engineering
- Machine Learning Classification Models (Priority, Categorization)
- Model Evaluation & Metrics Tracking
- Analytics API for Predictions
- React Analytics Dashboard

---

# 🛠 Technology Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Multer

## Analytics
- Python
- Pandas
- NumPy
- Scikit-Learn
- Matplotlib
- Joblib

---

# 📁 Project Structure

```text
societysphere/
│
├── backend/          # Node.js + Express API
├── frontend/         # React SPA
├── python-analytics/ # ETL & Machine Learning Service
├── docs/             # PRD, SRS, TRD, API & Database Docs
├── README.md
└── LICENSE
```

---

# 🏗 System Architecture

```text
                React Frontend
                       │
                       ▼
               Express REST API
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
   MongoDB Database          Python Analytics
                                      │
                         ETL • EDA • Machine Learning
                                      │
                                      ▼
                           Reports & Predictions
```

---

# 👥 User Roles

| Role | Responsibilities |
|------|------------------|
| Super Admin | Platform Management |
| Society Admin | Society Operations |
| Resident | Society Services |
| Security Staff | Visitor Verification |
| Service Staff | Work Order Execution |

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/societysphere.git
cd societysphere
```

## 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

## 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 4. Python Analytics Setup
```bash
cd python-analytics
# Windows
python -m venv .venv
.venv\Scripts\activate
# Linux/Mac
# python3 -m venv .venv
# source .venv/bin/activate

pip install -r requirements.txt
python main.py
```

---

# 🌐 Local URLs

| Service | URL |
|---------|-----|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:5000` |
| Python Analytics | `http://localhost:8000` |

---

# 📌 Current Modules

| Module | Status |
|----------|:------:|
| Authentication | ✅ |
| Platform Administration | ✅ |
| Society Setup | ✅ |
| Resident Management | ✅ |
| Visitor Management | ✅ |
| Service Management | ✅ |
| Maintenance Billing | ✅ |
| Parking | ✅ |
| Amenity Booking | ✅ |
| Notices | ✅ |
| Reports | ✅ |
| Python Analytics | ✅ |

---

# 🔮 Future Enhancements (Planned)
- Payment Gateway Integration (Stripe/Razorpay)
- External Notifications (SMS / WhatsApp)
- Dedicated Mobile App (React Native)

---

# 📚 Documentation

The repository includes comprehensive documentation located in the `docs/` directory:
- Product Requirement Document (PRD)
- Software Requirement Specification (SRS)
- Technical Requirement Document (TRD)
- System Security (Security.md)
- API Documentation
- Database Architecture
- System Workflows & Architecture
- Deployment & Environment Guides

---

# 👨💻 Contributors

- Daksh Rathod
- Team Members

---

# 📄 License

This project is developed for academic purposes.
