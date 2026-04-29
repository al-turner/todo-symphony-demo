import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Todo = {
  id: number
  text: string
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
      },
    ])
    setTodoText('')
  }

  function handleComplete(id: number) {
    setTodos((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== id),
    )
  }

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
          {todos.length === 0 ? (
            <p className="empty-state">No TODOs yet</p>
          ) : (
            <ul className="todo-list">
              {todos.map((todo) => (
                <li key={todo.id} className="todo-item">
                  <label>
                    <input
                      type="checkbox"
                      onChange={() => handleComplete(todo.id)}
                    />
                    <span>{todo.text}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}

export default App
