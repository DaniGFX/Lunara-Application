# LUNARA

## Product Requirements Document (PRD)

**Product type:** Personal Finance and Budget Planner Mobile
Application\
**Tagline:** Your Money, Your Universe.\
**Version:** 2.0 --- Revised Draft\
**Primary platform:** Android\
**Future platform:** iOS\
**Default currency:** Philippine Peso (PHP / ₱)

------------------------------------------------------------------------

## 1. Product Overview

LUNARA is a personal finance and budget planner mobile application that
helps users record income and expenses, manage monthly budgets, monitor
spending habits, and track savings goals in one place.

The application will provide a simple dashboard showing the user's
financial situation. It will include transaction management, budget
categories, savings goals, recurring transactions, and financial
reports.

The initial release is intended for personal use on Android. The
architecture should allow future support for iOS and a possible
web-based version.

## 2. Product Goals

1.  Make it easy to record daily income and expenses.
2.  Help users create and monitor monthly budgets.
3.  Show how much money is available based on recorded transactions.
4.  Help users set savings goals and monitor progress.
5.  Present clear summaries of spending and income.
6.  Keep each user's financial information private and secure.
7.  Provide a clean, friendly, and easy-to-use mobile experience.

## 3. Target Users

**Primary user:** An individual who wants to manage personal finances,
monitor expenses, plan monthly spending, and save money.

**User needs:** - Quickly add income or expense transactions. - See
total income, expenses, and available balance. - Identify categories
with the highest spending. - Set monthly spending limits. - Track
savings goals. - Review previous transactions and financial summaries.

## 4. Technology Stack

  -------------------------------------------------------------------------
  Layer                   Technology                Purpose
  ----------------------- ------------------------- -----------------------
  Mobile framework        React Native              Build the Android app
                                                    and support future iOS
                                                    development

  Development platform    Expo                      Simplify React Native
                                                    development, testing,
                                                    and builds

  Programming language    JavaScript                Main application
                                                    language

  Styling                 NativeWind                Tailwind-style utility
                                                    classes for React
                                                    Native

  Backend platform        Supabase                  Authentication,
                                                    database access,
                                                    storage, and
                                                    server-side functions
                                                    when needed

  Database                PostgreSQL (Supabase)     Store profiles,
                                                    transactions, budgets,
                                                    and savings data

  Client library          Supabase JavaScript SDK   Connect the mobile app
                                                    to Supabase

  Server-side functions   Supabase Edge Functions   Handle trusted
                          (JavaScript/TypeScript)   server-side operations
                                                    when required

  Code editor             Visual Studio Code        Application development
  -------------------------------------------------------------------------

### 4.1 Technology Notes

-   React Native with Expo will be used for the mobile application.
-   NativeWind provides Tailwind-style utility classes for React Native.
    Regular Tailwind CSS is intended for web projects and is not used
    directly to style native React Native components.
-   Supabase will serve as the backend platform. It provides PostgreSQL
    database services, authentication, and APIs.
-   The app can use the Supabase JavaScript SDK to communicate with
    Supabase.
-   A separate Express.js server is not required for the initial version
    because Supabase provides the main backend services.
-   **Vue.js is optional and is not part of the initial mobile app.** It
    may be used later for a separate web dashboard or browser-based
    version, where regular Tailwind CSS can be used.
-   Supabase Edge Functions may be added for operations that should run
    securely on the server instead of on the user's device.

## 5. Project Scope

### 5.1 Included in the MVP

-   User registration and login
-   User profile and settings
-   Dashboard overview
-   Income recording
-   Expense recording
-   Transaction history
-   Default and custom categories
-   Monthly budget creation and monitoring
-   Savings goals and contributions
-   Basic financial reports and charts
-   Recurring transaction setup
-   Philippine Peso as the default currency
-   Secure, user-specific cloud data storage

### 5.2 Excluded from the MVP

-   Direct bank account connection
-   Automatic bank transaction importing
-   Money transfers or payment processing
-   Credit card processing
-   Cryptocurrency and investment tracking
-   Shared or family budgets
-   Multi-user household accounts
-   AI-generated financial advice
-   Full accounting and tax management
-   A web dashboard (possible future enhancement)

## 6. Functional Requirements

### 6.1 User Authentication

Users shall be able to: - Create an account using an email address and
password. - Sign in and sign out. - Reset a forgotten password through
the supported Supabase authentication flow. - Maintain an authenticated
session. - Access only data associated with their account.

**Acceptance criteria** - A user can register and log in with valid
credentials. - Invalid credentials display a clear error message. -
Signed-out users cannot access protected screens or another user's
records. - Passwords are handled by Supabase Auth and are not stored as
plain text in application tables.

### 6.2 Dashboard

The dashboard shall display a financial summary for the selected
month: - Total income - Total expenses - Available balance or net
balance from recorded transactions - Total budget - Amount spent against
budgets - Savings goal progress - Recent transactions - Spending summary
by category

The dashboard should provide shortcuts for adding income or expenses.

**Acceptance criteria** - Dashboard figures update after a transaction
is successfully saved, edited, or deleted. - The selected month controls
the displayed monthly totals. - Empty states are displayed when the user
has no transactions or budgets.

### 6.3 Income Management

Users shall be able to add, view, edit, and delete income transactions.

Each income transaction should contain: - Amount - Income category -
Date - Optional note or description

Example categories: salary, allowance, freelance work, gifts, and other
income.

### 6.4 Expense Management

Users shall be able to add, view, edit, and delete expense transactions.

Each expense transaction should contain: - Amount - Expense category -
Date - Optional note or description

Example categories: food, transportation, bills, education, shopping,
health, entertainment, and other expenses.

### 6.5 Transaction History

Users should be able to: - View transactions in date order. - Filter by
month or date range. - Filter by income or expense. - Filter by
category. - Search transaction notes or descriptions. - Open a
transaction to view its details. - Edit or delete a transaction.

### 6.6 Categories

The app shall provide default income and expense categories. Users
should be able to create, rename, and manage their own categories.

Each category must have a type so income categories cannot accidentally
be used for expenses, and vice versa.

Deleting a category must not silently delete its historical
transactions. The app should prevent deletion while in use or preserve
transaction history through a safe reference or category snapshot.

### 6.7 Monthly Budgets

Users shall be able to create a budget for a selected month. A budget
may include: - Budget name - Month - Total spending limit - One or more
spending categories - Optional category-specific limits

The app shall calculate spending against the applicable budget and show
the remaining amount.

**Acceptance criteria** - Users can create, view, edit, and delete
budgets. - The app displays the amount spent and remaining budget. - The
app indicates when spending reaches or exceeds a budget limit. - Budget
calculations use expense transactions only. - The same expense is not
counted more than once in a budget total.

### 6.8 Savings Goals

Users shall be able to create and manage savings goals.

Each goal should contain: - Goal name - Target amount - Current saved
amount - Optional target date - Optional description - Status (active,
completed, or archived)

Users can add or remove a savings contribution and view progress.

**Accounting rule:** A savings contribution is an allocation or transfer
toward a goal, not a new expense by default. The app must avoid
subtracting the same contribution twice from the available balance. If
the user makes a purchase using savings, that purchase should be
recorded as an expense.

### 6.9 Recurring Transactions

Users may define recurring income or expenses, such as monthly salary,
rent, subscriptions, or utility bills.

A recurring transaction should include: - Transaction type - Amount -
Category - Frequency (weekly, monthly, yearly, etc.) - Start date -
Optional end date - Next scheduled date - Active or paused status

For the MVP, recurring transactions may generate a reminder or
transaction draft for user confirmation. The app must prevent duplicate
transactions when users reopen the app or retry an operation.

### 6.10 Reports and Analytics

The app shall provide basic financial summaries: - Income versus
expenses for a selected month - Expenses by category - Monthly spending
trends - Budget usage - Savings goal progress

Reports should use clear labels and readable charts. Users should be
able to change the reporting period where applicable.

### 6.11 Profile and Settings

Users shall be able to: - View and update basic profile information. -
Set a preferred currency (PHP is the default). - Configure basic
notification preferences. - Sign out. - Request account deletion through
a clearly explained process.

## 7. User Interface and Design Requirements

### 7.1 Design Direction

LUNARA shall use a soft lavender, minimalist, and friendly visual style.
The interface should feel calm and organized rather than overly
technical.

### 7.2 Suggested Color Palette

  -----------------------------------------------------------------------
  Color                   Hex Code                Usage
  ----------------------- ----------------------- -----------------------
  Primary Lavender        `#9B87D4`               Main buttons and
                                                  primary actions

  Light Lavender          `#EAE3FA`               Cards, selected states,
                                                  soft backgrounds

  Background              `#F8F6FC`               Main screen background

  Dark Purple             `#574477`               Headings and important
                                                  text

  White                   `#FFFFFF`               Cards and content
                                                  surfaces

  Soft Pink               `#F5E5F3`               Secondary accents
  -----------------------------------------------------------------------

Colors should maintain sufficient contrast. Color must not be the only
way to communicate income, expenses, warnings, or budget status; labels
and icons should also be used.

### 7.3 Suggested Navigation

1.  **Home** -- dashboard and financial overview
2.  **Transactions** -- income, expenses, and transaction history
3.  **Budgets** -- monthly budgets and category limits
4.  **Savings** -- savings goals and contributions
5.  **Profile** -- account settings and preferences

The final navigation structure may be refined during UI prototyping.

### 7.4 Usability Requirements

-   Responsive layout for common Android screen sizes.
-   Common actions, especially adding a transaction, should require as
    few steps as practical.
-   Forms should validate required fields and numeric amounts.
-   Include loading, empty, success, and error states.
-   Destructive actions such as deleting a transaction should require
    confirmation.
-   Currency values should be formatted consistently.

## 8. Data Requirements and Proposed Database Design

Supabase PostgreSQL will store the application's data. Each user's
private records must be associated with their authenticated account.

### 8.1 Proposed Tables

  --------------------------------------------------------------------------
  Table                      Purpose                 Example Fields
  -------------------------- ----------------------- -----------------------
  `profiles`                 Additional user profile `id`, `full_name`,
                             information             `currency`,
                                                     `created_at`

  `categories`               Income and expense      `id`, `user_id`,
                             categories              `name`, `type`, `icon`,
                                                     `color`

  `transactions`             Recorded income and     `id`, `user_id`,
                             expenses                `category_id`, `type`,
                                                     `amount`,
                                                     `transaction_date`,
                                                     `note`

  `budgets`                  Monthly budget records  `id`, `user_id`,
                                                     `name`, `month`,
                                                     `total_limit`

  `budget_categories`        Category limits within  `id`, `budget_id`,
                             a budget                `category_id`,
                                                     `limit_amount`

  `savings_goals`            User savings targets    `id`, `user_id`,
                                                     `name`,
                                                     `target_amount`,
                                                     `target_date`, `status`

  `savings_contributions`    Contributions for       `id`, `goal_id`,
                             savings goals           `user_id`, `amount`,
                                                     `contribution_date`,
                                                     `note`

  `recurring_transactions`   Recurring income or     `id`, `user_id`,
                             expense definitions     `category_id`, `type`,
                                                     `amount`, `frequency`,
                                                     `next_date`, `status`

  `notification_settings`    User notification       `id`, `user_id`,
                             preferences             `budget_alerts`,
                                                     `goal_reminders`,
                                                     `recurring_reminders`
  --------------------------------------------------------------------------

This is a proposed starting schema. Exact columns, constraints, indexes,
and relationships should be finalized in database migrations before
implementation.

### 8.2 Data Integrity

-   Use primary keys and foreign keys for relationships.
-   Store monetary amounts using PostgreSQL `NUMERIC`, not
    floating-point types.
-   Validate that transaction amounts and budget limits are positive.
-   Store dates consistently and display them in the user's local
    timezone.
-   Use `created_at` and `updated_at` timestamps where appropriate.
-   Use database constraints to prevent invalid transaction types and
    statuses.
-   Handle category deletion without breaking historical transaction
    records.
-   Add indexes for frequently queried fields such as `user_id`,
    transaction date, and category references.

## 9. Financial Rules and Calculations

Financial calculations must be consistent across the dashboard,
transaction history, budgets, and reports.

### 9.1 Transaction Totals

For a selected date range: - **Total Income** = sum of all income
transactions in the date range. - **Total Expenses** = sum of all
expense transactions in the date range. - **Net Cash Flow** = Total
Income − Total Expenses.

### 9.2 Available Balance

For the initial version:

**Available Balance = Opening Balance + Total Income − Total Expenses**

Savings contributions should not be subtracted again if they are only
allocations of money already included in the available balance. If the
product later supports separate cash accounts or wallets, transfers
between those accounts must be modeled as transfers rather than income
or expenses.

The MVP should clearly define opening balance behavior. If opening
balance is not implemented, label the dashboard figure as **Net Balance
from Recorded Transactions**, not as the user's complete real-world bank
balance.

### 9.3 Budget Calculations

-   **Budget Spent** = sum of eligible expense transactions assigned to
    the budget's categories and period.
-   **Remaining Budget** = Budget Limit − Budget Spent.
-   A negative remaining amount means the user has exceeded the budget.

### 9.4 Savings Goal Progress

-   **Goal Progress (%)** = (Current Saved Amount ÷ Target Amount) ×
    100.
-   Progress may be capped visually at 100%, while the actual saved
    amount remains accurate.
-   A goal is completed when the saved amount reaches or exceeds its
    target.

### 9.5 Currency Handling

-   Default currency: Philippine Peso (PHP / ₱).
-   Store amounts as exact decimal values using a suitable database
    numeric type.
-   Format amounts according to the selected currency.
-   The initial release may use one currency per user. Multi-currency
    conversion is out of scope.

## 10. Security and Privacy Requirements

-   Use Supabase Authentication for account management.
-   Enable and correctly configure Row Level Security (RLS) on tables
    containing user-specific data.
-   RLS policies must ensure users can only read, create, update, or
    delete records they own.
-   Never expose the Supabase service-role key in the mobile
    application.
-   Use only the public/anon key in the client, protected by correctly
    configured RLS policies.
-   Keep secrets and privileged operations in secure server-side
    environments such as Supabase Edge Functions.
-   Validate sensitive operations on the server or database when
    client-side validation is insufficient.
-   Do not store passwords in application tables.
-   Avoid logging passwords, access tokens, or sensitive financial
    records.
-   Provide a clear account deletion and data-retention process.
-   Request only permissions necessary for app features.

## 11. Non-Functional Requirements

### Performance

-   Main screens should load promptly under normal network conditions.
-   Lists should support pagination or efficient loading as transaction
    records grow.
-   Database queries should retrieve only records needed for the current
    screen.

### Reliability

-   Show clear feedback when saving or loading fails.
-   Prevent duplicate transactions caused by repeated taps or network
    retries.
-   Do not show a success state until the save operation is confirmed.
-   Handle temporary network loss gracefully.

### Maintainability

-   Use reusable components and organized feature folders.
-   Separate UI components from data access and business logic.
-   Keep database schema changes in version-controlled migrations.
-   Use consistent naming conventions and code formatting.

### Compatibility

-   Target Android first.
-   Use Expo and React Native practices that support a future iOS build.
-   Test on an Android emulator and a physical Android device where
    possible.

### Accessibility

-   Use readable font sizes and sufficient color contrast.
-   Provide labels for buttons and form controls.
-   Do not communicate important information by color alone.

## 12. Suggested Application Structure

A possible project structure is:

``` text
lunara/
├── app/
│   ├── (auth)/
│   ├── (tabs)/
│   └── _layout.js
├── src/
│   ├── components/
│   ├── features/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   ├── savings/
│   │   └── reports/
│   ├── hooks/
│   ├── services/
│   │   └── supabase.js
│   ├── utils/
│   ├── constants/
│   └── theme/
├── supabase/
│   ├── migrations/
│   └── functions/
├── assets/
├── app.json
├── package.json
└── .env.example
```

This structure is a recommendation. If Expo Router is not selected,
navigation and entry points may be organized differently.

## 13. Development Phases

### Phase 1: Planning and Setup

-   Confirm requirements and MVP scope.
-   Create the React Native Expo project.
-   Configure JavaScript and NativeWind.
-   Create the Supabase project.
-   Configure environment variables and the Supabase client.

### Phase 2: Authentication and Database

-   Design the PostgreSQL schema.
-   Create database migrations.
-   Configure Supabase Auth.
-   Enable RLS and test user-specific access.

### Phase 3: Core Finance Features

-   Build the dashboard.
-   Implement income and expense transactions.
-   Implement transaction history and filters.
-   Implement categories.
-   Implement monthly budgets.

### Phase 4: Savings and Reports

-   Implement savings goals and contributions.
-   Implement recurring transaction setup.
-   Add charts and financial summaries.

### Phase 5: Testing and Refinement

-   Test calculations and edge cases.
-   Test authentication and RLS policies.
-   Test on Android devices.
-   Improve usability, accessibility, and error handling.

### Phase 6: Initial Release

-   Prepare the Android build.
-   Configure production Supabase settings.
-   Back up and verify database configuration.
-   Release for personal use and collect feedback.

## 14. Testing Requirements

### Functional Testing

-   Register, log in, log out, and password recovery.
-   Add, edit, and delete income transactions.
-   Add, edit, and delete expense transactions.
-   Filter and search transaction history.
-   Create and update monthly budgets.
-   Create savings goals and add contributions.
-   Review reports for different months.

### Financial Calculation Testing

-   Income-only month.
-   Expense-only month.
-   Month with both income and expenses.
-   Zero transactions.
-   Expense exactly equal to the budget.
-   Expense exceeding the budget.
-   Savings contribution without treating it as a second expense.
-   Decimal amounts and large values.
-   Editing or deleting a transaction and verifying that summaries
    update correctly.

### Security Testing

-   Confirm that one user cannot access another user's records.
-   Test RLS for select, insert, update, and delete operations.
-   Confirm that no service-role key is included in the mobile
    application bundle.
-   Verify that protected screens require an authenticated session.

### Usability Testing

-   Test on different Android screen sizes.
-   Check form validation and error messages.
-   Confirm that navigation and common actions are understandable.
-   Check text readability and color contrast.

## 15. MVP Acceptance Criteria

The initial version of LUNARA will be considered ready for personal use
when:

1.  A user can securely create an account and sign in.
2.  A user can add, edit, view, and delete income and expense
    transactions.
3.  The dashboard correctly displays income, expenses, and the defined
    balance figure.
4.  A user can create and monitor monthly budgets.
5.  A user can create savings goals and record contributions without
    double-counting money.
6.  A user can view basic reports for a selected period.
7.  User-specific data is protected by tested Supabase RLS policies.
8.  The app provides understandable loading, empty, success, and error
    states.
9.  The main features work on a supported Android device.

## 16. Future Enhancements

Potential future features include: - iOS release - Optional Vue.js web
dashboard - Export transactions and reports to CSV or PDF - Custom
themes - More detailed recurring transaction automation - Multiple
wallets or cash accounts - Budget notifications - Offline-first
transaction entry with safe synchronization - Optional app lock or
biometric authentication - Multi-currency support

These enhancements should be considered only after the MVP is stable.

## 17. Risks and Considerations

  -----------------------------------------------------------------------
  Risk                    Possible Impact         Mitigation
  ----------------------- ----------------------- -----------------------
  Incorrect financial     Misleading balances or  Define calculation
  calculations            reports                 rules and automate
                                                  tests before release

  Weak database access    Private financial data  Enable and test RLS
  policies                may be exposed          policies for every
                                                  user-owned table

  Duplicate recurring     Incorrect income or     Use safe schedule
  transactions            expense totals          handling and
                                                  duplicate-prevention
                                                  logic

  Network interruptions   Transactions may fail   Show save status and
                          or appear unsaved       safely handle retries

  Scope expansion         Delayed development     Keep the first release
                                                  limited to MVP features

  Confusion between       Balance may be counted  Treat savings
  savings and expenses    incorrectly             allocations as
                                                  transfers, not
                                                  additional expenses
  -----------------------------------------------------------------------

## 18. Final Product Summary

LUNARA is a lavender-themed personal finance and budget planner designed
to help users manage money in a simple and organized way. The initial
version will be an Android mobile application built with **React Native,
Expo, JavaScript, and NativeWind**, with **Supabase and PostgreSQL**
providing authentication and cloud data storage.

Vue.js is reserved as an optional technology for a future web version.
The first release will focus on reliable transaction tracking, clear
budget monitoring, savings goals, and accurate financial summaries.
