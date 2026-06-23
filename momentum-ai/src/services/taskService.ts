import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  limit
} from "firebase/firestore";
import { db } from "./firebase";
import type { Task } from "../types/task";

// Tasks Collection Methods
export async function createTask(taskData: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const tasksRef = collection(db, "tasks");
  const now = new Date().toISOString();
  const docRef = await addDoc(tasksRef, {
    ...taskData,
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  const taskRef = doc(db, "tasks", taskId);
  await deleteDoc(taskRef);
}

export function subscribeToTasks(userId: string, callback: (tasks: Task[]) => void) {
  const tasksRef = collection(db, "tasks");
  const q = query(
    tasksRef, 
    where("userId", "==", userId), 
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = [];
    snapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() } as Task);
    });
    callback(tasks);
  }, (err) => {
    console.error("Error subscribing to tasks: ", err);
  });
}

// Interface for Habits data model
export interface Habit {
  id: string;
  userId: string;
  name: string;
  frequency: "daily" | "weekly";
  streak: number;
  history: string[]; // ISO Dates "YYYY-MM-DD"
  createdAt: string;
}

// Habits Collection Methods
export async function createHabit(userId: string, name: string, frequency: "daily" | "weekly" = "daily"): Promise<string> {
  const habitsRef = collection(db, "habits");
  const now = new Date().toISOString();
  const docRef = await addDoc(habitsRef, {
    userId,
    name,
    frequency,
    streak: 0,
    history: [],
    createdAt: now
  });
  return docRef.id;
}

export async function toggleHabitDate(habit: Habit, dateStr: string): Promise<void> {
  const habitRef = doc(db, "habits", habit.id);
  let newHistory = [...habit.history];
  
  if (newHistory.includes(dateStr)) {
    newHistory = newHistory.filter(d => d !== dateStr);
  } else {
    newHistory.push(dateStr);
  }
  
  // Recalculate streak simple logic (number of consecutive days including today/yesterday)
  newHistory.sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // descending order
  let streak = 0;
  if (newHistory.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let checkDate = today;
    
    // Check if the most recent date is today or yesterday
    const mostRecentDate = new Date(newHistory[0]);
    mostRecentDate.setHours(0,0,0,0);
    
    const diffTime = Math.abs(today.getTime() - mostRecentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) { // within today/yesterday
      if (diffDays === 1) {
        checkDate = mostRecentDate; // start from yesterday
      }
      
      streak = 1;
      let i = 1;
      while (i < newHistory.length) {
        const prevDate = new Date(checkDate);
        prevDate.setDate(prevDate.getDate() - 1);
        prevDate.setHours(0,0,0,0);
        
        const currentCheck = new Date(newHistory[i]);
        currentCheck.setHours(0,0,0,0);
        
        if (currentCheck.getTime() === prevDate.getTime()) {
          streak++;
          checkDate = currentCheck;
        } else {
          break;
        }
        i++;
      }
    }
  }

  await updateDoc(habitRef, {
    history: newHistory,
    streak: streak
  });
}

export async function deleteHabit(habitId: string): Promise<void> {
  const habitRef = doc(db, "habits", habitId);
  await deleteDoc(habitRef);
}

export function subscribeToHabits(userId: string, callback: (habits: Habit[]) => void) {
  const habitsRef = collection(db, "habits");
  const q = query(
    habitsRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const habits: Habit[] = [];
    snapshot.forEach((doc) => {
      habits.push({ id: doc.id, ...doc.data() } as Habit);
    });
    callback(habits);
  });
}

// Interface for Focus Sessions
export interface FocusSession {
  id: string;
  userId: string;
  taskId: string | null;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  completed: boolean;
}

// Focus Sessions Methods
export async function createFocusSession(session: Omit<FocusSession, "id">): Promise<string> {
  const sessionsRef = collection(db, "focusSessions");
  const docRef = await addDoc(sessionsRef, session);
  return docRef.id;
}

export function subscribeToFocusSessions(userId: string, callback: (sessions: FocusSession[]) => void) {
  const sessionsRef = collection(db, "focusSessions");
  const q = query(
    sessionsRef,
    where("userId", "==", userId),
    orderBy("startedAt", "desc"),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const sessions: FocusSession[] = [];
    snapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() } as FocusSession);
    });
    callback(sessions);
  });
}
