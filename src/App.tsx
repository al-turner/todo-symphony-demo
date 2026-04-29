import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Todo = {
  id: number
  text: string
  completed: boolean
}

function App() {
  const inputId = useId()
  const [todoText, setTodoText] = useState('')
  const [todos, setTodos] = useState<Todo[]>([])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const text = todoText.trim()

    if (!text) {
      return
    }

    setTodos((currentTodos) => [
      ...currentTodos,
      {
        id: Date.now(),
        text,
        completed: false,
      },
    ])
    setTodoText('')
  }

  function handleToggle(id: number) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  const openTodos = todos.filter((todo) => !todo.completed)
  const completedTodos = todos.filter((todo) => todo.completed)

  return (
    <main className="app-shell">
      <section className="todo-card" aria-labelledby="todo-title">
        <p className="eyebrow">Simple TODO list</p>
        <h1 id="todo-title">Track the next thing to do.</h1>
        <p className="intro">
          Add a single line task, then tick it off when it&apos;s done.
        </p>

        <form className="todo-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor={inputId}>
            New TODO
          </label>
          <input
            id={inputId}
            type="text"
            value={todoText}
            onChange={(event) => setTodoText(event.target.value)}
            placeholder="Add a TODO"
            autoComplete="off"
            maxLength={120}
          />
          <button type="submit" disabled={!todoText.trim()}>
            Add TODO
          </button>
        </form>

        <div className="todo-panel" aria-live="polite">
          <section className="todo-section" aria-labelledby="todo-open-title">
            <div className="section-header">
              <h2 id="todo-open-title">Open</h2>
              <span>{openTodos.length}</span>
            </div>

            {openTodos.length === 0 ? (
              <p className="empty-state">No open TODOs</p>
            ) : (
              <ul className="todo-list">
                {openTodos.map((todo) => (
                  <li key={todo.id} className="todo-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggle(todo.id)}
                      />
                      <span>{todo.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            className="todo-section"
            aria-labelledby="todo-completed-title"
          >
            <div className="section-header">
              <h2 id="todo-completed-title">Completed</h2>
              <span>{completedTodos.length}</span>
            </div>

            {completedTodos.length === 0 ? (
              <p className="empty-state">No completed TODOs yet</p>
            ) : (
              <ul className="todo-list">
                {completedTodos.map((todo) => (
                  <li key={todo.id} className="todo-item todo-item--completed">
                    <label>
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggle(todo.id)}
                      />
                      <span>{todo.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}

export default App
