# SSGops Platform — Complete Technical & Functional Documentation

> **Version:** April 2026  
> **Purpose:** Full reference document for onboarding a new AI assistant, developer, or team member into the SSGops platform. Covers every module, data flow, entity schema, inter-module dependency, user role, and business logic.

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Technology Stack](#2-technology-stack)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [App Structure & Navigation](#4-app-structure--navigation)
5. [Database Entities (Full Schemas)](#5-database-entities-full-schemas)
6. [Module: TradeFlow](#6-module-tradeflow)
   - 6.1 Purpose & Objectives
   - 6.2 Fulfillment Types
   - 6.3 Order Lifecycle — China Hub
   - 6.4 Order Lifecycle — Direct Express
   - 6.5 Shipment Management
   - 6.6 Order Form & Draft System
   - 6.7 China Agent Portal
   - 6.8 Dashboard & Stats
   - 6.9 Customers & Suppliers
7. [Module: PCS (Price Comparison Sheet)](#7-module-pcs-price-comparison-sheet)
   - 7.1 Purpose & Objectives
   - 7.2 PCS Lifecycle & Pipeline Stages
   - 7.3 Sheet Structure
   - 7.4 Approval Workflow
   - 7.5 Send to Tradeflow Bridge
   - 7.6 PCS Dashboard (Kanban)
8. [Inter-Module Dependencies (PCS ↔ TradeFlow)](#8-inter-module-dependencies-pcs--tradeflow)
9. [Backend Functions](#9-backend-functions)
10. [Settings Module](#10-settings-module)
11. [Home Portal](#11-home-portal)
12. [Status Reference Tables](#12-status-reference-tables)
13. [Key Business Rules & Constraints](#13-key-business-rules--constraints)
14. [Data Flow Diagrams (Text)](#14-data-flow-diagrams-text)

---

## 1. Platform Overview

**SSGops** is the internal operations platform for **SSG International Trading**, a Qatar-based trading company that sources products primarily from China and delivers them to clients in Qatar and the wider Gulf region.

### Core Objectives

| Objective | Description |
|-----------|-------------|
| **Procurement Management** | Compare supplier quotes, select winners, manage approval workflows |
| **Logistics Tracking** | Track orders from supplier dispatch in China to delivery in Qatar |
| **Agent Collaboration** | Allow China-based agents to update order statuses via a secure portal |
| **Operational Visibility** | Real-time dashboards showing pipeline value, shipment status, unbooked orders |
| **Traceability** | Every order has a unique SSG reference number (e.g. `SSG-0042`) linking PCS procurement to Tradeflow logistics |

### Current Live Modules

| Module | Route | Status |
|--------|-------|--------|
| **TradeFlow** | `/tradeflow` | ✅ Active |
| **PCS** | `/pcs`, `/pcs-sheets`, `/pcs-create`, `/pcs-detail` | ✅ Active |
| **China Agent Portal** | `/china-agent` | ✅ Active (token-gated, public) |
| **Settings** | `/settings` | ✅ Active (admin only) |
| **Document Hub** | `/documents` | 🔗 Linked (external) |
| **Training Portal** | `/learning` | 🔗 Linked (external) |
| **Qatar News** | Built into Home | ✅ Active |

---

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, shadcn/ui components |
| **State Management** | TanStack React Query (server state), React useState (local) |
| **Routing** | React Router v6 |
| **Animations** | Framer Motion |
| **Backend / DB** | Base44 platform (BaaS — entities, auth, functions) |
| **Backend Functions** | Deno Deploy (via Base44) |
| **Real-time** | Base44 entity subscriptions (WebSocket-based) |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Notifications** | Sonner (toast) |

---

## 3. User Roles & Permissions

The platform has three primary roles:

### `admin`
- Full access to all modules and all records
- Can invite users, access Settings
- Only role that can **Send PCS to Tradeflow**
- Only role that can **Mark PCS as Completed**
- Can delete orders in Tradeflow
- Manages China Agent portal tokens
- Can view and manage all PCS sheets regardless of ownership

### `manager`
- Can access PCS module
- Can **approve or reject** PCS sheets submitted for approval
- Can **award** a PCS sheet after approval
- Can **reassign** PCS ownership to other users
- Can revert sheets to In Progress
- Cannot perform admin-only actions (Send to Tradeflow, Mark Completed)

### `user`
- Standard employee / team member
- Can create and edit PCS sheets assigned to them
- Can submit PCS sheets for approval
- Can view Tradeflow (no delete permission)
- Some users require explicit `can_access_pcs` flag set via Settings (User Access tab)

### China Agent (External, No Login)
- Accesses the system via a token-gated URL: `/china-agent?token=XXXXXX`
- Can only view **China Hub orders** (financial data is stripped from their view)
- Can only update orders to `dispatched_to_hub` or `received_at_hub`
- Cannot modify SSG-controlled statuses (`pending`, `confirmed`, `in_transit`, `delivered`)

---

## 4. App Structure & Navigation

```
SSGops Home (/)
├── TradeFlow (/tradeflow) — Nested layout with sidebar
│   ├── Dashboard (/tradeflow) — index
│   ├── Orders (/tradeflow/orders)
│   ├── Shipments (/tradeflow/shipments)
│   ├── Customers (/tradeflow/customers)
│   └── Suppliers (/tradeflow/suppliers)
│
├── PCS Dashboard (/pcs) — Kanban pipeline view
├── PCS Sheets List (/pcs-sheets) — Table list view
├── PCS Create Sheet (/pcs-create) — New sheet form
├── PCS Sheet Detail (/pcs-detail?id=SHEET_ID) — Full sheet view
│
├── Settings (/settings) — Admin only
│   ├── User Access & Team
│   ├── Currencies
│   ├── China Agent Tokens
│   └── App Info
│
├── China Agent Portal (/china-agent?token=TOKEN) — Public, token-gated
├── Bulk Invite (/bulk-invite)
└── Qatar News (embedded in Home)
```

### Global Header
- Present on all non-Tradeflow pages
- Shows: SSG Logo (links to Home), Live clock (Qatar time), Weather widget
- Admin links: **Invite Users**, **Settings**
- Logout button

### TradeFlow Sidebar Layout
- TradeFlow has its own nested layout (`components/tradeflow/AppLayout`)
- Sidebar navigation: Dashboard, Orders, Shipments, Customers, Suppliers
- Does NOT use the global Header component

---

## 5. Database Entities (Full Schemas)

All entities automatically include: `id`, `created_date`, `updated_date`, `created_by` (email).

---

### `Order` — Core logistics order record

| Field | Type | Description |
|-------|------|-------------|
| `alibaba_order_ref` | string | **SSG order number** — auto-generated as `SSG-XXXX` when order is confirmed. Also used for non-Alibaba orders. |
| `platform_order_ref` | string | Platform-specific reference number (e.g., eBay order ID) |
| `source_platform` | enum | `Alibaba`, `eBay`, `Amazon`, `TEM`, `Alibaba Direct`, `Other Direct` |
| `fulfillment_type` | enum | `china_hub` (consolidation via China hub) or `direct_express` (direct to Qatar) |
| `product_name` | string | ⭐ **Required.** Product or commodity name |
| `quantity` | number | Order quantity |
| `unit` | string | Unit of measure (pcs, kg, set, etc.) |
| `unit_price` | number | Unit price |
| `currency` | string | Default: `USD` |
| `total_amount` | number | quantity × unit_price |
| `customer_name` | string | End client name |
| `customer_id` | string | Optional customer reference |
| `supplier_name` | string | Supplier or seller name |
| `supplier_salesperson` | string | Contact person at supplier |
| `supplier_wechat` | string | Supplier's WeChat/phone |
| `team_member_name` | string | SSG team member handling this order |
| `status` | enum | See Order Status table below |
| `domestic_tracking_number` | string | China domestic courier tracking (Hub orders) |
| `express_tracking_number` | string | International express tracking (Direct orders) |
| `estimated_delivery_date` | date | Estimated delivery to Qatar |
| `order_date` | date | Date order was placed |
| `weight_kgs` | number | Weight in kilograms |
| `cbm` | number | Volume in cubic meters |
| `num_cartons` | number | Number of cartons |
| `shipment_id` | string | FK → `Shipment.id` (Hub orders only) |
| `notes` | string | Free-text notes |
| `supplier_quotes` | array | Array of supplier quote objects (stored inline) |

---

### `Shipment` — Consolidated shipping batch

| Field | Type | Description |
|-------|------|-------------|
| `shipment_number` | string | ⭐ **Required.** Auto-generated (e.g., `SHP-0001`) |
| `shipment_type` | enum | `china_hub` or `direct_express` |
| `description` | string | Shipment description |
| `status` | enum | `preparing`, `booked`, `in_transit`, `customs`, `delivered`, `cancelled` |
| `transport_mode` | enum | `sea`, `air`, `road`, `rail`, `express` |
| `carrier` | string | Shipping carrier name |
| `tracking_number` | string | Master shipment tracking number |
| `origin` | string | Default: `Shenzhen, China` |
| `destination` | string | Delivery destination |
| `departure_date` | date | Vessel/flight departure date |
| `arrival_date` | date | Expected arrival in Qatar |
| `order_ids` | array | Array of `Order.id` values in this shipment |
| `notes` | string | Notes |
| `received_in_qatar` | boolean | Whether arrived in Qatar |
| `qatar_received_date` | date | Date received in Qatar |
| `qatar_notes` | string | Notes on Qatar receipt |

---

### `PriceComparisonSheet` — PCS procurement record

| Field | Type | Description |
|-------|------|-------------|
| `pcs_number` | string | Auto-generated (e.g., `PCS-00001`) |
| `po_number` | string | ⭐ **Required.** Client Purchase Order number |
| `sq_number` | string | SSG Sales Order number |
| `rfq_number` | string | Client RFQ (Request for Quotation) number |
| `client_name` | string | ⭐ **Required.** Client/Customer name |
| `date` | date | PCS creation date |
| `po_date` | date | Customer PO date |
| `quoted_lead_time_weeks` | number | Lead time in weeks |
| `quoted_lead_time_days` | number | Lead time in days |
| `status` | enum | See PCS Status table below |
| `assigned_to` | string | Email of user responsible for this PCS (overrides creator) |
| `submitted_by` | string | Email who submitted for approval |
| `remarks` | string | General remarks |
| `total_selling_value` | number | Aggregate selling value (QAR) |
| `tradeflow_order_ref` | string | Linked Tradeflow Order SSG ref (e.g., `SSG-0042`) |
| `tradeflow_order_id` | string | Linked Tradeflow Order entity `id` |

---

### `LineItem` — Individual product line within a PCS

| Field | Type | Description |
|-------|------|-------------|
| `pcs_id` | string | ⭐ FK → `PriceComparisonSheet.id` |
| `item_number` | number | Sequence number |
| `description` | string | ⭐ **Required.** Product/item description |
| `unit` | string | Unit of measure |
| `quantity` | number | Required quantity |
| `selling_price` | number | Unit selling price to client |
| `total_selling_price` | number | qty × selling_price |
| `awarded_provider_id` | string | FK → `Provider.id` (the winner) |
| `image_urls` | array | Reference images |

---

### `Provider` — Supplier participating in a PCS bid

| Field | Type | Description |
|-------|------|-------------|
| `pcs_id` | string | ⭐ FK → `PriceComparisonSheet.id` |
| `provider_number` | number | Sequence (1–4) |
| `name` | string | Supplier/provider name |
| `contact_person` | string | Contact name |
| `delivery_period` | string | Lead time description |
| `payment_terms` | string | Payment terms |
| `delivery_terms` | string | Incoterms (FOB, CIF, etc.) |
| `currency` | string | Quote currency, default: `QAR` |
| `exchange_rate` | number | Rate to QAR, default: 1 |
| `freight_charges` | number | Additional freight |
| `is_awarded` | boolean | Whether this provider won |

---

### `ProviderQuote` — Price per line item per provider

| Field | Type | Description |
|-------|------|-------------|
| `pcs_id` | string | ⭐ FK → `PriceComparisonSheet.id` |
| `provider_id` | string | ⭐ FK → `Provider.id` |
| `line_item_id` | string | ⭐ FK → `LineItem.id` |
| `unit_price` | number | Provider's unit price |
| `total_price` | number | unit_price × quantity |

---

### `Approval` — Approval record for a PCS

| Field | Type | Description |
|-------|------|-------------|
| `pcs_id` | string | ⭐ FK → `PriceComparisonSheet.id` |
| `status` | enum | `pending`, `approved`, `rejected` |
| `requested_by` | string | Email of submitter |
| `approved_by` | string | Email of approver/rejector |
| `approval_date` | datetime | Timestamp of decision |
| `remarks` | string | Manager comments |

---

### `Supplier` — Master supplier record (Tradeflow)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | ⭐ **Required.** Company name |
| `contact_person` | string | Contact person |
| `email` | email | Email address |
| `phone` | string | Phone |
| `country` | string | Country |
| `product_categories` | string | Categories supplied |
| `payment_terms` | string | Payment terms |
| `rating` | number | Internal rating 1–5 |
| `notes` | string | Notes |

---

### `Customer` — Master customer record (Tradeflow)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | ⭐ **Required.** Company/customer name |
| `contact_person` | string | Contact |
| `email` | email | Email |
| `phone` | string | Phone |
| `notes` | string | Notes |

---

## 6. Module: TradeFlow

### 6.1 Purpose & Objectives

TradeFlow is the **logistics and order management** module of SSGops. Its job is to:
- Track every product order from the moment it is placed with a supplier until it is delivered in Qatar
- Manage **two fulfillment channels** (China Hub consolidation and Direct Express)
- Group Hub orders into **Shipments** for consolidated freight management
- Give the China agent a **real-time view** of their orders and allow them to update statuses
- Provide management with **live dashboards** showing pipeline health, unbooked orders, and active shipments

---

### 6.2 Fulfillment Types

#### China Hub (`china_hub`)
- Used for: **Alibaba** orders
- Flow: Supplier → China Hub (Shenzhen) → Consolidated Shipment → Qatar
- Orders are grouped into `Shipment` records before departing China
- China Agent is responsible for dispatching goods to the hub and confirming receipt
- Tracking: `domestic_tracking_number` (within China)

#### Direct Express (`direct_express`)
- Used for: **eBay, Amazon, TEM, Alibaba Direct, Other Direct**
- Flow: Seller → Direct international courier → Qatar
- No shipment grouping required
- Tracking: `express_tracking_number`
- Statuses skip hub-specific steps

---

### 6.3 Order Lifecycle — China Hub

```
pending
  → (SSG) confirmed                    [Supplier confirmed order, goods being made]
    → (Agent) dispatched_to_hub        [Supplier shipped to hub]
      → (Agent) received_at_hub        [Hub received & logged goods]
        → (SSG) in_transit             [Loaded on international shipment]
          → (SSG) delivered            [Arrived in Qatar]

cancelled  [available at any stage, SSG only]
```

**Status ownership:**
| Status | Who can set it |
|--------|----------------|
| `pending` | SSG (auto on create) |
| `confirmed` | SSG team member |
| `dispatched_to_hub` | **China Agent** |
| `received_at_hub` | **China Agent** |
| `in_transit` | SSG team member |
| `delivered` | SSG team member |
| `cancelled` | SSG (admin required for delete) |

---

### 6.4 Order Lifecycle — Direct Express

```
pending
  → confirmed    [Order placed & confirmed]
    → in_transit [International courier tracking active]
      → delivered
```

---

### 6.5 Shipment Management

Shipments are **containers** that group multiple China Hub orders for consolidated freight.

#### Creating a Shipment
- Navigate to **Tradeflow → Shipments**
- Click **New Shipment**
- Shipment numbers are auto-generated: `SHP-0001`, `SHP-0002`, etc.
- Each shipment has: transport mode (sea/air/road/rail/express), carrier, origin (default: Shenzhen, China), destination, departure/arrival dates

#### Assigning Orders to Shipments
- The **Unassigned Pool** at the top of the Shipments page shows all Hub orders not yet in a shipment
- Click "Assign to [Shipment]" to link an order
- This sets `order.shipment_id = shipment.id` and updates `shipment.order_ids`

#### Shipment Status Flow
```
preparing → booked → in_transit → customs → delivered → [received_in_qatar = true]
```

#### Mark as Received in Qatar
- Special action: opens a dialog to record `qatar_received_date` and `qatar_notes`
- Sets `received_in_qatar = true` and `status = delivered`
- Moves the shipment to the **Received in Qatar Archive** section

#### Deleting a Shipment
- All orders linked to the shipment are **unlinked** (`shipment_id` cleared)
- Orders return to the Unassigned Pool
- A confirmation dialog shows how many orders will be affected

---

### 6.6 Order Form & Draft System

#### New Order
- Opens via **"+ New Order"** button on Orders page
- SSG order number (`SSG-XXXX`) is assigned only **at the moment of confirm/save**, not on form open
- This prevents duplicate numbers from abandoned forms
- The system fetches the latest 500 orders to find the highest `SSG-XXXX` number and increments

#### Order Form Sections
1. **Product / Commodity** — Platform, platform ref, order date, product name, supplier info
2. **Logistics & Financials** — Weight (KGS), CBM, cartons, quantity, unit price, currency
3. **Tracking & Status** — Tracking number(s), estimated delivery, status, team member, customer
4. **Supplier Quotes** — Inline quote management
5. **Notes**

#### Draft System
- When a user starts a new order but closes the form without saving, a **"Save Draft?"** dialog appears
- Drafts are saved to **localStorage** (browser-side, per user)
- Drafts panel appears on the Orders page if drafts exist
- Users can resume or discard drafts
- When a draft is confirmed into a real order, the draft is deleted from localStorage

---

### 6.7 China Agent Portal

**URL:** `/china-agent?token=YOUR_TOKEN`

The China Agent Portal is a **separate, public-facing page** (no login required) that gives the China-based agent a mobile-friendly view of their orders.

#### Access Control
- Access is via **secret token** in the URL
- Tokens are stored in the admin user's `data.china_agent_tokens` array
- The backend function `chinaAgentPortal` validates the token against all admin users' stored tokens
- Admins manage tokens in **Settings → China Agent** tab
- Admin users can preview the portal without a token (uses their first saved token automatically)

#### What the Agent Sees
- **All China Hub orders only** (direct express orders are excluded)
- Orders are **grouped by Shipment** — collapsible shipment panels with color-coded headers
- Orders not yet assigned to a shipment appear in a yellow "Awaiting Shipment Booking" section
- Financial data (unit price, total amount, customer name, team member) is **intentionally excluded** from the agent's view

#### What the Agent Can Do
- Update order status to `dispatched_to_hub` or `received_at_hub` only
- SSG-owned statuses show a "SSG" lock badge — no action available
- Expand each order to see: tracking number, WeChat, cartons, notes

#### Agent Portal Stats Header
- Total orders, Dispatched count, At Hub count, Delivered count
- Booking bar: how many are booked vs unbooked into shipments

#### Backend Function: `chinaAgentPortal`
- Handles two actions: `getOrders` and `updateStatus`
- `getOrders`: returns all china_hub orders with shipment data merged in, financial fields stripped
- `updateStatus`: validates agent-allowed statuses only (`dispatched_to_hub`, `received_at_hub`), verifies the order is china_hub type before updating

---

### 6.8 Dashboard & Stats

The TradeFlow Dashboard (`/tradeflow`) shows:

| Stat Card | Value |
|-----------|-------|
| Total Orders | All order count |
| Active Shipments | Non-delivered, non-cancelled shipments |
| Unbooked Hub Orders | Hub orders without a shipment that are in active statuses |
| Total Value | Sum of all `total_amount` across orders |

**Alert Banner:** If unbooked hub orders > 0, a yellow alert banner links to the Orders page.

**Quick Access Cards:** China Hub Orders · Direct Express · Shipments (with live counts)

**Active Orders List:** Last 10 active orders with status badge and shipment reference

---

### 6.9 Customers & Suppliers

- `/tradeflow/customers` — CRUD for customer master records
- `/tradeflow/suppliers` — CRUD for supplier master records
- These are **reference tables** for the Tradeflow module
- Currently informational — not hard-linked to Order records (supplier name on Order is free text)

---

## 7. Module: PCS (Price Comparison Sheet)

### 7.1 Purpose & Objectives

The PCS module manages the **pre-purchase procurement process**. Before an order goes to Tradeflow, SSG must:
1. Receive a client RFQ (Request for Quotation) or PO
2. Go to market and collect quotes from multiple suppliers
3. Compare prices (the Price Comparison Sheet)
4. Get management approval
5. Select a winning supplier (Award)
6. Send the awarded order to Tradeflow for execution

The PCS module is the **procurement intelligence layer** that sits upstream of TradeFlow.

---

### 7.2 PCS Lifecycle & Pipeline Stages

```
draft
  → in_progress         [Team member collecting quotes]
    → pending_approval  [Submitted for manager sign-off]
      → approved        [Manager approved, ready to award]
      → rejected        [Manager rejected, needs revision]
        → in_progress   [Revise and resubmit]
      → awarded         [Winning supplier selected]
        → ordered       [Sent to Tradeflow — Order created]
          → completed   [Delivered & closed]
```

| Stage | Code | Color | Who can trigger |
|-------|------|-------|-----------------|
| Draft | `draft` | Grey | (initial state) |
| In Progress | `in_progress` | Amber | Auto / revert |
| Pending Approval | `pending_approval` | Blue | Owner submits |
| Approved | `approved` | Green | Manager |
| Rejected | `rejected` | Red | Manager |
| Awarded | `awarded` | Violet | Manager |
| Ordered | `ordered` | Indigo | Admin (Send to Tradeflow) |
| Completed | `completed` | Green | Admin |

---

### 7.3 Sheet Structure

A PCS sheet (`/pcs-detail?id=SHEET_ID`) contains:

#### Header (`PcsSheetHeader`)
- PCS Number, Client Name, PO Number, SQ Number, RFQ Number
- Sheet dates, lead times, status badge
- Tradeflow order link (if in `ordered` or `completed` state)

#### Summary Card (`PcsSummaryCard`)
- Total selling value, total quote values, quote coverage
- Progress indicators across providers

#### Line Items (`PcsLineItemsSection`)
- Each line item: item number, description, unit, quantity, selling price, total
- Image attachments per line item
- Add/edit/delete (owner, manager, admin only)

#### Providers Section (`PcsProvidersSection`)
- Up to 4 providers/suppliers per PCS
- Per provider: name, contact, delivery period, payment terms, incoterms, currency, exchange rate, freight charges
- Live exchange rate fetching when editing non-QAR currencies

#### Price Comparison Table (`PcsQuickEntryTable`)
- **The core comparison grid**: Rows = Line Items, Columns = Providers
- Shows unit price and total per provider per item
- Highlights the winning (lowest/awarded) price
- Allows fast inline entry of all prices

#### Split Order Summary (`PcsSplitOrderSummary`)
- Shows how different line items may be awarded to different providers
- Aggregates awarded subtotals per provider

#### Approval Section (`PcsApprovalSection`)
- Visual workflow timeline (all stages shown as progress bar)
- Role-specific action buttons (submit, approve, reject, award, revert)
- Reassign ownership dropdown (manager/admin)
- Send to Tradeflow modal (admin only)
- Complete button (admin only)

---

### 7.4 Approval Workflow

#### As Owner (User who created or was assigned the PCS)
- When status is `draft` or `in_progress`: "Submit for Approval" button appears
- Clicking submits → sets `status = pending_approval`, records `submitted_by`

#### As Manager/Admin — Reviewing
- When status is `pending_approval`: "Approve" and "Reject" buttons appear
- Can add comments/remarks
- **Approve** → creates/updates `Approval` record, sets `status = approved`
- **Reject** → creates/updates `Approval` record, sets `status = rejected`

#### After Approval
- Manager can click **"Award PCS to Suppliers"** → sets `status = awarded`

#### After Rejection
- Owner can click **"Revise & Resubmit"** → reverts to `in_progress`

#### Reassignment
- Manager/Admin can reassign PCS ownership to another user via dropdown
- `assigned_to` field overrides `created_by` for ownership checks
- Reassigned badge shown on sheet

---

### 7.5 Send to Tradeflow Bridge

This is the **critical integration point** between PCS and TradeFlow.

**Trigger:** When a PCS is in `awarded` status and an admin clicks "Send to Tradeflow"

**What happens:**
1. A modal opens pre-filled with: product name (from RFQ/PO number), customer name, order value
2. Admin fills in awarded supplier name and confirms
3. A new **`Order` record is created** in Tradeflow with:
   - `status: "pending"`
   - `source_platform: "Other Direct"`
   - `fulfillment_type: "direct_express"`
   - `notes: "Linked from PCS PCS-XXXXX"`
   - Financial and logistics details from the form
4. The PCS record is updated:
   - `status → "ordered"`
   - `tradeflow_order_ref` = the new order's SSG number (e.g., `SSG-0042`)
   - `tradeflow_order_id` = the new order's entity ID
5. The PCS card now shows a **Tradeflow badge** with the linked order reference

**This bridge is available from two places:**
- `PcsApprovalSection` component (inside `/pcs-detail`)
- `PcsDashboard` Kanban card (the "Send to Tradeflow →" button on Awarded cards)

---

### 7.6 PCS Dashboard (Kanban)

The PCS Dashboard (`/pcs`) is a **Kanban-style pipeline board** showing all sheets organized by stage.

**Columns (left to right):**
1. In Progress (Gathering Quotes)
2. Awaiting Approval
3. Approved
4. Awarded
5. Ordered / In Trade
6. Completed

**Features:**
- Click any card → opens full sheet detail
- Search bar filters cards across all columns
- Stats bar: Active Pipeline Value, Needs Action count, Sent to Tradeflow count, Completed count
- "Send to Tradeflow →" button appears on **Awarded** cards (Admin only)
- Non-admin users see "Admin only" lock badge on Awarded cards
- Admin badge in header confirming Send to Tradeflow is enabled

---

## 8. Inter-Module Dependencies (PCS ↔ TradeFlow)

This is the most important architectural relationship in the platform.

```
PCS Module                              TradeFlow Module
─────────────────────────────────────   ─────────────────────────────────
PriceComparisonSheet
  status: "awarded"
       │
       │ Admin clicks "Send to Tradeflow"
       │
       ▼
  Creates ──────────────────────────────► Order
  PCS.tradeflow_order_ref = "SSG-XXXX"   Order.notes = "Linked from PCS-XXXX"
  PCS.tradeflow_order_id  = Order.id     Order.status = "pending"
  PCS.status = "ordered"                 
       │
       │ Order proceeds through Tradeflow
       │ (Supplier ships → Hub → Shipment → Qatar)
       │
       ▼
  Admin marks PCS as "completed"         Order.status → "delivered"
  PCS.status = "completed"
```

### Key Dependency Rules

1. **PCS → TradeFlow is a one-way push.** Creating the Order is triggered from PCS, not pulled from Tradeflow.
2. **The link is stored on PCS**, not on Order. The Order has a text note but no formal FK back to PCS.
3. **The PCS status is managed independently** of the linked Order's status. Completing a PCS is an admin decision, not automatic from Order delivery.
4. **Only `admin` role** can trigger "Send to Tradeflow". Managers can approve/award but cannot push to Tradeflow.
5. **The `tradeflow_order_ref` field** on PCS is the human-readable cross-reference (e.g., `SSG-0042`).
6. **The `tradeflow_order_id` field** on PCS is the machine-readable entity ID for direct DB linking.

---

## 9. Backend Functions

### `chinaAgentPortal`
**File:** `functions/chinaAgentPortal.js`

| Property | Value |
|----------|-------|
| Auth | Token-based (no user login) |
| Actions | `getOrders`, `updateStatus` |
| Access | Public (called from China Agent Portal page) |

**`getOrders`:**
- Validates token against all admin users' `data.china_agent_tokens`
- Returns all `china_hub` orders merged with their shipment data
- Strips: `customer_name`, `customer_id`, `unit_price`, `total_amount`, `team_member_name`, `express_tracking_number`

**`updateStatus`:**
- Agent can only set: `dispatched_to_hub` or `received_at_hub`
- Validates order exists and is `china_hub` type before updating
- Returns 403 if trying to set an SSG-controlled status

---

## 10. Settings Module

**Route:** `/settings` (Admin only)

### User Access & Team Tab
- View all registered users
- Grant/revoke `can_access_pcs` flag for non-admin users
- User list shows role and access status

### Currencies Tab
- Configure supported currencies for the platform

### China Agent Tab (`ChinaAgentTokenSettings`)
- Generate and manage **access tokens** for the China Agent Portal
- Tokens are stored in the admin user's `data.china_agent_tokens` array
- Each token produces a unique URL: `https://[app-domain]/china-agent?token=XXXXXXXX`
- Admins can copy the URL to send to the agent
- Tokens can be revoked by deleting them

### App Info Tab
- General application metadata

---

## 11. Home Portal

**Route:** `/` — The SSGops portal homepage.

### Layout
- Fixed header with SSG logo, live clock (updates every second), weather (Doha)
- Dark grey hero banner with large SSG logo
- Search bar that filters available applications
- Application grid (3 columns on desktop)
- Qatar News tile (AI-powered news widget for Qatar)
- Footer: "2026 SSG OPS. All rights reserved."

### Application Cards
The home page dynamically renders app cards from the `COMPANY_APPS` constant in `lib/constants.js`.

| App | Description | Route |
|-----|-------------|-------|
| TradeFlow | Logistics & order management | `/tradeflow` |
| PCS | Price comparison & procurement | `/pcs` |
| Document Hub | Google Docs integration | `/documents` (external) |
| Training Portal | Google Classroom integration | `/learning` (external) |

---

## 12. Status Reference Tables

### Order Statuses (Unified — `lib/constants.js`)

| Value | Display Label | Style | Owner |
|-------|--------------|-------|-------|
| `pending` | Pending | Amber | SSG |
| `confirmed` | Order Placed - Awaiting Supplier To Ship | Blue | SSG |
| `dispatched_to_hub` | Dispatched to Hub | Orange | **Agent** |
| `received_at_hub` | Received at Hub | Teal | **Agent** |
| `in_transit` | In Transit to Qatar | Purple | SSG |
| `delivered` | Delivered | Green | SSG |
| `cancelled` | Cancelled | Grey | SSG (admin) |

> ⚠️ The label for `confirmed` is intentionally long — it communicates to the agent that SSG has confirmed the order was placed and they are now waiting for the supplier to physically ship.

### PCS Statuses

| Value | Display Label | Color |
|-------|--------------|-------|
| `draft` | Draft | Grey |
| `in_progress` | In Progress | Amber |
| `pending_approval` | Pending Approval | Blue |
| `approved` | Approved | Green |
| `rejected` | Rejected | Red |
| `awarded` | Awarded | Violet |
| `ordered` | Ordered | Indigo |
| `completed` | Completed | Green |

### Shipment Statuses

| Value | Description |
|-------|-------------|
| `preparing` | Being organized, not yet booked |
| `booked` | Booking confirmed with carrier |
| `in_transit` | Departed origin, en route |
| `customs` | In Qatar customs clearance |
| `delivered` | Delivered to destination |
| `cancelled` | Shipment cancelled |

---

## 13. Key Business Rules & Constraints

1. **SSG Order Numbers** (`alibaba_order_ref`) follow format `SSG-XXXX` (zero-padded 4 digits). They are assigned at order creation time by fetching the current max number from the DB to avoid duplicates. This field is used for ALL order types (not just Alibaba).

2. **PCS Numbers** (`pcs_number`) follow format `PCS-XXXXX` (zero-padded 5 digits). Auto-generated on sheet creation.

3. **Shipment Numbers** follow format `SHP-XXXX`. Auto-generated on creation.

4. **Only one Approval record** per PCS sheet (`pcs_id` is the key). On re-approve/reject, the existing record is updated, not duplicated.

5. **Direct Express orders are never assigned to Shipments.** The Unassigned Pool and Shipment Assignment UI only shows `china_hub` fulfillment type orders.

6. **When a Shipment is deleted**, all linked orders have their `shipment_id` cleared and are returned to the Unassigned Pool. Orders that were `in_transit` are reverted to `received_at_hub`.

7. **PCS ownership** is determined by `assigned_to` (if set) or falls back to `created_by`. The "effective owner" is `sheet.assigned_to || sheet.created_by`.

8. **canEdit in PCS** = `isOwner || isManager || isAdmin`. Regular non-owner users can view but not edit.

9. **China Agent token validation** is against ALL admin users' token arrays — so any admin can generate tokens and they all work.

10. **The `total_amount` on Order** = `quantity × unit_price`. Calculated at save time, not computed live.

11. **Real-time subscriptions**: The Orders page subscribes to both `Order` and `Shipment` entity changes, automatically refreshing the query cache when records change (useful for collaborative multi-user editing).

12. **Closed Orders (delivered/cancelled) are lazy-loaded** in the Orders page — only fetched when the user clicks the "Completed / Closed" tab. This keeps the active orders list fast.

---

## 14. Data Flow Diagrams (Text)

### A. Full Order Lifecycle — China Hub

```
CLIENT INQUIRY
     │
     ▼
[PCS Module]
  Create PCS Sheet
  Add Line Items
  Add Providers (suppliers)
  Enter quotes in comparison table
  Submit for approval
  Manager approves
  Manager awards supplier
     │
     │ Admin: "Send to Tradeflow"
     ▼
[TradeFlow — Order Created]
  status: pending
  (SSG → confirmed)
     │
     ▼
  (Agent: dispatched_to_hub)
  Supplier ships to Shenzhen Hub
     │
     ▼
  (Agent: received_at_hub)
  Hub receives and logs goods
     │
     ▼
  [Shipment Management]
  SSG creates Shipment record
  Assigns order to shipment
  Books freight (sea/air)
     │
     ▼
  (SSG: in_transit)
  Shipment departs China
     │
     ▼
  Shipment arrives Qatar
  SSG marks "Received in Qatar"
     │
     ▼
  (SSG: delivered)
  Order delivered
     │
     ▼
[PCS Module]
  Admin marks PCS as "completed"
  Lifecycle closed
```

### B. China Agent Portal Data Flow

```
Admin (Settings)
  └── Generates token → stored in User.data.china_agent_tokens

SSG Team Member
  └── Sends URL to China Agent: /china-agent?token=XXXXXXXX

China Agent (Browser — no login)
  └── Page loads → calls chinaAgentPortal backend function
       └── Validates token against DB
       └── Returns china_hub orders + shipment data (financial fields stripped)
       └── Agent sees orders grouped by shipment

Agent updates order status
  └── Calls chinaAgentPortal with action=updateStatus
       └── Validates agent-allowed statuses only
       └── Updates Order.status in DB
       └── SSG team sees update in real-time (subscriptions)
```

### C. PCS to TradeFlow Bridge

```
PCS Sheet
  status: "awarded"
  client_name: "COMPANY XYZ"
  pcs_number: "PCS-00042"
  total_selling_value: 45000
        │
        │ Admin clicks "Send to Tradeflow →"
        │ Fills in modal: product_name, supplier_name, customer_name, unit_price
        ▼
  Order.create({
    product_name: ...,
    supplier_name: ...,
    customer_name: ...,
    unit_price: 45000,
    currency: "QAR",
    status: "pending",
    source_platform: "Other Direct",
    fulfillment_type: "direct_express",
    notes: "Linked from PCS PCS-00042"
  })
        │
        │ Returns new Order (e.g., alibaba_order_ref = "SSG-0042")
        ▼
  PCS.update({
    status: "ordered",
    tradeflow_order_ref: "SSG-0042",
    tradeflow_order_id: "order_entity_id_here"
  })
```

---

## Appendix A: Supported Source Platforms

| Platform | Type | Notes |
|----------|------|-------|
| Alibaba | China Hub | Primary sourcing platform |
| eBay | Direct Express | Consumer marketplace |
| Amazon | Direct Express | Consumer/B2B marketplace |
| TEM | Direct Express | Specialized supplier |
| Alibaba Direct | Direct Express | Alibaba but direct shipment |
| Other Direct | Direct Express | Catch-all for direct sources |

## Appendix B: Team Members (as of April 2026)

From `lib/constants.js`:
- Najeeb
- Hilal
- Prasad
- Kiptta
- SSG
- Jassim
- Ishan

## Appendix C: Supported Currencies

`USD`, `EUR`, `GBP`, `AED`, `SAR`, `INR`, `CNY`, `JPY`

---

*This document was auto-generated from the SSGops source code on 29 April 2026.*  
*For questions or updates, refer to the Base44 development platform.*