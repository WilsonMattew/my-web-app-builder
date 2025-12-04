import { useState } from 'react';
import { mockClients, Client } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  Building2,
  DollarSign,
  MoreHorizontal,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors = {
  lead: 'bg-muted text-muted-foreground',
  prospect: 'bg-info/10 text-info border-info/20',
  active: 'bg-success/10 text-success border-success/20',
  retainer: 'bg-primary/10 text-primary border-primary/20',
  churned: 'bg-destructive/10 text-destructive border-destructive/20',
  paused: 'bg-warning/10 text-warning border-warning/20',
};

const statusOrder = ['lead', 'prospect', 'active', 'retainer', 'paused', 'churned'];

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'pipeline' | 'table'>('pipeline');

  const filteredClients = mockClients.filter((client) =>
    client.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group clients by status for pipeline view
  const clientsByStatus = statusOrder.reduce((acc, status) => {
    acc[status] = filteredClients.filter((c) => c.status === status);
    return acc;
  }, {} as Record<string, Client[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage your client relationships and track leads
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Clients</div>
            <div className="text-2xl font-bold">{mockClients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-2xl font-bold text-success">
              {mockClients.filter((c) => c.status === 'active' || c.status === 'retainer').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pipeline Value</div>
            <div className="text-2xl font-bold text-primary">
              ${mockClients.reduce((sum, c) => sum + c.estimated_value, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">New Leads</div>
            <div className="text-2xl font-bold text-info">
              {mockClients.filter((c) => c.status === 'lead').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center border border-border rounded-lg p-1">
          <Button
            variant={view === 'pipeline' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('pipeline')}
          >
            Pipeline
          </Button>
          <Button
            variant={view === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('table')}
          >
            Table
          </Button>
        </div>
      </div>

      {/* Pipeline View */}
      {view === 'pipeline' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusOrder.slice(0, 4).map((status) => (
            <div
              key={status}
              className="flex-shrink-0 w-72 bg-muted/30 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold capitalize">{status}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {clientsByStatus[status]?.length || 0}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {clientsByStatus[status]?.map((client, index) => (
                  <ClientCard key={client.id} client={client} index={index} />
                ))}

                {(!clientsByStatus[status] || clientsByStatus[status].length === 0) && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No clients
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Est. Value</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {client.company_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{client.company_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.industry}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('capitalize', statusColors[client.status])}
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {client.acquisition_source}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${client.estimated_value.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ClientCard({ client, index }: { client: Client; index: number }) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-4 cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-primary/30 animate-slide-up'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {client.company_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-sm">{client.company_name}</h4>
              <p className="text-xs text-muted-foreground">{client.industry}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2">
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground capitalize">
            via {client.acquisition_source}
          </span>
          <span className="font-medium text-success">
            ${client.estimated_value.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
