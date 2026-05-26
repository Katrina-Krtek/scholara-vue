import { ref, computed } from 'vue';

const STORAGE_KEY = 'scholar-courses';
const PROGRAMS_KEY = 'scholar-programs';

function loadCourses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function loadPrograms() {
  try {
    return JSON.parse(localStorage.getItem(PROGRAMS_KEY) || '[]');
  } catch { return []; }
}

const courses = ref(loadCourses());
const programs = ref(loadPrograms());

export function useCourses() {

  function saveCourses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses.value));
  }

  function savePrograms() {
    localStorage.setItem(PROGRAMS_KEY, JSON.stringify(programs.value));
  }

  // --- PROGRAMS ---
  function addProgram(name, gpaScale = '4.0-standard') {
    programs.value.push({
      id: Date.now(),
      name,
      gpaScale, // '4.0-standard' | '4.0-plusminus' | 'custom'
      customScale: null,
      createdAt: new Date().toISOString()
    });
    savePrograms();
  }

  function updateProgram(id, updates) {
    const p = programs.value.find(p => p.id === id);
    if (p) Object.assign(p, updates);
    savePrograms();
  }

  function deleteProgram(id) {
    programs.value = programs.value.filter(p => p.id !== id);
    savePrograms();
  }

  // --- COURSES ---
  function addCourse(data) {
    courses.value.unshift({
      id: Date.now(),
      title: data.title || 'Untitled Course',
      code: data.code || '',
      instructorName: data.instructorName || '',
      instructorEmail: data.instructorEmail || '',
      instructorPhone: data.instructorPhone || '',
      credits: data.credits || 3,
      term: data.term || '',
      status: data.status || 'Active',
      meetingTime: data.meetingTime || '',
      location: data.location || '',
      programId: data.programId || null,
      icon: data.icon || '📚',
      bannerUrl: data.bannerUrl || null,
      bannerPosition: data.bannerPosition || 50,
      color: data.color || '#6366f1',
      assignments: [],
      files: [],
      activity: [],
      relations: {
        tasks: [],
        sources: [],
        sessions: []
      },
      createdAt: new Date().toISOString()
    });
    saveCourses();
    return courses.value[0];
  }

  function updateCourse(id, updates) {
    const c = courses.value.find(c => c.id === id);
    if (c) {
      Object.assign(c, updates);
      logActivity(id, 'Course updated');
    }
    saveCourses();
  }

  function deleteCourse(id) {
    courses.value = courses.value.filter(c => c.id !== id);
    saveCourses();
  }

  // --- ASSIGNMENTS ---
  function addAssignment(courseId, data) {
    const course = courses.value.find(c => c.id === courseId);
    if (!course) return;
    course.assignments.push({
      id: Date.now(),
      title: data.title || 'Untitled Assignment',
      dueDate: data.dueDate || null,
      grade: data.grade ?? null,      // null = not graded yet
      maxGrade: data.maxGrade || 100,
      weight: data.weight || 1,
      status: data.status || 'Pending', // Pending | Submitted | Graded | Late | Missing
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    });
    logActivity(courseId, `Assignment added: ${data.title}`);
    saveCourses();
  }

  function updateAssignment(courseId, assignmentId, updates) {
    const course = courses.value.find(c => c.id === courseId);
    if (!course) return;
    const a = course.assignments.find(a => a.id === assignmentId);
    if (a) Object.assign(a, updates);
    logActivity(courseId, `Assignment updated: ${a?.title}`);
    saveCourses();
  }

  function deleteAssignment(courseId, assignmentId) {
    const course = courses.value.find(c => c.id === courseId);
    if (!course) return;
    course.assignments = course.assignments.filter(a => a.id !== assignmentId);
    saveCourses();
  }

  // --- FILES ---
  function addFile(courseId, fileData) {
    const course = courses.value.find(c => c.id === courseId);
    if (!course) return;
    course.files.push({
      id: Date.now(),
      name: fileData.name,
      size: fileData.size,
      type: fileData.type,
      addedAt: new Date().toISOString()
    });
    logActivity(courseId, `File added: ${fileData.name}`);
    saveCourses();
  }

  function deleteFile(courseId, fileId) {
    const course = courses.value.find(c => c.id === courseId);
    if (!course) return;
    course.files = course.files.filter(f => f.id !== fileId);
    saveCourses();
  }

  // --- ACTIVITY ---
  function logActivity(courseId, message, isManual = false) {
    const course = courses.value.find(c => c.id === courseId);
    if (!course) return;
    course.activity.unshift({
      id: Date.now(),
      message,
      isManual,
      createdAt: new Date().toISOString()
    });
    saveCourses();
  }

  function addManualActivity(courseId, message) {
    logActivity(courseId, message, true);
  }

  // --- GRADE CALCULATIONS ---
  const GPA_SCALES = {
    '4.0-standard': [
      { min: 90, gpa: 4.0, letter: 'A' },
      { min: 80, gpa: 3.0, letter: 'B' },
      { min: 70, gpa: 2.0, letter: 'C' },
      { min: 60, gpa: 1.0, letter: 'D' },
      { min: 0,  gpa: 0.0, letter: 'F' }
    ],
    '4.0-plusminus': [
      { min: 97, gpa: 4.0, letter: 'A+' },
      { min: 93, gpa: 4.0, letter: 'A'  },
      { min: 90, gpa: 3.7, letter: 'A-' },
      { min: 87, gpa: 3.3, letter: 'B+' },
      { min: 83, gpa: 3.0, letter: 'B'  },
      { min: 80, gpa: 2.7, letter: 'B-' },
      { min: 77, gpa: 2.3, letter: 'C+' },
      { min: 73, gpa: 2.0, letter: 'C'  },
      { min: 70, gpa: 1.7, letter: 'C-' },
      { min: 67, gpa: 1.3, letter: 'D+' },
      { min: 63, gpa: 1.0, letter: 'D'  },
      { min: 60, gpa: 0.7, letter: 'D-' },
      { min: 0,  gpa: 0.0, letter: 'F'  }
    ]
  };

  function getCourseAverage(courseId) {
    const course = courses.value.find(c => c.id === courseId);
    if (!course) return null;
    const graded = course.assignments.filter(a => a.grade !== null);
    if (!graded.length) return null;
    const total = graded.reduce((sum, a) => sum + (a.grade / a.maxGrade) * 100, 0);
    return Math.round((total / graded.length) * 10) / 10;
  }

  function getLetterGrade(percentage, scale) {
    const scaleData = GPA_SCALES[scale] || GPA_SCALES['4.0-standard'];
    const entry = scaleData.find(s => percentage >= s.min);
    return entry || scaleData[scaleData.length - 1];
  }

  function getProgramGPA(programId) {
    const program = programs.value.find(p => p.id === programId);
    if (!program) return null;
    const programCourses = courses.value.filter(
      c => c.programId === programId && c.status === 'Active' || c.status === 'Completed'
    );
    if (!programCourses.length) return null;

    let totalPoints = 0;
    let totalCredits = 0;

    programCourses.forEach(course => {
      const avg = getCourseAverage(course.id);
      if (avg === null) return;
      const gradeEntry = getLetterGrade(avg, program.gpaScale);
      const credits = Number(course.credits) || 3;
      totalPoints += gradeEntry.gpa * credits;
      totalCredits += credits;
    });

    if (!totalCredits) return null;
    return Math.round((totalPoints / totalCredits) * 100) / 100;
  }

  // --- COMPUTED HELPERS ---
  const activeCourses = computed(() =>
    courses.value.filter(c => c.status === 'Active')
  );

  const coursesByProgram = computed(() => {
    const map = {};
    programs.value.forEach(p => {
      map[p.id] = courses.value.filter(c => c.programId === p.id);
    });
    map['unassigned'] = courses.value.filter(c => !c.programId);
    return map;
  });

  function getCourse(id) {
    return courses.value.find(c => c.id === Number(id)) || null;
  }

  function refreshCourses() {
    courses.value = loadCourses();
    programs.value = loadPrograms();
  }

  return {
    courses,
    programs,
    activeCourses,
    coursesByProgram,
    GPA_SCALES,
    addCourse,
    updateCourse,
    deleteCourse,
    getCourse,
    addProgram,
    updateProgram,
    deleteProgram,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    addFile,
    deleteFile,
    logActivity,
    addManualActivity,
    getCourseAverage,
    getLetterGrade,
    getProgramGPA,
    refreshCourses
  };
}