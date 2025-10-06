export interface ServerToClientEvents {
  "board-updated": (updatedBoard: any) => void;
  "receive-message": (message: string) => void;
  "user-active": (data: { active: boolean }) => void;
}

export interface ClientToServerEvents {
  "updateBoard": (boardState: any, callback: (response: { success: boolean; data: string }) => void) => void;
  "join-room": (roomName: string, profileId: string) => void;
  "send-message": (message: string, roomId: string) => void;
  "disconnect": () => void;
}