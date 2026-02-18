// Sprint Tracker — Strategy View (file ownership, locked files, conflict prevention)
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Lock, Shield, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LOCKED_FILES, FILE_OWNERSHIP } from './data-config';
import type { ActivityLogEntry } from './types';

interface StrategyViewProps {
  activityLog: ActivityLogEntry[];
}

export const StrategyView: React.FC<StrategyViewProps> = ({ activityLog }) => {
  const recentActivity = activityLog.slice(-20).reverse();

  return (
    <div className="space-y-6">
      {/* File ownership */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="w-5 h-5" /> File Ownership Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Area</th>
                  <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Files</th>
                  <th className="text-center py-2.5 px-3 font-medium text-muted-foreground">Count</th>
                  <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Owner</th>
                </tr>
              </thead>
              <tbody>
                {FILE_OWNERSHIP.map(row => (
                  <tr key={row.area} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2.5 px-3 font-medium">{row.area}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">{row.files}</td>
                    <td className="py-2.5 px-3 text-center">{row.count}</td>
                    <td className="py-2.5 px-3">
                      <Badge className={cn('text-xs',
                        row.owner === 'lovable' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700',
                      )}>
                        {row.owner === 'lovable' ? 'Lovable' : 'Claude'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Locked files */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" /> Locked Files — Neither Developer Modifies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {LOCKED_FILES.map(lf => (
              <div key={lf.file} className="flex items-start gap-3 py-2 border-b last:border-0">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-mono font-medium">{lf.file}</p>
                  <p className="text-sm text-muted-foreground">{lf.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conflict prevention */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" /> Conflict Prevention Protocol
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {[
              { n: 1, text: 'Build passes before every commit', cmd: 'npm run build' },
              { n: 2, text: 'Verify no locked file changes', cmd: 'git diff --name-only' },
              { n: 3, text: "Lovable doesn't touch genie-studio/spark/admin files" },
              { n: 4, text: "Claude doesn't touch landing/ files" },
              { n: 5, text: 'Day 5: Claude merges to main FIRST, then Lovable rebases' },
              { n: 6, text: 'Both update SHARED_CHANGELOG.md for shared resource changes' },
            ].map(item => (
              <div key={item.n} className="flex items-start gap-3">
                <Badge variant="outline" className="text-xs shrink-0 mt-0.5">{item.n}</Badge>
                <div>
                  <span>{item.text}</span>
                  {item.cmd && <code className="ml-2 bg-muted px-1.5 py-0.5 rounded text-xs">{item.cmd}</code>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity log */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No activity logged yet. Updates appear here as tasks are changed.
            </p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((entry, i) => (
                <div key={i} className="flex items-start gap-3 py-1.5 border-b last:border-0 text-sm">
                  <Badge className={cn('text-xs shrink-0',
                    entry.developer === 'lovable' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700',
                  )}>
                    {entry.developer === 'lovable' ? 'Lovable' : 'Claude'}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <span>{entry.action}</span>
                    {entry.details && <span className="text-muted-foreground"> — {entry.details}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
