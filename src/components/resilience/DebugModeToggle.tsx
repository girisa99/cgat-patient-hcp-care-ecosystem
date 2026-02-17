/**
 * Debug Mode Toggle - P4-REC-12
 * Verbose logging toggle for troubleshooting with persistent state
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Bug, 
  Terminal, 
  Eye, 
  EyeOff, 
  Trash2, 
  Download,
  ChevronDown,
  AlertCircle,
  Info,
  AlertTriangle,
  XCircle
} from 'lucide-react';

// Debug log entry type
interface DebugLogEntry {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  component?: string;
  timestamp: Date;
}

// Debug context
interface DebugContextType {
  isDebugMode: boolean;
  setDebugMode: (enabled: boolean) => void;
  logs: DebugLogEntry[];
  addLog: (entry: Omit<DebugLogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  logLevels: {
    info: boolean;
    warn: boolean;
    error: boolean;
    debug: boolean;
  };
  setLogLevel: (level: keyof DebugContextType['logLevels'], enabled: boolean) => void;
}

const DebugContext = createContext<DebugContextType | null>(null);

// Debug Provider
export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDebugMode, setIsDebugMode] = useState(() => {
    return localStorage.getItem('debug_mode') === 'true';
  });
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const [logLevels, setLogLevels] = useState({
    info: true,
    warn: true,
    error: true,
    debug: true
  });

  // Persist debug mode
  useEffect(() => {
    localStorage.setItem('debug_mode', String(isDebugMode));
    if (isDebugMode) {
      console.log('🐛 Debug mode ENABLED - Verbose logging active');
    }
  }, [isDebugMode]);

  // Intercept console methods when debug mode is active
  useEffect(() => {
    if (!isDebugMode) return;

    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };

    const createInterceptor = (level: 'info' | 'warn' | 'error' | 'debug', original: (...args: any[]) => void) => {
      return (...args: any[]) => {
        original.apply(console, args);
        
        if (logLevels[level]) {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          
          setLogs(prev => [...prev.slice(-99), {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            level,
            message: message.slice(0, 500),
            data: args.length > 1 ? args.slice(1) : undefined,
            timestamp: new Date()
          }]);
        }
      };
    };

    console.log = createInterceptor('info', originalConsole.log);
    console.warn = createInterceptor('warn', originalConsole.warn);
    console.error = createInterceptor('error', originalConsole.error);
    console.debug = createInterceptor('debug', originalConsole.debug);

    return () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.debug = originalConsole.debug;
    };
  }, [isDebugMode, logLevels]);

  const addLog = (entry: Omit<DebugLogEntry, 'id' | 'timestamp'>) => {
    if (!isDebugMode || !logLevels[entry.level]) return;
    
    setLogs(prev => [...prev.slice(-99), {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }]);
  };

  const clearLogs = () => setLogs([]);

  const setLogLevel = (level: keyof typeof logLevels, enabled: boolean) => {
    setLogLevels(prev => ({ ...prev, [level]: enabled }));
  };

  return (
    <DebugContext.Provider value={{
      isDebugMode,
      setDebugMode: setIsDebugMode,
      logs,
      addLog,
      clearLogs,
      logLevels,
      setLogLevel
    }}>
      {children}
    </DebugContext.Provider>
  );
};

// Hook to use debug mode
export const useDebugMode = () => {
  const context = useContext(DebugContext);
  if (!context) {
    // Return a default implementation if not wrapped in provider
    return {
      isDebugMode: false,
      setDebugMode: () => {},
      logs: [],
      addLog: () => {},
      clearLogs: () => {},
      logLevels: { info: true, warn: true, error: true, debug: true },
      setLogLevel: () => {}
    };
  }
  return context;
};

// Compact toggle component
export const DebugModeToggle: React.FC<{ showLabel?: boolean }> = ({ showLabel = true }) => {
  const { isDebugMode, setDebugMode } = useDebugMode();

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="debug-mode"
        checked={isDebugMode}
        onCheckedChange={setDebugMode}
      />
      {showLabel && (
        <Label htmlFor="debug-mode" className="flex items-center gap-2 cursor-pointer">
          <Bug className="h-4 w-4" />
          Debug Mode
          {isDebugMode && <Badge variant="outline" className="text-xs">Active</Badge>}
        </Label>
      )}
    </div>
  );
};

// Full debug panel component
export const DebugPanel: React.FC = () => {
  const { isDebugMode, setDebugMode, logs, clearLogs, logLevels, setLogLevel } = useDebugMode();
  const [isOpen, setIsOpen] = useState(false);

  const levelConfig = {
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    warn: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    debug: { icon: Terminal, color: 'text-gray-500', bg: 'bg-gray-500/10' }
  };

  const filteredLogs = logs.filter(log => logLevels[log.level]);

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isDebugMode) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">Debug mode is off</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setDebugMode(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bug className="h-5 w-5" />
            Debug Console
            <Badge>{filteredLogs.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={exportLogs} disabled={logs.length === 0}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={clearLogs} disabled={logs.length === 0}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Switch checked={isDebugMode} onCheckedChange={setDebugMode} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Log Level Filters */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(logLevels) as Array<keyof typeof logLevels>).map(level => {
            const config = levelConfig[level];
            const count = logs.filter(l => l.level === level).length;
            return (
              <Button
                key={level}
                variant={logLevels[level] ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLogLevel(level, !logLevels[level])}
                className="gap-1"
              >
                <config.icon className="h-3 w-3" />
                {level}
                {count > 0 && <Badge variant="secondary" className="ml-1">{count}</Badge>}
              </Button>
            );
          })}
        </div>

        {/* Log List */}
        <ScrollArea className="h-64 border rounded-lg bg-muted/30">
          <div className="p-2 space-y-1 font-mono text-xs">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No logs captured yet</p>
                <p className="text-[10px]">Logs will appear here when debug mode is active</p>
              </div>
            ) : (
              filteredLogs.map(log => {
                const config = levelConfig[log.level];
                const Icon = config.icon;
                return (
                  <Collapsible key={log.id}>
                    <CollapsibleTrigger asChild>
                      <div className={`flex items-start gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 ${config.bg}`}>
                        <Icon className={`h-3 w-3 mt-0.5 flex-shrink-0 ${config.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                            {log.component && (
                              <Badge variant="outline" className="text-[10px] h-4">
                                {log.component}
                              </Badge>
                            )}
                          </div>
                          <p className="truncate">{log.message}</p>
                        </div>
                        {log.data && <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </CollapsibleTrigger>
                    {log.data && (
                      <CollapsibleContent>
                        <pre className="p-2 ml-5 text-[10px] bg-muted rounded overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DebugModeToggle;
