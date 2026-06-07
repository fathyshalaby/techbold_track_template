"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconExternalLink,
  IconLayoutColumns,
  IconLoader2,
  IconPlayerPlay,
  IconSearch,
  IconSelector,
} from "@tabler/icons-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createRun } from "@/lib/api";
import { sourceLabel } from "@/lib/source-labels";
import { cn } from "@/lib/utils";
import type { SourceLabel, TicketSummary } from "@techbold/contracts";

function priorityVariant(priority: string): "destructive" | "secondary" | "outline" {
  const value = priority.toUpperCase();
  if (value === "HIGH" || value === "CRITICAL" || value === "URGENT") return "destructive";
  if (value === "MEDIUM") return "secondary";
  return "outline";
}

function StatusBadge({ status }: { status: string }) {
  const value = status.toUpperCase();
  const dot =
    value === "OPEN"
      ? "bg-amber-500"
      : value === "PENDING"
        ? "bg-blue-500"
        : value === "DONE"
          ? "bg-emerald-500"
          : "bg-muted-foreground";
  return (
    <Badge variant="outline" className="gap-1.5 capitalize">
      <span className={cn("size-1.5 rounded-full", dot)} aria-hidden="true" />
      {status.toLowerCase()}
    </Badge>
  );
}

export function TicketsDataTable({
  tickets,
  source,
}: {
  tickets: TicketSummary[];
  source: SourceLabel;
}) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [tab, setTab] = React.useState<string>("all");
  const [busyTicket, setBusyTicket] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<TicketSummary | null>(null);

  const counts = React.useMemo(() => {
    const base = { all: tickets.length, OPEN: 0, PENDING: 0, DONE: 0 };
    for (const ticket of tickets) {
      const key = String(ticket.status).toUpperCase();
      if (key in base) base[key as "OPEN" | "PENDING" | "DONE"] += 1;
    }
    return base;
  }, [tickets]);

  const startRun = React.useCallback(
    async (ticketId: number) => {
      setBusyTicket(ticketId);
      setError(null);
      try {
        const created = await createRun(ticketId);
        router.push(`/dashboard/runs/${created.runId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setBusyTicket(null);
      }
    },
    [router],
  );

  const columns = React.useMemo<ColumnDef<TicketSummary>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            aria-label="Select all"
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "id",
        header: ({ column }) => <SortHeader column={column} label="Ticket" />,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <button
              type="button"
              className="text-left font-medium text-foreground hover:underline"
              onClick={() => setDetail(row.original)}
            >
              {row.original.title}
            </button>
            <span className="text-xs text-muted-foreground tabular-nums">#{row.original.id}</span>
          </div>
        ),
        enableHiding: false,
      },
      {
        accessorKey: "customer_name",
        header: "Customer",
        cell: ({ row }) => <span className="text-sm">{row.original.customer_name}</span>,
      },
      {
        accessorKey: "priority",
        header: ({ column }) => <SortHeader column={column} label="Priority" />,
        cell: ({ row }) => (
          <Badge variant={priorityVariant(row.original.priority)} className="capitalize">
            {row.original.priority.toLowerCase()}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => <SortHeader column={column} label="Status" />,
        cell: ({ row }) => <StatusBadge status={String(row.original.status)} />,
        filterFn: (row, id, value) =>
          String(row.getValue(id)).toUpperCase() === String(value).toUpperCase(),
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => (
          <Badge variant="secondary" className="gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            {sourceLabel(row.original.source)}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const ticket = row.original;
          const isDone = String(ticket.status).toUpperCase() === "DONE";
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => void startRun(ticket.id)}
                disabled={busyTicket === ticket.id || isDone}
              >
                {busyTicket === ticket.id ? (
                  <IconLoader2 className="animate-spin" />
                ) : (
                  <IconPlayerPlay />
                )}
                Start run
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button size="icon-sm" variant="ghost" aria-label="Row actions" />}
                >
                  <IconDotsVertical />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => setDetail(ticket)}>
                    View details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}>
                    Open ticket
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled={isDone} onClick={() => void startRun(ticket.id)}>
                    Start run
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [busyTicket, router, startRun],
  );

  const table = useReactTable({
    data: tickets,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, globalFilter },
    getRowId: (row) => String(row.id),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _id, value) => {
      const needle = String(value).toLowerCase();
      const t = row.original;
      return (
        t.title.toLowerCase().includes(needle) ||
        t.customer_name.toLowerCase().includes(needle) ||
        String(t.id).includes(needle)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  function onTabChange(next: string) {
    setTab(next);
    table.getColumn("status")?.setFilterValue(next === "all" ? undefined : next.toUpperCase());
  }

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={tab} onValueChange={onTabChange}>
          <TabsList>
            <TabsTrigger value="all">
              All <Badge variant="secondary">{counts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="open">
              Open <Badge variant="secondary">{counts.OPEN}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending <Badge variant="secondary">{counts.PENDING}</Badge>
            </TabsTrigger>
            <TabsTrigger value="done">
              Done <Badge variant="secondary">{counts.DONE}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <div className="relative">
            <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder="Search tickets..."
              className="w-48 pl-8"
              aria-label="Search tickets"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
              <IconLayoutColumns />
              <span className="hidden sm:inline">Columns</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id.replace("_", " ")}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.id === "actions" ? "text-right" : undefined}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.id === "actions" ? "text-right" : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-48">
                  <Empty className="border-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <IconSearch />
                      </EmptyMedia>
                      <EmptyTitle>Nothing here yet</EmptyTitle>
                      <EmptyDescription>
                        No tickets match this view. Adjust filters or refresh data.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 px-1 sm:flex-row">
        <div className="text-sm text-muted-foreground">
          {selectedCount} of {totalRows} row(s) selected.
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger size="sm" id="rows-per-page" className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              className="hidden lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label="First page"
            >
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="hidden lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              aria-label="Last page"
            >
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>

      <TicketDetailDrawer
        ticket={detail}
        source={source}
        busy={detail ? busyTicket === detail.id : false}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
        onStartRun={startRun}
        onOpenTicket={(id) => router.push(`/dashboard/tickets/${id}`)}
      />
    </div>
  );
}

function SortHeader({
  column,
  label,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack column type is verbose at call sites
  column: any;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2.5 h-7"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <IconSelector className="text-muted-foreground" />
    </Button>
  );
}

function TicketDetailDrawer({
  ticket,
  source,
  busy,
  onOpenChange,
  onStartRun,
  onOpenTicket,
}: {
  ticket: TicketSummary | null;
  source: SourceLabel;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onStartRun: (id: number) => void;
  onOpenTicket: (id: number) => void;
}) {
  const isDone = ticket ? String(ticket.status).toUpperCase() === "DONE" : false;
  return (
    <Drawer direction="right" open={ticket !== null} onOpenChange={onOpenChange}>
      <DrawerContent>
        {ticket && (
          <>
            <DrawerHeader>
              <DrawerTitle>{ticket.title}</DrawerTitle>
              <DrawerDescription>
                Ticket #{ticket.id} for {ticket.customer_name}
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-4 px-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Status">
                  <StatusBadge status={String(ticket.status)} />
                </Field>
                <Field label="Priority">
                  <Badge variant={priorityVariant(ticket.priority)} className="capitalize">
                    {ticket.priority.toLowerCase()}
                  </Badge>
                </Field>
                <Field label="Customer">
                  <span className="text-sm">{ticket.customer_name}</span>
                </Field>
                <Field label="Source">
                  <Badge variant="secondary">{sourceLabel(source)}</Badge>
                </Field>
              </div>
            </div>
            <DrawerFooter>
              <Button onClick={() => onStartRun(ticket.id)} disabled={busy || isDone}>
                {busy ? <IconLoader2 className="animate-spin" /> : <IconPlayerPlay />}
                Start run
              </Button>
              <Button variant="outline" onClick={() => onOpenTicket(ticket.id)}>
                <IconExternalLink />
                Open full ticket
              </Button>
              <DrawerClose className={cn(buttonVariants({ variant: "ghost" }))}>Close</DrawerClose>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border bg-card p-3">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-[0.04em]">
        {label}
      </span>
      {children}
    </div>
  );
}
