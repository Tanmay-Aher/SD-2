export type Role = "student" | "teacher" | "admin"

export interface Student {
  id: string
  name: string
  email: string
  grade: string
  attendance: number
  avgMarks: number
  status: "active" | "inactive"
}

export interface Teacher {
  id: string
  name: string
  email: string
  subject: string
  students: number
  status: "active" | "inactive"
}

export interface Assignment {
  id: string
  title: string
  subject: string
  dueDate: string
  status: "pending" | "submitted" | "graded"
  grade?: string
}

export interface Announcement {
  id: string
  title: string
  message: string
  date: string
  author: string
  priority: "low" | "medium" | "high"
}

export interface TimetableEntry {
  id: string
  day: string
  time: string
  subject: string
  teacher: string
  room: string
}

export interface Exam {
  id: string
  subject: string
  date: string
  time: string
  room: string
  status: "upcoming" | "completed"
}

export const students: Student[] = [
  { id: "1", name: "Alice Johnson", email: "alice@school.edu", grade: "10A", attendance: 94, avgMarks: 87, status: "active" },
  { id: "2", name: "Bob Smith", email: "bob@school.edu", grade: "10A", attendance: 88, avgMarks: 72, status: "active" },
  { id: "3", name: "Carol White", email: "carol@school.edu", grade: "10B", attendance: 96, avgMarks: 91, status: "active" },
  { id: "4", name: "David Brown", email: "david@school.edu", grade: "10B", attendance: 78, avgMarks: 65, status: "active" },
  { id: "5", name: "Eva Green", email: "eva@school.edu", grade: "10A", attendance: 91, avgMarks: 83, status: "active" },
  { id: "6", name: "Frank Lee", email: "frank@school.edu", grade: "10C", attendance: 85, avgMarks: 76, status: "active" },
  { id: "7", name: "Grace Kim", email: "grace@school.edu", grade: "10C", attendance: 97, avgMarks: 95, status: "active" },
  { id: "8", name: "Henry Davis", email: "henry@school.edu", grade: "10A", attendance: 72, avgMarks: 58, status: "inactive" },
]

export const teachers: Teacher[] = [
  { id: "1", name: "Dr. Sarah Wilson", email: "wilson@school.edu", subject: "Mathematics", students: 45, status: "active" },
  { id: "2", name: "Mr. James Taylor", email: "taylor@school.edu", subject: "Physics", students: 38, status: "active" },
  { id: "3", name: "Ms. Linda Adams", email: "adams@school.edu", subject: "English", students: 42, status: "active" },
  { id: "4", name: "Prof. Robert Clark", email: "clark@school.edu", subject: "Chemistry", students: 36, status: "active" },
  { id: "5", name: "Ms. Patricia Hall", email: "hall@school.edu", subject: "Biology", students: 40, status: "inactive" },
]

export const assignments: Assignment[] = [
  { id: "1", title: "Quadratic Equations Worksheet", subject: "Mathematics", dueDate: "2026-02-20", status: "pending" },
  { id: "2", title: "Newton's Laws Lab Report", subject: "Physics", dueDate: "2026-02-18", status: "submitted" },
  { id: "3", title: "Shakespeare Essay", subject: "English", dueDate: "2026-02-15", status: "graded", grade: "A" },
  { id: "4", title: "Chemical Bonding Notes", subject: "Chemistry", dueDate: "2026-02-22", status: "pending" },
  { id: "5", title: "Cell Division Diagram", subject: "Biology", dueDate: "2026-02-14", status: "graded", grade: "B+" },
  { id: "6", title: "Trigonometry Practice Set", subject: "Mathematics", dueDate: "2026-02-25", status: "pending" },
]

export const announcements: Announcement[] = [
  { id: "1", title: "Mid-Term Exam Schedule Released", message: "The mid-term examination schedule for February 2026 has been published. Please check the timetable section for details.", date: "2026-02-14", author: "Admin Office", priority: "high" },
  { id: "2", title: "Science Fair Registration Open", message: "Registration for the annual science fair is now open. Deadline is March 1st.", date: "2026-02-13", author: "Dr. Sarah Wilson", priority: "medium" },
  { id: "3", title: "Parent-Teacher Meeting", message: "The upcoming parent-teacher meeting will be held on February 28th from 2 PM to 5 PM.", date: "2026-02-12", author: "Admin Office", priority: "high" },
  { id: "4", title: "Library Hours Extended", message: "Library will remain open until 8 PM during exam season starting February 20th.", date: "2026-02-11", author: "Library Staff", priority: "low" },
  { id: "5", title: "Sports Day Postponed", message: "Due to weather conditions, Sports Day has been rescheduled to March 15th.", date: "2026-02-10", author: "Sports Department", priority: "medium" },
]

export const timetable: TimetableEntry[] = [
  { id: "1", day: "Monday", time: "08:00 - 09:00", subject: "Mathematics", teacher: "Dr. Sarah Wilson", room: "Room 201" },
  { id: "2", day: "Monday", time: "09:00 - 10:00", subject: "Physics", teacher: "Mr. James Taylor", room: "Lab 1" },
  { id: "3", day: "Monday", time: "10:30 - 11:30", subject: "English", teacher: "Ms. Linda Adams", room: "Room 105" },
  { id: "4", day: "Monday", time: "11:30 - 12:30", subject: "Chemistry", teacher: "Prof. Robert Clark", room: "Lab 2" },
  { id: "5", day: "Tuesday", time: "08:00 - 09:00", subject: "Biology", teacher: "Ms. Patricia Hall", room: "Lab 3" },
  { id: "6", day: "Tuesday", time: "09:00 - 10:00", subject: "Mathematics", teacher: "Dr. Sarah Wilson", room: "Room 201" },
  { id: "7", day: "Tuesday", time: "10:30 - 11:30", subject: "Physics", teacher: "Mr. James Taylor", room: "Lab 1" },
  { id: "8", day: "Tuesday", time: "11:30 - 12:30", subject: "English", teacher: "Ms. Linda Adams", room: "Room 105" },
  { id: "9", day: "Wednesday", time: "08:00 - 09:00", subject: "Chemistry", teacher: "Prof. Robert Clark", room: "Lab 2" },
  { id: "10", day: "Wednesday", time: "09:00 - 10:00", subject: "Biology", teacher: "Ms. Patricia Hall", room: "Lab 3" },
  { id: "11", day: "Wednesday", time: "10:30 - 11:30", subject: "Mathematics", teacher: "Dr. Sarah Wilson", room: "Room 201" },
  { id: "12", day: "Wednesday", time: "11:30 - 12:30", subject: "Physics", teacher: "Mr. James Taylor", room: "Lab 1" },
  { id: "13", day: "Thursday", time: "08:00 - 09:00", subject: "English", teacher: "Ms. Linda Adams", room: "Room 105" },
  { id: "14", day: "Thursday", time: "09:00 - 10:00", subject: "Chemistry", teacher: "Prof. Robert Clark", room: "Lab 2" },
  { id: "15", day: "Thursday", time: "10:30 - 11:30", subject: "Biology", teacher: "Ms. Patricia Hall", room: "Lab 3" },
  { id: "16", day: "Thursday", time: "11:30 - 12:30", subject: "Mathematics", teacher: "Dr. Sarah Wilson", room: "Room 201" },
  { id: "17", day: "Friday", time: "08:00 - 09:00", subject: "Physics", teacher: "Mr. James Taylor", room: "Lab 1" },
  { id: "18", day: "Friday", time: "09:00 - 10:00", subject: "English", teacher: "Ms. Linda Adams", room: "Room 105" },
  { id: "19", day: "Friday", time: "10:30 - 11:30", subject: "Chemistry", teacher: "Prof. Robert Clark", room: "Lab 2" },
  { id: "20", day: "Friday", time: "11:30 - 12:30", subject: "Biology", teacher: "Ms. Patricia Hall", room: "Lab 3" },
]

export const exams: Exam[] = [
  { id: "1", subject: "Mathematics", date: "2026-03-01", time: "09:00 AM", room: "Hall A", status: "upcoming" },
  { id: "2", subject: "Physics", date: "2026-03-03", time: "09:00 AM", room: "Hall B", status: "upcoming" },
  { id: "3", subject: "English", date: "2026-03-05", time: "09:00 AM", room: "Hall A", status: "upcoming" },
  { id: "4", subject: "Chemistry", date: "2026-03-07", time: "09:00 AM", room: "Hall B", status: "upcoming" },
  { id: "5", subject: "Biology", date: "2026-03-09", time: "09:00 AM", room: "Hall A", status: "upcoming" },
]

export const attendanceData = [
  { month: "Sep", rate: 92 },
  { month: "Oct", rate: 88 },
  { month: "Nov", rate: 95 },
  { month: "Dec", rate: 90 },
  { month: "Jan", rate: 93 },
  { month: "Feb", rate: 91 },
]

export const performanceData = [
  { subject: "Math", score: 87 },
  { subject: "Physics", score: 78 },
  { subject: "English", score: 92 },
  { subject: "Chemistry", score: 74 },
  { subject: "Biology", score: 85 },
]

export const goalsData = [
  { name: "Completed", value: 68, fill: "hsl(var(--chart-1))" },
  { name: "In Progress", value: 22, fill: "hsl(var(--chart-2))" },
  { name: "Not Started", value: 10, fill: "hsl(var(--chart-3))" },
]

export const weeklyProgressData = [
  { week: "W1", accuracy: 72 },
  { week: "W2", accuracy: 78 },
  { week: "W3", accuracy: 74 },
  { week: "W4", accuracy: 82 },
  { week: "W5", accuracy: 88 },
  { week: "W6", accuracy: 85 },
  { week: "W7", accuracy: 91 },
]

export const classPerformanceData = [
  { month: "Sep", average: 72, highest: 95, lowest: 45 },
  { month: "Oct", average: 75, highest: 97, lowest: 48 },
  { month: "Nov", average: 78, highest: 96, lowest: 52 },
  { month: "Dec", average: 74, highest: 94, lowest: 46 },
  { month: "Jan", average: 80, highest: 98, lowest: 55 },
  { month: "Feb", average: 82, highest: 97, lowest: 58 },
]

export const systemAnalyticsData = [
  { month: "Sep", students: 320, teachers: 28, courses: 45 },
  { month: "Oct", students: 335, teachers: 30, courses: 47 },
  { month: "Nov", students: 342, teachers: 30, courses: 48 },
  { month: "Dec", students: 338, teachers: 29, courses: 48 },
  { month: "Jan", students: 355, teachers: 32, courses: 50 },
  { month: "Feb", students: 362, teachers: 32, courses: 52 },
]
