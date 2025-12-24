# LogiTrack

LogiTrack is a comprehensive delivery driver management application built with Next.js. It enables drivers to track jobs, manage delivery workflows, capture photos, scan QR/barcodes, record incidents, and monitor delivery statuses in real-time.

## 🚀 Features

### Core Functionality

- **Job Management**: View assigned jobs, start jobs, and track delivery progress
- **Workflow Tracking**: Multi-step delivery workflow with status confirmation
- **Photo Capture**:
  - Check-in photos
  - Pickup photos (before close, seal, closed with seal, run sheet)
  - Delivery photos (before open, break seal, empty container, delivery run sheet)
  - Incident photos (up to 4 photos for travel incidents)
- **QR/Barcode Scanning**: Scan run sheets and delivery documents
- **Location Tracking**: Real-time GPS location with address geocoding using Geoapify API
- **Incident Reporting**: Record incidents during travel with type selection and photo documentation
- **Delivery Status**: Track job statuses (success, delay, cancel, standby)
- **Dashboard**: View delivery history and job summaries

### Workflow Steps

1. **Check-in**: Confirm job acceptance with timestamp
2. **Pickup**: Capture pickup photos and scan run sheet
3. **Departure**: Confirm departure with timestamp
4. **Incident Selection** (Optional): Select incident type if delay occurs
5. **Incident Photos** (If delayed): Capture 4 incident photos
6. **Arrival**: Confirm arrival at destination
7. **Delivery**: Complete delivery with POD photos

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **State Management**: React Hooks (Custom hooks)
- **Geocoding**: Geoapify API
- **Build Tool**: Turbopack

## 📁 Project Structure

```
LogiTrack/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   └── geocode/       # Geocoding API endpoint
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Main application page
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # React components
│   │   ├── camera/            # Camera capture components
│   │   ├── common/            # Shared components (modals, viewers)
│   │   ├── dashboard/         # Dashboard components
│   │   ├── jobs/              # Job-related components
│   │   ├── layout/            # Layout components (Header, BottomNav)
│   │   ├── scanner/           # QR/Barcode scanner components
│   │   ├── workflow/          # Workflow step components
│   │   └── ui/                # UI components
│   │
│   ├── constants/             # Application constants
│   │   └── incidents.ts       # Incident type options
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useJobState.ts     # Job state management
│   │   ├── useWorkflowState.ts # Workflow state management
│   │   ├── useLocation.ts     # Location tracking
│   │   ├── useTabNavigation.ts # Tab navigation logic
│   │   └── useWorkflowLogic.tsx # Workflow logic and step management
│   │
│   ├── lib/                   # Utility libraries
│   │   └── utils.ts           # General utilities
│   │
│   ├── pages/                 # Page components
│   │   ├── JobsPage.tsx       # Jobs list page
│   │   ├── ActiveJobPage.tsx  # Active job workflow page
│   │   ├── DashboardPage.tsx  # Delivery history dashboard
│   │   └── ExpensesPage.tsx   # Expenses page
│   │
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # All type interfaces
│   │
│   └── utils/                 # Utility functions
│       ├── blurDetection.ts  # Image blur detection
│       ├── coordinates.ts     # Coordinate management
│       ├── dateTime.ts        # Date/time utilities
│       ├── geoapify.ts        # Geoapify API integration
│       ├── imageOverlay.ts    # Image overlay utilities
│       └── scanning.ts        # QR/Barcode scanning utilities
│
├── public/                    # Static assets
├── components.json            # shadcn/ui configuration
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Geoapify API key (for geocoding)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd LogiTrack
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_GEOAPIFY_API_KEY=your_geoapify_api_key_here
   ```

   Get your Geoapify API key from [https://www.geoapify.com/](https://www.geoapify.com/)

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

| Variable                       | Description                            | Required |
| ------------------------------ | -------------------------------------- | -------- |
| `NEXT_PUBLIC_GEOAPIFY_API_KEY` | Geoapify API key for reverse geocoding | Yes      |

### Build for Production

```bash
npm run build
npm start
```

## 📱 Usage

### Starting a Job

1. Navigate to the "งานที่ได้รับ" (Jobs) tab
2. Select a job from the list
3. Click "เริ่มงาน" (Start Job) button
4. The workflow will begin with Check-in step

### Delivery Workflow

1. **Check-in**: Confirm job acceptance
2. **Pickup**:
   - Capture 4 required photos
   - Scan run sheet QR/barcode
3. **Departure**: Confirm departure time
4. **Incident** (Optional):
   - Check "มีเหตุการณ์ระหว่างเดินทาง" if incident occurs
   - Select incident type from dropdown
   - If "อื่นๆ" (Other) is selected, enter description
   - Capture 4 incident photos
5. **Arrival**: Confirm arrival at destination
6. **Delivery**:
   - Capture 4 delivery photos
   - Complete delivery confirmation

### Viewing Delivery History

1. Navigate to "สรุปงาน" (Dashboard) tab
2. View all completed deliveries
3. Click on a delivery card to view detailed information
4. Status badges indicate delivery status:
   - ✅ **สำเร็จ** (Success): Normal delivery
   - ⚠️ **ล่าช้า** (Delay): Delivery with incident
   - ❌ **ยกเลิก** (Cancel): Cancelled before check-in
   - ⏸️ **Standby**: Cancelled after check-in

## 🏗️ Architecture

### State Management

The application uses custom React hooks for state management:

- **`useJobState`**: Manages job list, current job, and delivered jobs
- **`useWorkflowState`**: Manages workflow steps, timestamps, and photos
- **`useLocation`**: Handles GPS location and address fetching
- **`useTabNavigation`**: Controls tab navigation with validation
- **`useWorkflowLogic`**: Encapsulates workflow progression logic

### Component Architecture

- **Page Components**: High-level page components (`JobsPage`, `ActiveJobPage`, etc.)
- **Workflow Components**: Step-specific components for each workflow stage
- **Layout Components**: Header and bottom navigation
- **Common Components**: Reusable modals and viewers

### Type Definitions

All TypeScript interfaces are defined in `src/types/index.ts`:

- `Job`: Job assignment structure
- `DeliveredJob`: Completed delivery record
- `Timestamp`: Date and time structure
- `Coordinate`: GPS coordinates
- `GeoapifySearchResult`: Geocoding API response
- `PickupPhotos`, `DeliveryPhotos`, `IncidentPhotos`: Photo collections
- `JobStatus`: Delivery status types

## 🔍 Key Features Explained

### Location Tracking

- Uses browser Geolocation API to get GPS coordinates
- Reverse geocoding via Geoapify API to convert coordinates to addresses
- Location is synced and displayed with timestamp
- Address is refreshed on each workflow step confirmation

### Photo Capture

- Camera access via browser MediaStream API
- Base64 encoding for photo storage
- Image blur detection before saving
- Photo overlay with timestamp and location
- Support for retake and delete operations

### QR/Barcode Scanning

- Uses browser camera for scanning
- Supports multiple barcode formats
- Real-time scanning with visual feedback
- Run sheet number extraction and validation

### Incident Reporting

- Optional incident selection after departure
- Predefined incident types (traffic, accident, weather, vehicle, road, other)
- Custom description for "other" incidents
- 4 required incident photos
- Incident details recorded with timestamp and location

## 🧪 Development

### Code Style

- TypeScript strict mode enabled
- ESLint configured with Next.js rules
- Component-based architecture
- Custom hooks for reusable logic

### Adding New Features

1. Create components in appropriate directories
2. Add types to `src/types/index.ts`
3. Create custom hooks if state management is needed
4. Update workflow logic in `useWorkflowLogic.tsx` if adding steps

### Linting

```bash
npm run lint
```

## 📝 Notes

- The application is designed for mobile-first use
- Fixed header on all pages for easy navigation
- Bottom navigation with disabled states based on job status
- Cannot navigate away from active job until completion
- All timestamps are stored in Thai timezone format (dd/MM/yyyy HH:mm:ss)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide](https://lucide.dev/) - Icon library
- [Geoapify](https://www.geoapify.com/) - Geocoding API

---

**Version**: 0.1.1  
**Last Updated**: 2024
