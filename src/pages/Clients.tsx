import { useState } from 'react';
import { useClients, useCreateClient } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  MoreHorizontal,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  lead: 'bg-muted text-muted-foreground',
  prospect: 'bg-info/10 text-info border-info/20',
  active: 'bg-success/10 text-success border-success/20',
  churned: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusOrder = ['lead', 'prospect', 'active', 'churned'];

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'pipeline' | 'table'>('pipeline');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    company: '',
    status: 'lead' as 'lead' | 'prospect' | 'active' | 'churned',
    total_value: '',
    notes: '',
  });

  const { data: clients, isLoading } = useClients();
  const createClient = useCreateClient();

  const filteredClients = (clients || []).filter((client: any) =>
    client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group clients by status for pipeline view
  const clientsByStatus = statusOrder.reduce((acc, status) => {
    acc[status] = filteredClients.filter((c: any) => c.status === status);
    return acc;
  }, {} as Record<string, any[]>);

  // Calculate stats
  const totalClients = filteredClients.length;
  const activeClients = filteredClients.filter((c: any) => c.status === 'active').length;
  const pipelineValue = filteredClients.reduce((sum: number, c: any) => sum + (Number(c.total_value) || 0), 0);
  const leads = filteredClients.filter((c: any) => c.status === 'lead').length;

  const handleCreateClient = async () => {
    if (!newClient.name) return;
    
    await createClient.mutateAsync({
      name: newClient.name,
      email: newClient.email || null,
      company: newClient.company || null,
      status: newClient.status,
      total_value: newClient.total_value ? parseFloat(newClient.total_value) : 0,
      notes: newClient.notes || null,
    });
    
    setNewClient({ name: '', email: '', company: '', status: 'lead', total_value: '', notes: '' });
    setIsDialogOpen(false);
  };

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Add a new client to your CRM
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Client name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="client@company.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Company name"
                    value={newClient.company}
                    onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newClient.status}
                    onValueChange={(value: any) => setNewClient({ ...newClient, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="churned">Churned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Estimated Value</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="0.00"
                    value={newClient.total_value}
                    onChange={(e) => setNewClient({ ...newClient, total_value: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this client"
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateClient} disabled={createClient.isPending}>
                {createClient.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Client'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Clients</div>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-2xl font-bold text-success">{activeClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pipeline Value</div>
            <div className="text-2xl font-bold text-primary">
              ${pipelineValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">New Leads</div>
            <div className="text-2xl font-bold text-info">{leads}</div>
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

      {isLoading ? (
        <div className="flex gap-4">
          {statusOrder.map((status) => (
            <Skeleton key={status} className="flex-shrink-0 w-72 h-64" />
          ))}
        </div>
      ) : (
        <>
          {/* Pipeline View */}
          {view === 'pipeline' && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {statusOrder.map((status) => (
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
                    {(clientsByStatus[status] || []).map((client: any, index: number) => (
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
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client: any) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {client.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{client.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {client.company || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn('capitalize', statusColors[client.status])}
                          >
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {client.email || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${(Number(client.total_value) || 0).toLocaleString()}
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
        </>
      )}
    </div>
  );
}

function ClientCard({ client, index }: { client: any; index: number }) {
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
                {client.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-sm">{client.name}</h4>
              <p className="text-xs text-muted-foreground">{client.company || 'No company'}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2">
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {client.email || 'No email'}
          </span>
          <span className="font-medium text-success">
            ${(Number(client.total_value) || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
