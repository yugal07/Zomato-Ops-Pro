# Zomato-Ops-Pro
# Zomato-Ops-Pro


client/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── PrivateRoute.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── NotificationToast.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── AuthLayout.tsx
│   │   ├── manager/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── OrderForm.tsx
│   │   │   ├── OrderTable.tsx
│   │   │   ├── PartnerAssignment.tsx
│   │   │   ├── StatsCards.tsx
│   │   │   └── AnalyticsDashboard.tsx
│   │   ├── delivery/
│   │   │   ├── DeliveryDashboard.tsx
│   │   │   ├── OrderCard.tsx
│   │   │   ├── StatusUpdater.tsx
│   │   │   └── AvailabilityToggle.tsx
│   │   └── tracker/
│   │       ├── OrderTracker.tsx
│   │       └── RealTimeMap.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── SocketContext.tsx
│   │   ├── OrderContext.tsx
│   │   └── NotificationContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSocket.ts
│   │   ├── useOrders.ts
│   │   ├── useNotifications.ts
│   │   └── useLocalStorage.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── orderService.ts
│   │   ├── deliveryService.ts
│   │   └── socketService.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── order.types.ts
│   │   ├── delivery.types.ts
│   │   ├── socket.types.ts
│   │   └── api.types.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── ManagerDashboard.tsx
│   │   ├── DeliveryDashboard.tsx
│   │   └── NotFoundPage.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   └── index.css
├── package.json
└── tailwind.config.js