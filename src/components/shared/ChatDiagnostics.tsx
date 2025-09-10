import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  MessageCircle,
  Settings
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { getEcho, resetEcho } from '@/services/realtime';

interface DiagnosticsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDiagnostics: React.FC<DiagnosticsProps> = ({ isOpen, onClose }) => {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);
  const chatContext = useChat();

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: any = {};

    // Check environment variables
    results.environment = {
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'Not set',
      reverbKey: !!import.meta.env.VITE_REVERB_APP_KEY,
      reverbHost: import.meta.env.VITE_REVERB_HOST || 'Not set',
      reverbPort: import.meta.env.VITE_REVERB_PORT || 'Not set',
      reverbScheme: import.meta.env.VITE_REVERB_SCHEME || 'Not set',
    };

    // Check authentication
    results.auth = {
      token: !!(localStorage.getItem('auth-token') || localStorage.getItem('auth_token')),
      user: !!chatContext.conversations,
    };

    // Check WebSocket connection
    try {
      const echo = getEcho();
      results.websocket = {
        echoInstance: !!echo,
        connectionState: echo?.connector?.pusher?.connection?.state || 'unknown',
        socketId: echo?.connector?.pusher?.connection?.socket_id || 'none',
      };
    } catch (error) {
      results.websocket = {
        error: error.message,
        echoInstance: false,
      };
    }

    // Check chat context
    results.chatContext = {
      conversations: chatContext.conversations?.length || 0,
      activeConversation: !!chatContext.activeConversation,
      messages: chatContext.messages?.length || 0,
      connectionStatus: chatContext.connectionStatus || 'unknown',
      isLoading: chatContext.isLoading,
      error: chatContext.error,
    };

    // Check API connectivity
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`);
      results.api = {
        reachable: response.ok,
        status: response.status,
      };
    } catch (error) {
      results.api = {
        reachable: false,
        error: error.message,
      };
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  const resetConnection = async () => {
    try {
      resetEcho();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await runDiagnostics();
    } catch (error) {
      console.error('Failed to reset connection:', error);
    }
  };

  const getStatusIcon = (status: boolean | string) => {
    if (status === true || status === 'connected') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === false || status === 'disconnected' || status === 'error') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Chat Diagnostics
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={runDiagnostics}
                disabled={isRunning}
              >
                {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Environment Configuration */}
          <div>
            <h3 className="font-semibold mb-2">Environment Configuration</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span>API Base URL:</span>
                <Badge variant={diagnostics.environment?.apiBaseUrl !== 'Not set' ? 'default' : 'destructive'}>
                  {diagnostics.environment?.apiBaseUrl}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Reverb Key:</span>
                {getStatusIcon(diagnostics.environment?.reverbKey)}
              </div>
              <div className="flex justify-between items-center">
                <span>Reverb Host:</span>
                <Badge variant={diagnostics.environment?.reverbHost !== 'Not set' ? 'default' : 'destructive'}>
                  {diagnostics.environment?.reverbHost}
                </Badge>
              </div>
            </div>
          </div>

          {/* Authentication Status */}
          <div>
            <h3 className="font-semibold mb-2">Authentication</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span>Auth Token:</span>
                {getStatusIcon(diagnostics.auth?.token)}
              </div>
              <div className="flex justify-between items-center">
                <span>User Logged In:</span>
                {getStatusIcon(diagnostics.auth?.user)}
              </div>
            </div>
          </div>

          {/* WebSocket Connection */}
          <div>
            <h3 className="font-semibold mb-2">WebSocket Connection</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span>Echo Instance:</span>
                {getStatusIcon(diagnostics.websocket?.echoInstance)}
              </div>
              <div className="flex justify-between items-center">
                <span>Connection State:</span>
                <Badge variant={diagnostics.websocket?.connectionState === 'connected' ? 'default' : 'destructive'}>
                  {diagnostics.websocket?.connectionState || 'Unknown'}
                </Badge>
              </div>
              {diagnostics.websocket?.socketId && (
                <div className="flex justify-between items-center">
                  <span>Socket ID:</span>
                  <Badge variant="outline">{diagnostics.websocket.socketId}</Badge>
                </div>
              )}
              {diagnostics.websocket?.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{diagnostics.websocket.error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Chat Context Status */}
          <div>
            <h3 className="font-semibold mb-2">Chat Context</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span>Conversations:</span>
                <Badge>{diagnostics.chatContext?.conversations || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Active Conversation:</span>
                {getStatusIcon(diagnostics.chatContext?.activeConversation)}
              </div>
              <div className="flex justify-between items-center">
                <span>Messages Loaded:</span>
                <Badge>{diagnostics.chatContext?.messages || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Connection Status:</span>
                <Badge variant={diagnostics.chatContext?.connectionStatus === 'connected' ? 'default' : 'destructive'}>
                  {diagnostics.chatContext?.connectionStatus || 'Unknown'}
                </Badge>
              </div>
              {diagnostics.chatContext?.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{diagnostics.chatContext.error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Actions</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetConnection}
              >
                <Wifi className="h-4 w-4 mr-2" />
                Reset Connection
              </Button>
            </div>
          </div>

          {/* Recommendations */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Recommendations</h3>
            <div className="space-y-2 text-sm">
              {!diagnostics.environment?.reverbKey && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Set VITE_REVERB_APP_KEY in your environment variables
                  </AlertDescription>
                </Alert>
              )}
              {diagnostics.environment?.reverbHost === 'Not set' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Set VITE_REVERB_HOST in your environment variables
                  </AlertDescription>
                </Alert>
              )}
              {!diagnostics.auth?.token && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    User needs to be logged in for real-time messaging
                  </AlertDescription>
                </Alert>
              )}
              {diagnostics.websocket?.connectionState !== 'connected' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    WebSocket connection is not established. Check your Reverb server.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};