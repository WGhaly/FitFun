# Weight Loss Competition Platform
## Business Requirements & Product Definition Document (PRD)

---

## 1. Product Overview

### 1.1 Product Name
Weight Loss Competition Platform (Working Title)

### 1.2 Purpose
A web-based, mobile-first platform that allows individuals to create and participate in weight-loss competitions, track progress over time, and determine winners based on predefined measurable criteria.

### 1.3 Product Goals
- Enable socially driven weight-loss challenges
- Provide transparent progress tracking and rankings
- Ensure fairness through clear rules and automation
- Minimize friction for MVP adoption

### 1.4 In Scope
- User registration and profile management
- Competition creation and participation
- Progress tracking and analytics
- Leaderboards and competition history
- Admin management and oversight

### 1.5 Out of Scope (Explicit)
- Payments or financial transactions
- Wearable or external integrations
- Email or push notifications
- Health verification or medical advice
- Native mobile applications (future phase)

---

## 2. Portals

### 2.1 User Portal
Audience: Competitors / Participants  
Access: Public registration, authenticated access

### 2.2 Admin Portal
Audience: Platform administrators  
Access: Restricted login

---

## 3. User Roles & Permissions

### 3.1 User (Competitor)
Can:
- Register and log in
- Create and join competitions
- Submit and edit measurements
- View analytics and leaderboards
- Submit testimonials
- Delete own account

Cannot:
- Manage other users
- Manage admins
- Modify competitions after start (unless creator cancellation)

---

### 3.2 Admin
Can:
- View and manage users
- View and manage competitions
- View and manage testimonials
- Reset admin passwords

Cannot:
- Create, edit, or delete admins

---

### 3.3 Super Admin
Can:
- Perform all Admin actions
- Create, edit, and delete admins

---

## 4. Authentication & Account Rules

### 4.1 Registration
- Method: Email + Password only
- No email verification
- No social login
- Email cannot be changed after registration
- Mandatory confirmation popup explaining email permanence

### 4.2 Login
- Email + Password

### 4.3 Account Deletion
- User-initiated
- Confirmation popup explaining cascade effects
- Cascade Rules:
  - If competition creator → creator role transfers to next joined participant
  - If participant → removed from competitions
- Historical data remains anonymized

---

## 5. User Profile

### 5.1 Mandatory Fields
- Email (system)
- Password (system)
- Real Name
- Display Name (public)
- Profile Image
- Weight (KG)
- Height (CM)

### 5.2 Optional Fields
- BMI
- Body Fat Percentage
- Muscle Mass Percentage
- Before Image
- After Image

### 5.3 Image Restrictions
- Image type: Photo
- File size limit enforced
- One image per category
- New upload replaces old image

---

## 6. Homepage (User Portal)

### 6.1 Sections
1. Priority Notifications Panel
2. Active Public Competitions
3. Testimonials / Success Stories

### 6.2 Active Competitions List
- Shows all active public competitions
- Sorted by popularity (number of participants)
- Columns:
  - Competition Name
  - Start Date
  - End Date
  - Participant Count
  - Measurement Methodology
  - Join Button

---

## 7. Competitions

### 7.1 Competition Creation

Fields:
- Competition Name
- Description
- Public / Private
- Join Mode:
  - Approval Required
  - Free Join
- Maximum Participants (mandatory for public)
- Start Date
- Duration (days)
- Measurement Method:
  - Absolute weight loss (KG)
  - Percentage weight loss
  - BMI-based
  - Body fat percentage loss
- Prize Description (text only)
- Winner Distribution:
  - 1st only
  - 1st + 2nd
  - 1st + 2nd + 3rd

Rules:
- Creator automatically joins
- Rules cannot be edited after start
- No payments handled by system

---

### 7.2 Joining a Competition
- Via competition code
- Approval workflow enforced if enabled
- Profile completeness validated based on competition methodology

---

### 7.3 Competition Visibility
Visible to non-participants:
- Leaderboard
- Participant display names
- Summary statistics

---

### 7.4 Competition Cancellation
Can be canceled by:
- Creator
- Admin

Effect:
- Competition marked as canceled
- Participants notified via in-app notification

---

## 8. Measurements & Progress

### 8.1 Measurement Rules
- Metric system only
- Measurement Frequency:
  - Default: Weekly
  - If duration < 30 days:
    - Duration ÷ 4 checkpoints
- Users may submit unlimited entries
- Minimum required entries enforced
- Entries editable until:
  - Competition end + 24-hour grace period

### 8.2 Anti-Cheating
- Honor system
- Reporting available in public competitions

---

## 9. Competition Completion & Winners

### 9.1 Completion Logic
- 24-hour grace period after end date
- After grace period:
  - Submissions locked
  - Winners auto-calculated
  - Competition archived

### 9.2 Tie Handling
- Ties allowed
- Rewards split evenly
- No tie-breaker logic

---

## 10. Analytics

### 10.1 User Analytics (Private)
- Progress over time
- Starting vs current stats
- Competitions joined
- Historical performance

### 10.2 Competition Analytics (Public)
- Leaderboard
- Progress overview
- Final rankings

### 10.3 Historical Data
- Display:
  - Last 6 months OR
  - Latest 200 competitions

---

## 11. Testimonials

### 11.1 Submission
- Prompted after competition ends
- Optional text submission

### 11.2 Admin Control
- Approve / hide testimonials from homepage

---

## 12. Notifications

### 12.1 Notification Type
- In-app only

### 12.2 Notification Events
- Join requests
- Approval/rejection
- Measurement reminders
- Competition start
- Competition end
- Results published

---

## 13. Admin Portal

### 13.1 Admin Management
- Super Admin only
- Auto-generated passwords
- Forced reset on first login
- Forced reset after admin-initiated reset

### 13.2 User Management
- View all users
- View profiles and competitions
- Remove users from competitions

### 13.3 Competition Management
- View all competitions
- Cancel competitions
- View analytics

### 13.4 Insights
- Aggregated location data
  - Country
  - City

---

## 14. Non-Functional Requirements

- Mobile-first responsive UI
- Always-online
- No offline mode
- Performance optimized for image usage
- No legal or age restrictions for MVP

---

## 15. Explicit Assumptions
None. All behaviors explicitly defined.

---

## 16. Blocking Questions
None. Document is complete.
