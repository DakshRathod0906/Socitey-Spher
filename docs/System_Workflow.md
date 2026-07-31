# System Workflow

This document describes the complete lifecycle of SocietySphere, detailing how a society goes from registration to daily operations, and finally to analytical insights.

## 1. Registration & Approval Flow

1. **Registration**: A representative visits `/register-society` and submits the society's details (name, address, admin credentials).
2. **Review**: The Super Admin logs in, reviews the pending application in the Platform Dashboard, and clicks **Approve**.
3. **Activation**: The society status changes to `ACTIVE`. The Society Admin can now log in.

## 2. Society Setup Workflow

Once approved, the Society Admin logs in to configure the infrastructure.
1. **Towers**: Admin defines the towers (e.g., Tower A, Tower B) and specifies the number of floors and flats per floor.
2. **Flats Generation**: The system automatically bulk-generates flat records (e.g., A-101, A-102) based on the tower configuration.
3. **Amenities & Parking**: Admin adds amenities (Pool, Gym) and defines available parking slots.
4. **Staff Setup**: Admin creates user accounts for Security Guards and Service Staff (Plumbers, Electricians).

## 3. Resident Onboarding

1. **Invitation**: The Society Admin or existing Owner sends an email invitation to a new resident for a specific Flat.
2. **Acceptance**: The resident clicks the link, sets their password, and logs in.
3. **Occupancy**: The system updates the Flat status to `OCCUPIED` and creates an `Occupancy` record linking the user to the flat.

## 4. Daily Operations (Service Management)

### Visitor Management
1. **Pre-Approval**: A resident generates a QR code pass for an expected guest via their portal.
2. **Entry**: The guest shows the QR code at the gate. The Security Staff scans it to verify and marks the status as `ENTERED`.
3. **Walk-in**: If unexpected, the staff logs the details, and the resident receives a notification to approve or deny entry.

### Complaint Lifecycle
1. **Creation**: Resident raises a complaint (e.g., "Leaking Pipe") with photos.
2. **Assignment**: Society Admin reviews it and creates a **Work Order**, assigning it to a specific Service Staff (e.g., Plumber).
3. **Resolution**: Service Staff marks the work order as completed. 
4. **Closure**: The Admin closes the complaint. The resident can optionally provide a rating.

## 5. Maintenance Billing & Financials

1. **Generation**: On the 1st of the month, the Admin generates maintenance bills for all occupied flats.
2. **Payment**: Residents view the bill in their portal and record a payment.
3. **Expenses**: Admin records society outgoing expenses (e.g., Electricity bill, Staff salaries).

## 6. Analytics Pipeline Flow

While operational data flows continuously into MongoDB, the Python Analytics service works asynchronously:

1. **ETL Execution**: Python scripts extract the historical complaints, bills, and visitor data from MongoDB.
2. **Data Cleaning**: Categorical variables are encoded, and missing values are handled.
3. **Model Prediction**: The ML pipeline predicts complaint resolution times and categories.
4. **Dashboard View**: When the Society Admin visits the Analytics page in the React app, the frontend requests `/dashboard` from the Python API, which returns real-time insights and pre-calculated ML metrics.
