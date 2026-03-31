import { useState, useEffect } from 'react';
import { wsService } from '../api/websocket';

export function useWebSocket(channel) {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(wsService.isConnected);

  useEffect(() => {
    // Ensure the service is connected
    wsService.connect();

    const handleConnChange = (status) => setIsConnected(status);
    const handleData = (newData) => setData(newData);

    const unsubConn = wsService.subscribe('connection_change', handleConnChange);
    const unsubData = wsService.subscribe(channel, handleData);

    return () => {
      unsubConn();
      unsubData();
    };
  }, [channel]);

  return { data, isConnected };
}
