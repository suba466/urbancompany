import Button from "react-bootstrap/Button";
import { useReducer, useState } from "react";
import Table from "react-bootstrap/Table";

function reducer(state, action) {
  switch (action.type) {
    case "add":
      return [...state, { id: Date.now(), text: action.payload, done: true }];
    case "toggle":
      return state.map((todo) =>
        todo.id === action.payload ? { ...todo, done: !todo.done } : todo
      );
    case "del":
      return state.filter((todo) => todo.id !== action.payload);
    default:
      return state;
  }
}

const initialState = [
  { id: 1, text: "Homework", done: false },
  { id: 2, text: "Grocery", done: true },
  { id: 3, text: "Sport", done: true },
  { id: 4, text: "Studies", done: false },
  { id: 5, text: "Artwork", done: true },
  { id: 6, text: "Exploring new", done: false },
];

function Reducertask() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim() === "") return;
    dispatch({ type: "add", payload: input });
    setInput("");
  };

  return (
    <>
      <h2 style={{ textAlign: "center" }}>To Do List</h2>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Task</th>
            <th>Status</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {state.map((todo, index) => (
            <tr key={todo.id}>
              <td>{index + 1}</td>
              <td>
                {todo.text}
              </td>
              <td>
                <Button
                  variant={todo.done ? "success" : "danger"}
                  onClick={() =>
                    dispatch({ type: "toggle", payload: todo.id })
                  }
                >
                  {todo.done ? "Completed" : "Not yet completed"}
                </Button>
              </td>
              <td>
                <Button
                  variant="outline-danger"
                  onClick={() => dispatch({ type: "del", payload: todo.id })}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={2}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter new task..."
                style={{ width: "100%" }}
              />
            </td>
            <td colSpan={2}>
              <Button variant="light" onClick={handleAdd}>
                Add
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}

export default Reducertask;
