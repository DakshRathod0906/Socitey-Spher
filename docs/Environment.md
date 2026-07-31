# Environment Variables

This document lists all environment variables required to run the SocietySphere platform across its three services.

## 1. Backend (`backend/.env`)

| Variable | Description | Example Value |
|---|---|---|
| `PORT` | The port the Node API runs on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/societysphere` |
| `JWT_SECRET` | Secret key for signing auth tokens | `your-super-secret-jwt-key` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `ML_SERVICE_URL` | URL for the Python API | `http://localhost:8000` |
| `ML_SERVICE_TIMEOUT`| Timeout in ms for Python requests | `5000` |

## 2. Frontend (`frontend/.env`)

*Note: Vite requires variables to be prefixed with `VITE_` to be exposed to the client.*

| Variable | Description | Example Value |
|---|---|---|
| `VITE_API_URL` | URL pointing to the Backend API | `http://localhost:5000/api` |
| `VITE_ANALYTICS_URL` | URL pointing to Python API | `http://localhost:8000/api/v1` |

## 3. Python Analytics (`python-analytics/.env`)

| Variable | Description | Example Value |
|---|---|---|
| `PORT` | Port for the Python API server | `8000` |
| `MONGO_URI` | Read-only connection to MongoDB | `mongodb://127.0.0.1:27017/societysphere` |
| `ENVIRONMENT` | Environment type (dev/prod) | `development` |
| `DATASET_PATH`| Path to save CSV datasets | `./datasets` |
| `MODEL_PATH` | Path to save trained models | `./models` |

## Security Best Practices
- Never commit `.env` files to version control. (They are included in `.gitignore`).
- Use strong, random strings for `JWT_SECRET`.
- In production, restrict the `CLIENT_URL` to the exact domain of the frontend.
