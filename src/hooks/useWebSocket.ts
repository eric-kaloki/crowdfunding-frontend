import { useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  campaignId?: string;
  [key: string]: any;
}

interface UseWebSocketProps {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = ({ url, onMessage, onConnect, onDisconnect, onError }: UseWebSocketProps) => {
  const ws = useRef<WebSocket | null>(null);
  const isConnected = useRef(false);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        isConnected.current = true;
        onConnect?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        isConnected.current = false;
        onDisconnect?.();
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (!isConnected.current) {
            connect();
          }
        }, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }, [url, onMessage, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      isConnected.current = false;
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }, []);

  const subscribeToCampaign = useCallback((campaignId: string) => {
    sendMessage({
      type: 'subscribe_campaign',
      campaignId
    });
  }, [sendMessage]);

  const unsubscribeFromCampaign = useCallback((campaignId: string) => {
    sendMessage({
      type: 'unsubscribe_campaign',
      campaignId
    });
  }, [sendMessage]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    sendMessage,
    subscribeToCampaign,
    unsubscribeFromCampaign,
    isConnected: isConnected.current
  };
};
