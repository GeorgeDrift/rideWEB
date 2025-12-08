# Automatic Data Polling System

## Overview
The application now includes an automatic data polling system that continuously refreshes data without requiring page refreshes. This ensures all dashboards (Rider, Driver, and Admin) display real-time information.

---

## Architecture

### Polling Service (`services/polling.ts`)
A centralized service that manages all polling intervals across the application.

**Key Methods:**
- `startPolling(key, config)` - Start a polling interval
- `stopPolling(key)` - Stop a specific polling interval
- `stopAllPolling()` - Stop all active polling
- `getActivePolling()` - Get list of active polling keys
- `isPolling(key)` - Check if polling is active

**Configuration:**
```typescript
interface PollingConfig {
    interval: number;        // milliseconds between polls
    onPoll: () => Promise<void>;  // async callback function
}
```

---

## Polling Intervals by Dashboard

### Rider Dashboard (`components/RiderDashboard.tsx`)

| Data | Interval | Purpose |
|------|----------|---------|
| Trips & Active Trips | 10 seconds | Monitor trip status changes, pickup, delivery |
| Marketplace Listings | 15 seconds | Show new ride-share and for-hire posts |
| Stats & Analytics | 20 seconds | Update spending, distance, ratings |

**Polling Keys:**
- `rider-trips`
- `rider-marketplace`
- `rider-stats`

### Driver Dashboard (`components/DriverDashboard.tsx`)

| Data | Interval | Purpose |
|------|----------|---------|
| Pending Approvals | 5 seconds ⚡ | High priority - rider requests need fast response |
| Contracted Jobs | 8 seconds | Track job status updates |
| Active Posts | 12 seconds | Monitor ride-share and hire post activity |
| Transactions | 15 seconds | Update earnings and payment history |
| Analytics | 20 seconds | Refresh profit, distance, hours, on-time stats |
| Notifications | 10 seconds | Keep notification list current |

**Polling Keys:**
- `driver-approvals` (highest priority)
- `driver-notifications`
- `driver-jobs`
- `driver-posts`
- `driver-transactions`
- `driver-analytics`

### Admin Dashboard (`components/Dashboard.tsx`)

| Data | Interval | Purpose |
|------|----------|---------|
| Dashboard Metrics | 10 seconds | Monitor revenue, rides, drivers, users |

**Polling Keys:**
- `admin-dashboard`

---

## How It Works

### Initialization
When a dashboard component mounts, polling intervals are started:

```typescript
useEffect(() => {
    // Start polling for trips every 10 seconds
    pollingService.startPolling('rider-trips', {
        interval: 10000,
        onPoll: async () => {
            try {
                const historyData = await ApiService.getRiderHistory();
                setHistory(historyData || []);
            } catch (e) { console.warn('Polling trips failed', e); }
        }
    });

    // Cleanup on unmount
    return () => {
        pollingService.stopPolling('rider-trips');
    };
}, []);
```

### Updates
- Data is fetched automatically at specified intervals
- State is updated with new data
- UI re-renders to show latest information
- Errors are caught and logged (doesn't break polling)

### Cleanup
When a component unmounts, all associated polling intervals are stopped to prevent memory leaks.

---

## Error Handling

Polling includes built-in error handling:
- Errors are caught and logged to console
- Failed polls don't stop the polling cycle
- Next poll will retry automatically
- Gracefully degrades if API is unavailable

```typescript
onPoll: async () => {
    try {
        const data = await ApiService.getRiderHistory();
        setHistory(data || []);
    } catch (e) { 
        console.warn('Polling trips failed', e);  // Log error
        // Next poll will retry automatically
    }
}
```

---

## Performance Considerations

### Optimized Intervals
- **High-priority data** (approvals): 5-10 seconds
- **Medium-priority data** (jobs, posts): 8-15 seconds  
- **Low-priority data** (analytics): 20 seconds

### Network Efficiency
- Each poll only fetches necessary data
- Intervals are staggered to avoid simultaneous requests
- Failed requests don't interfere with other polls
- Proper cleanup prevents orphaned requests

### Resource Management
- Polling only active on mounted components
- All intervals cleared on unmount
- No memory leaks from forgotten intervals
- Browser handles request throttling

---

## API Endpoints Used

### Rider Dashboard
```
GET /api/rider/history          (trips)
GET /api/rider/posts            (marketplace)
GET /api/rider/stats            (analytics)
```

### Driver Dashboard
```
GET /api/driver/pending-approvals    (approvals)
GET /api/driver/notifications        (notifications)
GET /api/driver/jobs                 (jobs)
GET /api/driver/posts                (posts)
GET /api/driver/transactions         (transactions)
GET /api/driver/profit-stats         (analytics)
GET /api/driver/trip-history-stats
GET /api/driver/distance-stats
GET /api/driver/hours-stats
GET /api/driver/ontime-stats
```

### Admin Dashboard
```
GET /api/admin/dashboard    (all metrics)
```

---

## Monitoring Active Polling

### In Console
```typescript
// Check active polling
console.log(pollingService.getActivePolling());
// Output: ['rider-trips', 'rider-marketplace', 'rider-stats']

// Check if specific polling is active
console.log(pollingService.isPolling('rider-trips'));
// Output: true
```

---

## Benefits

✅ **Real-Time Updates** - Data updates without manual refresh  
✅ **User Experience** - Seamless, always-current information  
✅ **Multi-Dashboard** - All dashboards benefit from polling  
✅ **Memory Efficient** - Proper cleanup prevents leaks  
✅ **Error Resilient** - Failed polls don't crash the app  
✅ **Configurable** - Easy to adjust intervals per dashboard  
✅ **Centralized** - Single service manages all polling  

---

## Future Enhancements

- [ ] Adaptive polling intervals based on user activity
- [ ] Priority queue for polling (handle critical data first)
- [ ] WebSocket fallback for real-time updates
- [ ] Pause polling during background tabs
- [ ] Analytics on polling performance
- [ ] User-configurable update frequencies
- [ ] Offline detection and retry logic

---

## Testing the Polling

### Rider Dashboard
1. Navigate to Rider Dashboard
2. Book a ride from marketplace
3. Watch for real-time updates:
   - Status changes appear within 10 seconds
   - New listings appear within 15 seconds
   - Stats update within 20 seconds

### Driver Dashboard
1. Navigate to Driver Dashboard
2. Create a ride-share or hire post
3. Observe real-time changes:
   - New requests appear within 5 seconds
   - Job status updates within 8 seconds
   - Earnings update within 15 seconds

### Admin Dashboard
1. Navigate to Admin Dashboard
2. Monitor metrics:
   - Revenue, rides, drivers update every 10 seconds
   - Map markers refresh with live vehicle locations

---

## Configuration

To modify polling intervals, edit the interval values in the respective dashboard components:

```typescript
// Example: Change rider-trips polling from 10s to 30s
pollingService.startPolling('rider-trips', {
    interval: 30000,  // 30 seconds instead of 10
    onPoll: async () => { ... }
});
```

---

## Troubleshooting

### Polling Not Updating
1. Check browser console for errors
2. Verify API endpoints are working: `console.log(pollingService.getActivePolling())`
3. Check network tab to see polling requests
4. Verify component hasn't unmounted

### High Network Usage
1. Increase polling intervals (e.g., 15s → 30s)
2. Reduce number of simultaneous polls
3. Combine related data fetches

### Memory Issues
1. Verify component cleanup is running: `return () => pollingService.stopPolling('key')`
2. Check browser DevTools memory profiler
3. Ensure no multiple instances of polling with same key
