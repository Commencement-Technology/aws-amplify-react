import { Amplify } from "aws-amplify";
import { useEffect, useState } from "react";
import amplifyConfig from "./amplifyconfiguration.json";
import { listTodos as listTodo } from "./graphql/queries";
import { generateClient } from "aws-amplify/api";
import { createTodo } from "./graphql/mutations";

Amplify.configure(amplifyConfig);
const client = generateClient();
const initialState = { name: "", description: "" };

function App() {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodo] = useState<(typeof initialState)[]>([]);
  const [count, setCount] = useState(0);

  function setInput(key: string, value: string) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodo() {
    try {
      const todoData = await client.graphql({
        query: listTodo,
      });
      const todos = todoData.data.listTodos.items;
      setTodo(todos);
      console.log(todos);
    } catch (error) {
      console.log("there was an error");
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodo((prev) => [...prev, todo]);
      setFormState(initialState);
      await client.graphql({
        query: createTodo,
        variables: {
          input: todo,
        },
      });
    } catch (error) {
      console.log("error creating todo", error);
    }
  }

  useEffect(() => {
    fetchTodo();
  }, []);

  return (
    <div className="w-screen h-screen bg-blue-950 justify-center items-center flex flex-col gap-4">
      <div className="grid gap-4">
        <h2 className="text-white text-5xl font-bold">Amplify todo list</h2>
        {todos.map((i) => (
          <div className="text-white font-medium" key={i.name}>
            <p>{i.name}</p>
            <p>{i.description}</p>
          </div>
        ))}
        {["name", "description"].map((i) => (
          <input
            onChange={(event) => {
              setInput(i, event.currentTarget.value);
            }}
            key={i}
            placeholder={i}
            className="text-white w-full bg-transparent rounded-md p-2 outline-none border-2 border-white"
            type="text"
          />
        ))}

        <button onClick={addTodo}>Add </button>
      </div>
    </div>
  );
}

export default App;
