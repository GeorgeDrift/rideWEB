import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || undefined; // undefined lets Socket.io connect to window.location

class SocketService {
    private socket: Socket | null = null;
    private static instance: SocketService;

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public connect(userId: string, role: 'driver' | 'rider' | 'admin') {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
            this.socket?.emit('authenticate', userId);

            if (role === 'admin') {
                this.socket?.emit('join_admin');
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public joinRide(rideId: number) {
        this.socket?.emit('join_ride', rideId);
    }

    public updateDriverLocation(userId: string, location: { lat: number; lng: number; heading?: number; precision?: 'precise' | 'approximate' }) {
        this.socket?.emit('driver_online', { userId, location });
        this.socket?.emit('update_location', { driverId: userId, ...location });
    }

    public sendMessage(message: { senderId: string; recipientId: string; text: string; rideId?: number }) {
        this.socket?.emit('send_message', message);
    }

    public on(event: string, callback: (data: any) => void) {
        this.socket?.on(event, callback);
    }

    public off(event: string, callback?: (data: any) => void) {
        if (callback) {
            this.socket?.off(event, callback);
        } else {
            this.socket?.off(event);
        }
    }

    public emit(event: string, data: any) {
        this.socket?.emit(event, data);
    }
}

export const socketService = SocketService.getInstance();
