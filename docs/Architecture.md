# System Architecture

SocietySphere utilizes a hybrid architecture combining a transactional MERN stack (MongoDB, Express, React, Node.js) with a dedicated Python Analytics service.

## 1. High-Level Architecture

```mermaid
graph TD
    Client[React Frontend - SPA]
    
    subgraph Operational Platform
        NodeAPI[Node.js / Express API]
        Mongo[(MongoDB)]
    end
    
    subgraph Analytics Platform
        Python[Python FastAPI / Flask]
        ETL[ETL Pipeline]
        ML[Machine Learning Models]
    end

    Client -- "REST API (JSON)" --> NodeAPI
    Client -- "Analytics API" --> Python
    NodeAPI -- "Mongoose" --> Mongo
    Mongo -- "Raw Data Export" --> ETL
    ETL --> ML
    ML --> Python
```

## 2. Architectural Class Diagram (Backend MVC)

The Node.js Operational Platform strictly adheres to an MVC-based Service-oriented architecture.

```mermaid
classDiagram
    class Routes {
        +AuthRoutes
        +ComplaintRoutes
        +BillingRoutes
        +AnalyticsRoutes
    }
    
    class Controllers {
        +AuthController
        +ComplaintController
        +BillingController
        +AnalyticsController
    }
    
    class Services {
        +UserService
        +ComplaintService
        +BillingService
        +AnalyticsService
    }
    
    class Models {
        +User
        +Complaint
        +Bill
        +WorkOrder
        +Visitor
    }
    
    class Database {
        +MongoDB Atlas
    }
    
    class ExternalAPI {
        +Python Analytics API
    }

    Routes --> Controllers : Routes HTTP requests to
    Controllers --> Services : Delegates business logic to
    Services --> Models : Manages data via
    Models --> Database : Persists in
    AnalyticsController --> ExternalAPI : HTTP Communication
```

## 3. Request Lifecycle

1. **Client Request**: The React frontend sends an HTTP request (e.g., `POST /api/complaints`).
2. **Security & Validation**: Request passes through Auth, Tenant isolation, and validation layers (Detailed in `Security.md`).
3. **Controller Layer**: Handles HTTP logic, extracts params, and formats the response.
4. **Service Layer**: Executes core business rules.
5. **Database**: Executes the query using Mongoose.
6. **Response**: Standardized JSON response returned to the client.

## 4. Analytics & Machine Learning Pipeline

The Python Analytics service operates asynchronously from the transactional Node.js API to ensure heavy computations do not block operational workflows.

```mermaid
graph LR
    Mongo[(Operational DB)] -->|Export/Fetch| Raw[Raw Datasets]
    Raw --> ETL[ETL Scripts]
    ETL --> Clean[Cleaned Datasets]
    Clean --> FE[Feature Engineering]
    FE --> Model[Scikit-Learn Models]
    Model --> Predict[Prediction API]
    Predict --> Dashboard[React Analytics Dashboard]
```

*Note: For detailed security policies, RBAC, and data isolation strategies, please see `Security.md`.*
