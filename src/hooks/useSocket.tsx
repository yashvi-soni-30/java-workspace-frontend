import { useEffect, useRef, useState } from "react";
import { connectRoomStream, type RoomRealtimeEvent } from "@/services/socketService";

interface ActiveUser {
	id: number;
	name: string;
	email: string;
}

interface UseSocketOptions {
	roomId?: number;
	enabled: boolean;
	onEvent?: (event: RoomRealtimeEvent) => void;
}

export function useSocket({ roomId, enabled, onEvent }: UseSocketOptions) {
	const [connected, setConnected] = useState(false);
	const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
	const onEventRef = useRef(onEvent);

	useEffect(() => {
		onEventRef.current = onEvent;
	}, [onEvent]);

	useEffect(() => {
		if (!enabled || !roomId) {
			setConnected(false);
			setActiveUsers([]);
			return;
		}

		const disconnect = connectRoomStream(roomId, {
			onOpen: () => setConnected(true),
			onError: () => setConnected(false),
			onEvent: (event) => {
				if (event.type === "ACTIVE_USERS") {
					const users = (event.payload?.users as ActiveUser[] | undefined) ?? [];
					setActiveUsers(users);
				}
				onEventRef.current?.(event);
			},
		});

		return () => {
			disconnect();
			setConnected(false);
			setActiveUsers([]);
		};
	}, [enabled, roomId]);

	return { connected, activeUsers };
}
