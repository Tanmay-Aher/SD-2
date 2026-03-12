"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Megaphone,
  ClipboardList,
  Users,
  GraduationCap,
  CircleCheckBig,
  BookOpen,
  Trash2,
  Pencil,
  Plus,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Pagination = { page: number; limit: number; total: number; totalPages: number };
type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: "admin" | "teacher" | "student";
  department?: string | null;
  class?: string | null;
  rollNumber?: number | null;
};
type StudentRow = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  class: string;
  rollNumber: number;
};

const PAGE_SIZE = 8;

function Pager({
  pagination,
  onChange,
}: {
  pagination: Pagination;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
      </p>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={pagination.page <= 1}
          onClick={() => onChange(pagination.page - 1)}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onChange(pagination.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

function AdminOverview() {
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalAssignments: 0,
    totalAnnouncements: 0,
    attendanceAverage: 0,
  });

  React.useEffect(() => {
    const run = async () => {
      const { data } = await api.get<{ stats: typeof stats }>("/api/admin/overview");
      if (data?.stats) setStats(data.stats);
    };
    run();
  }, []);

  const chartData = [
    { name: "Students", value: stats.totalStudents },
    { name: "Teachers", value: stats.totalTeachers },
    { name: "Assignments", value: stats.totalAssignments },
    { name: "Announcements", value: stats.totalAnnouncements },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} />
        <StatCard title="Total Teachers" value={stats.totalTeachers} icon={GraduationCap} />
        <StatCard title="Total Assignments" value={stats.totalAssignments} icon={ClipboardList} />
        <StatCard title="Total Announcements" value={stats.totalAnnouncements} icon={Megaphone} />
        <StatCard
          title="Attendance Average"
          value={`${stats.attendanceAverage}%`}
          icon={CircleCheckBig}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>System Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersPanel() {
  const [rows, setRows] = React.useState<AdminUser[]>([]);
  const [pagination, setPagination] = React.useState<Pagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const pageRef = React.useRef(1);
  const searchRef = React.useRef("");
  const roleFilterRef = React.useRef("all");
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "teacher",
    department: "",
    className: "",
    rollNumber: "",
  });

  const load = React.useCallback(async (page = pageRef.current) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    const nextSearch = searchRef.current.trim();
    const nextRoleFilter = roleFilterRef.current;
    if (nextSearch) params.set("search", nextSearch);
    if (nextRoleFilter !== "all") params.set("role", nextRoleFilter);
    const { data } = await api.get<{ users: AdminUser[]; pagination: Pagination }>(
      `/api/admin/users?${params.toString()}`
    );
    if (data) {
      setRows(data.users || []);
      setPagination((prev) => {
        const next = data.pagination || prev;
        pageRef.current = next.page;
        return next;
      });
    }
  }, []);

  React.useEffect(() => {
    load(1);
  }, [load]);

  const createUser = async () => {
    const payload: Record<string, any> = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      role: form.role,
    };
    if (form.role === "teacher") payload.department = form.department;
    if (form.role === "student") {
      payload.class = form.className;
      payload.rollNumber = Number(form.rollNumber);
    }
    const { error } = await api.post("/api/admin/users", payload);
    if (!error) {
      setOpen(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "teacher",
        department: "",
        className: "",
        rollNumber: "",
      });
      await load(1);
    }
  };

  const removeUser = async (id: string) => {
    await api.delete(`/api/admin/users/${id}`);
    await load();
  };

  const updateRole = async (id: string, role: "admin" | "teacher" | "student") => {
    const body: Record<string, any> = { role };
    if (role === "teacher") body.department = "General";
    if (role === "student") {
      body.class = "General";
      body.rollNumber = 999999;
    }
    await api.put(`/api/admin/users/${id}`, body);
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full max-w-sm">
          <Label>Search</Label>
          <Input
            value={search}
            onChange={(e) => {
              const v = e.target.value;
              setSearch(v);
              searchRef.current = v;
            }}
            placeholder="Name or email"
          />
        </div>
        <div className="w-[200px]">
          <Label>Role</Label>
          <Select
            value={roleFilter}
            onValueChange={(v) => {
              setRoleFilter(v);
              roleFilterRef.current = v;
            }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => load(1)}>Apply</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto"><Plus className="mr-2 h-4 w-4" />Create User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
              <DialogDescription>Add admin/teacher/student account</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <Input placeholder="First name" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
              <Input placeholder="Last name" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
              <Input placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              <Input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
              <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
              {form.role === "teacher" && (
                <Input placeholder="Department" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} />
              )}
              {form.role === "student" && (
                <>
                  <Input placeholder="Class" value={form.className} onChange={(e) => setForm((p) => ({ ...p, className: e.target.value }))} />
                  <Input placeholder="Roll number" value={form.rollNumber} onChange={(e) => setForm((p) => ({ ...p, rollNumber: e.target.value }))} />
                </>
              )}
            </div>
            <DialogFooter><Button onClick={createUser}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Meta</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.fullName}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell><Badge variant="outline">{row.role}</Badge></TableCell>
                  <TableCell>{row.department || row.class || "-"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Select value={row.role} onValueChange={(v) => updateRole(row.id, v as any)}>
                      <SelectTrigger className="inline-flex h-8 w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">admin</SelectItem>
                        <SelectItem value="teacher">teacher</SelectItem>
                        <SelectItem value="student">student</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => removeUser(row.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager pagination={pagination} onChange={load} />
        </CardContent>
      </Card>
    </div>
  );
}

function StudentsPanel() {
  const [rows, setRows] = React.useState<StudentRow[]>([]);
  const [pagination, setPagination] = React.useState<Pagination>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [search, setSearch] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const pageRef = React.useRef(1);
  const searchRef = React.useRef("");
  const departmentRef = React.useRef("");

  const load = React.useCallback(async (page = pageRef.current) => {
    const q = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    const nextSearch = searchRef.current.trim();
    const nextDepartment = departmentRef.current.trim();
    if (nextSearch) q.set("search", nextSearch);
    if (nextDepartment) q.set("department", nextDepartment);
    const { data } = await api.get<{ students: StudentRow[]; pagination: Pagination }>(`/api/admin/students?${q.toString()}`);
    if (data) {
      setRows(data.students || []);
      setPagination((prev) => {
        const next = data.pagination || prev;
        pageRef.current = next.page;
        return next;
      });
    }
  }, []);

  React.useEffect(() => { load(1); }, [load]);

  const deleteRow = async (id: string) => {
    await api.delete(`/api/admin/students/${id}`);
    await load();
  };

  const editRow = async (row: StudentRow) => {
    const nextClass = window.prompt("Class", row.class);
    if (!nextClass) return;
    await api.put(`/api/admin/students/${row.id}`, { class: nextClass });
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          className="max-w-sm"
          placeholder="Search students"
          value={search}
          onChange={(e) => {
            const v = e.target.value;
            setSearch(v);
            searchRef.current = v;
          }}
        />
        <Input
          className="w-[220px]"
          placeholder="Filter by department/class"
          value={department}
          onChange={(e) => {
            const v = e.target.value;
            setDepartment(v);
            departmentRef.current = v;
          }}
        />
        <Button onClick={() => load(1)}>Apply</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Class</TableHead><TableHead>Roll #</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.fullName}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.class}</TableCell>
                  <TableCell>{row.rollNumber}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => editRow(row)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteRow(row.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager pagination={pagination} onChange={load} />
        </CardContent>
      </Card>
    </div>
  );
}

function TeachersPanel() {
  const [rows, setRows] = React.useState<AdminUser[]>([]);
  const [pagination, setPagination] = React.useState<Pagination>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [search, setSearch] = React.useState("");
  const pageRef = React.useRef(1);
  const searchRef = React.useRef("");

  const load = React.useCallback(async (page = pageRef.current) => {
    const q = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), role: "teacher" });
    const nextSearch = searchRef.current.trim();
    if (nextSearch) q.set("search", nextSearch);
    const { data } = await api.get<{ users: AdminUser[]; pagination: Pagination }>(`/api/admin/users?${q.toString()}`);
    if (data) {
      setRows(data.users || []);
      setPagination((prev) => {
        const next = data.pagination || prev;
        pageRef.current = next.page;
        return next;
      });
    }
  }, []);

  React.useEffect(() => { load(1); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          className="max-w-sm"
          placeholder="Search teachers"
          value={search}
          onChange={(e) => {
            const v = e.target.value;
            setSearch(v);
            searchRef.current = v;
          }}
        />
        <Button onClick={() => load(1)}>Apply</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Department</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.fullName}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.department || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={async () => { await api.delete(`/api/admin/users/${row.id}`); await load(); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager pagination={pagination} onChange={load} />
        </CardContent>
      </Card>
    </div>
  );
}

function SubjectsPanel() {
  const [rows, setRows] = React.useState<any[]>([]);
  const [pagination, setPagination] = React.useState<Pagination>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [search, setSearch] = React.useState("");
  const pageRef = React.useRef(1);
  const searchRef = React.useRef("");
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [teacherUserId, setTeacherUserId] = React.useState("");

  const load = React.useCallback(async (page = pageRef.current) => {
    const q = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    const nextSearch = searchRef.current.trim();
    if (nextSearch) q.set("search", nextSearch);
    const { data } = await api.get<any>(`/api/admin/subjects?${q.toString()}`);
    if (!data) return;
    setRows(data.subjects || []);
    setPagination((prev) => {
      const next = data.pagination || prev;
      pageRef.current = next.page;
      return next;
    });
  }, []);

  React.useEffect(() => { load(1); }, [load]);

  const createSubject = async () => {
    const payload: Record<string, string> = { name, department };
    if (teacherUserId.trim()) payload.teacherUserId = teacherUserId.trim();
    const { error } = await api.post("/api/admin/subjects", payload);
    if (!error) {
      setOpen(false);
      setName("");
      setDepartment("");
      setTeacherUserId("");
      await load(1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          className="max-w-sm"
          placeholder="Search subjects"
          value={search}
          onChange={(e) => {
            const v = e.target.value;
            setSearch(v);
            searchRef.current = v;
          }}
        />
        <Button onClick={() => load(1)}>Apply</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="ml-auto"><Plus className="mr-2 h-4 w-4" />Create Subject</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Subject</DialogTitle><DialogDescription>Add subject and optionally assign teacher</DialogDescription></DialogHeader>
            <div className="grid gap-3">
              <Input placeholder="Subject name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
              <Input placeholder="Teacher user id (optional)" value={teacherUserId} onChange={(e) => setTeacherUserId(e.target.value)} />
            </div>
            <DialogFooter><Button onClick={createSubject}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Department</TableHead><TableHead>Teacher</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((row: any) => (
                <TableRow key={String(row._id)}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.teachers?.[0] ? `${row.teachers[0].firstName} ${row.teachers[0].lastName}` : "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={async () => {
                      const nextTeacherUserId = window.prompt("Teacher user ID");
                      if (!nextTeacherUserId) return;
                      await api.put(`/api/admin/subjects/${row._id}/assign-teacher`, { teacherUserId: nextTeacherUserId });
                      await load();
                    }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={async () => { await api.delete(`/api/admin/subjects/${row._id}`); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager pagination={pagination} onChange={load} />
        </CardContent>
      </Card>
    </div>
  );
}

function AssignmentsPanel() {
  const [rows, setRows] = React.useState<any[]>([]);
  const [pagination, setPagination] = React.useState<Pagination>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [search, setSearch] = React.useState("");
  const pageRef = React.useRef(1);
  const searchRef = React.useRef("");

  const load = React.useCallback(async (page = pageRef.current) => {
    const q = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    const nextSearch = searchRef.current.trim();
    if (nextSearch) q.set("search", nextSearch);
    const { data } = await api.get<any>(`/api/admin/assignments?${q.toString()}`);
    if (!data) return;
    setRows(data.assignments || []);
    setPagination((prev) => {
      const next = data.pagination || prev;
      pageRef.current = next.page;
      return next;
    });
  }, []);

  React.useEffect(() => { load(1); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          className="max-w-sm"
          placeholder="Search assignments"
          value={search}
          onChange={(e) => {
            const v = e.target.value;
            setSearch(v);
            searchRef.current = v;
          }}
        />
        <Button onClick={() => load(1)}>Apply</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Subject</TableHead><TableHead>Completion</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((row: any) => (
                <TableRow key={String(row._id)}>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{row.subject}</TableCell>
                  <TableCell>{row.stats?.completionPercentage || 0}%</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={async () => { await api.delete(`/api/admin/assignments/${row._id}`); await load(); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager pagination={pagination} onChange={load} />
        </CardContent>
      </Card>
    </div>
  );
}

function AnnouncementsPanel() {
  const [rows, setRows] = React.useState<any[]>([]);
  const [pagination, setPagination] = React.useState<Pagination>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [search, setSearch] = React.useState("");
  const pageRef = React.useRef(1);
  const searchRef = React.useRef("");

  const load = React.useCallback(async (page = pageRef.current) => {
    const q = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    const nextSearch = searchRef.current.trim();
    if (nextSearch) q.set("search", nextSearch);
    const { data } = await api.get<any>(`/api/admin/announcements?${q.toString()}`);
    if (!data) return;
    setRows(data.announcements || []);
    setPagination((prev) => {
      const next = data.pagination || prev;
      pageRef.current = next.page;
      return next;
    });
  }, []);

  React.useEffect(() => { load(1); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          className="max-w-sm"
          placeholder="Search announcements"
          value={search}
          onChange={(e) => {
            const v = e.target.value;
            setSearch(v);
            searchRef.current = v;
          }}
        />
        <Button onClick={() => load(1)}>Apply</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Subject</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((row: any) => (
                <TableRow key={String(row._id)}>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{row.subject}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={async () => {
                      const title = window.prompt("Title", row.title);
                      const message = window.prompt("Message", row.message);
                      if (!title || !message) return;
                      await api.put(`/api/admin/announcements/${row._id}`, { title, message });
                      await load();
                    }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={async () => { await api.delete(`/api/admin/announcements/${row._id}`); await load(); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager pagination={pagination} onChange={load} />
        </CardContent>
      </Card>
    </div>
  );
}

function AttendanceReportsPanel() {
  const [summary, setSummary] = React.useState({ totalStudents: 0, attendancePercentage: 0 });
  const [perClass, setPerClass] = React.useState<Array<{ class: string; attendancePercentage: number }>>([]);
  const [perStudent, setPerStudent] = React.useState<Array<{
    studentId: string;
    fullName: string;
    class: string;
    attendancePercentage: number;
    totalClasses: number;
    presentClasses: number;
  }>>([]);
  const [filters, setFilters] = React.useState({
    className: "",
    studentId: "",
    date: "",
  });

  const loadReport = React.useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.className.trim()) params.set("class", filters.className.trim());
    if (filters.studentId.trim()) params.set("studentId", filters.studentId.trim());
    if (filters.date) params.set("date", filters.date);

    const { data } = await api.get<any>(
      `/api/admin/attendance/report${params.toString() ? `?${params}` : ""}`
    );
    if (!data) return;
    setSummary({
      totalStudents: data.summary?.totalStudents || 0,
      attendancePercentage: data.summary?.attendancePercentage || 0,
    });
    setPerClass(data.perClass || []);
    setPerStudent(data.perStudent || []);
  }, [filters]);

  React.useEffect(() => {
    loadReport();
  }, [loadReport]);

  const exportCsv = () => {
    const headers = ["Name", "Class", "Present", "Total", "Attendance %"];
    const rows = perStudent.map((row) => [
      row.fullName,
      row.class,
      String(row.presentClasses ?? 0),
      String(row.totalClasses ?? 0),
      String(row.attendancePercentage ?? 0),
    ]);

    const csv = [headers, ...rows]
      .map((line) => line.map((value) => `"${value.replace(/\"/g, '\"\"')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "attendance-report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Label>Class</Label>
            <Input
              placeholder="e.g. FYBSc"
              value={filters.className}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, className: event.target.value }))
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Student ID</Label>
            <Input
              placeholder="Student ObjectId"
              value={filters.studentId}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, studentId: event.target.value }))
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={filters.date}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, date: event.target.value }))
              }
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={loadReport}>Apply</Button>
            <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Students in Report" value={summary.totalStudents} icon={Users} />
        <StatCard title="Overall Attendance" value={`${summary.attendancePercentage}%`} icon={CircleCheckBig} />
      </div>
      <Card>
        <CardHeader><CardTitle>Attendance by Class</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={perClass}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="class" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="attendancePercentage" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Per Student Attendance</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Attendance %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perStudent.map((row) => (
                <TableRow key={row.studentId}>
                  <TableCell>{row.fullName}</TableCell>
                  <TableCell>{row.class}</TableCell>
                  <TableCell>{row.presentClasses}</TableCell>
                  <TableCell>{row.totalClasses}</TableCell>
                  <TableCell>{row.attendancePercentage}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminDashboard({ activeTab }: { activeTab: string }) {
  if (activeTab === "users") return <UsersPanel />;
  if (activeTab === "students") return <StudentsPanel />;
  if (activeTab === "teachers") return <TeachersPanel />;
  if (activeTab === "subjects") return <SubjectsPanel />;
  if (activeTab === "assignments") return <AssignmentsPanel />;
  if (activeTab === "announcements") return <AnnouncementsPanel />;
  if (activeTab === "attendance-reports") return <AttendanceReportsPanel />;
  return <AdminOverview />;
}
