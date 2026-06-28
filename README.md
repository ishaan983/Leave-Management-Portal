# Leave-Management-Portal
A web application where employees can apply for leave requests and administrators can approve or reject them.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** EJS, Tailwind CSS
- **Database:** MongoDB
- **Auth:** JWT, Bcrypt

## Features

- Employee Registration & Login
- Role-based Access (Employee / Admin)
- Apply for Leave
- View Leave History
- Admin Dashboard
- Approve / Reject Leave Requests
- Validation and Security

## Prerequisites

- Node.js installed
- MongoDB installed and running locally

## Setup Instructions

### 1. Clone the repository

git clone https://github.com/ishaan983/Leave-Management-Portal.git
cd Leave-Management-Portal

### 2. Install dependencies

npm install

### 3. Create .env file in the root folder

env
MONGO_URI=mongodb://localhost:27017/leaveportal
JWT_SECRET=your_jwt_secret
PORT=3000

### 4. Build Tailwind CSS

npm run build:css

### 5. Start the server

npm run dev

### 6. Open in browser

http://localhost:3000/register

## Project Structure

```text
LeavePortal/
├── models/
│   ├── User.js
│   └── LeaveRequest.js
├── middleware/
│   └── authMiddleware.js
├── routes/
│   ├── auth.js
│   ├── leave.js
│   └── admin.js
├── views/
│   ├── login.ejs
│   ├── register.ejs
│   ├── employee-dashboard.ejs
│   └── admin-dashboard.ejs
├── public/
│   ├── input.css
│   └── output.css
├── .env
├── server.js
└── package.json
```

## Usage

### As Employee:
1. Register with role Employee
2. Login
3. Apply for leave from the dashboard
4. View your leave history and status

### As Admin:
1. Register with role Admin
2. Login
3. View all employee leave requests
4. Approve or Reject pending requests


