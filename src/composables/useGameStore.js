import { ref, computed } from 'vue'

const goalName = ref('')
const durationDays = ref(0)
const tasks = ref([])
const isSetupComplete = ref(false)
const currentHp = ref(0)

let taskIdCounter = 0

const maxHp = computed(() => durationDays.value * 5)
const hpPercent = computed(() => (maxHp.value > 0 ? (currentHp.value / maxHp.value) * 100 : 0))
const canAddTask = computed(() => tasks.value.length < 5)
const isVictory = computed(() => isSetupComplete.value && currentHp.value <= 0)

function createRock(name, days) {
	goalName.value = name
	durationDays.value = days
	currentHp.value = days * 5
	tasks.value = []
	taskIdCounter = 0
	isSetupComplete.value = true
}

function addTask(text) {
	if (!canAddTask.value || !text.trim()) return
	tasks.value.push({
		id: ++taskIdCounter,
		text: text.trim(),
		completed: false,
	})
}

function removeTask(id) {
	const index = tasks.value.findIndex((t) => t.id === id)
	if (index !== -1) {
		tasks.value.splice(index, 1)
	}
}

function updateTask(id, newText) {
	const task = tasks.value.find((t) => t.id === id)
	if (task) {
		task.text = newText.trim()
	}
}

function toggleTask(id) {
	const task = tasks.value.find((t) => t.id === id)
	if (!task) return

	if (!task.completed) {
		task.completed = true
		hitRock()
	} else {
		task.completed = false
	}
}

function hitRock() {
	if (currentHp.value > 0) {
		currentHp.value--
	}
}

function resetGame() {
	goalName.value = ''
	durationDays.value = 0
	currentHp.value = 0
	tasks.value = []
	taskIdCounter = 0
	isSetupComplete.value = false
}

export function useGameStore() {
	return {
		goalName,
		durationDays,
		tasks,
		currentHp,
		maxHp,
		hpPercent,
		isSetupComplete,
		canAddTask,
		isVictory,
		createRock,
		addTask,
		removeTask,
		updateTask,
		toggleTask,
		hitRock,
		resetGame,
	}
}
