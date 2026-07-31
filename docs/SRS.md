# Software Requirement Specification (SRS)

**Project Name**: SocietySphere
**Version**: 2.0 (Final Implementation)

## 1. Introduction
This document specifies the functional requirements for SocietySphere, defining exactly what the system does from the perspective of its users.

## 2. Use Case Diagram

```mermaid
usecaseDiagram
    actor "Super Admin" as SA
    actor "Society Admin" as A
    actor "Resident" as R
    actor "Security Staff" as Sec
    actor "Service Staff" as SS

    rectangle SocietySphere {
        usecase "Approve Society" as UC1
        usecase "Setup Towers & Flats" as UC2
        usecase "Generate Maintenance Bills" as UC3
        usecase "Pay Maintenance Bill" as UC4
        usecase "Log Service Complaint" as UC5
        usecase "Assign Work Order" as UC6
        usecase "Complete Work Order" as UC7
        usecase "Generate Visitor QR" as UC8
        usecase "Scan QR Code" as UC9
        usecase "View Analytics Dashboard" as UC10
    }

    SA --> UC1
    SA --> UC10

    A --> UC2
    A --> UC3
    A --> UC6
    A --> UC10

    R --> UC4
    R --> UC5
    R --> UC8

    Sec --> UC9
    
    SS --> UC7
```

## 3. Functional Requirements

### 3.1 Authentication & Onboarding
- **FR1.1**: The system shall allow users to register a society and an admin account simultaneously.
- **FR1.2**: The system shall require Super Admin approval before a society becomes active.
- **FR1.3**: The system shall support flat occupancy mapping (Owner, Tenant, Vacant).

### 3.2 Service Management
- **FR2.1**: Residents shall be able to submit service complaints with photo attachments.
- **FR2.2**: Society Admins shall be able to assign complaints as Work Orders to Service Staff.
- **FR2.3**: Service Staff shall be able to update Work Order statuses to completion.

### 3.3 Maintenance Billing & Financials
- **FR3.1**: Admins shall be able to generate monthly maintenance bills.
- **FR3.2**: Residents shall be able to view and mark bills as paid.
- **FR3.3**: Admins shall be able to log society expenses.

### 3.4 Visitor Management
- **FR4.1**: Residents shall be able to generate QR passes for expected visitors.
- **FR4.2**: Security Staff shall be able to scan QR codes or manually enter walk-in visitors.

### 3.5 Analytics & Insights
- **FR5.1**: The system shall extract operational data via an ETL pipeline.
- **FR5.2**: The system shall provide predictive analytics for complaint categorization and priority.
- **FR5.3**: The frontend shall display analytics charts and metrics to the Society Admin.
