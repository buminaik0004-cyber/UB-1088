# 🏙️ Smart Civic Issue Reporting & Management System

A full-stack web application that enables citizens to report civic issues and allows authorities to manage and resolve them efficiently through a centralized digital platform.

---

## 📌 Problem Statement

Urban civic issues like potholes, garbage overflow, water leakage, and streetlight failures often go unreported or unresolved due to lack of a structured communication system between citizens and authorities.

This project provides a digital solution to:
- Allow citizens to report issues easily
- Enable authorities to track and update issue status
- Improve transparency and accountability
- Provide real-time tracking and analytics

---

## 🚀 Features

### 👤 Citizen Module
- User Registration & Login
- Report Issues with Description & Location
- Upload Images
- Track Complaint Status
- View Issues on Map
- Personal Dashboard

### 🏢 Authority Module
- Secure Authority Login
- View All Reported Issues
- Filter & Categorize Issues
- Update Issue Status (Pending / In Progress / Resolved)
- Analytics Dashboard

---

## 🛠️ Tech Stack

### 🌐 Frontend
- React (Vite)
- Tailwind CSS
- Firebase Authentication
- Leaflet.js (OpenStreetMap)

### 🖥️ Backend
- Python (Flask / FastAPI)
- Firebase Admin SDK

### 🗄️ Database
- Firebase Firestore

---

## 📂 Project Structure

civic-system/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── package.json
│
├── backend/
│   ├── app/
│   ├── main.py
│   └── requirements.txt
│
└── README.md

---

## ⚙️ Installation & Setup Guide

### 1️⃣ Clone Repository

git clone https://github.com/buminaik0004-cyber/UB-1088.git  
cd UB-1088

---

### 2️⃣ Frontend Setup

cd frontend  
npm install  
npm run dev  

Frontend runs on:  
http://localhost:5173

---

### 3️⃣ Backend Setup

cd backend  
python -m venv venv  
venv\Scripts\activate   (Windows)  
pip install -r requirements.txt  
python main.py  

Backend runs on:  
http://localhost:8000

---

## 🔐 Environment Configuration

Create necessary environment files for:
- Firebase configuration (frontend)
- Firebase Admin SDK (backend)

⚠️ Important:
- Do NOT upload serviceAccountKey.json
- Do NOT commit API keys
- Add sensitive files to .gitignore

---

## 📊 Future Enhancements

- AI-based issue classification
- Real-time notifications
- SMS/Email alerts
- Mobile application
- Role-based access control improvements
- Cloud deployment

---

## 👩‍💻 Developed By

Bhoomika  
Smart City & Urban Innovation Project
