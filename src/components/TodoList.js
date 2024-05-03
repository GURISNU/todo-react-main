/* 
  할 일 목록을 관리하고 렌더링하는 주요 컴포넌트입니다.
  상태 관리를 위해 `useState` 훅을 사용하여 할 일 목록과 입력값을 관리합니다.
  할 일 목록의 추가, 삭제, 완료 상태 변경 등의 기능을 구현하였습니다.
*/
"use client";

import React, { useState, useEffect } from "react";
import TodoItem from "@/components/TodoItem";
import styles from "@/styles/TodoList.module.css";
import { Input } from "@/components/ui/input"
import { db } from "@/firebase";
import{
  collection,
  query,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  where,
} from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";

const todoCollection = collection(db, "todos");
// TodoList 컴포넌트를 정의합니다.
const TodoList = () => {
  // 상태를 관리하는 useState 훅을 사용하여 할 일 목록과 입력값을 초기화합니다.
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    getTodos();
  }, []);

  const getTodos = async () => {
    const q = query(todoCollection);
    const results = await getDocs(q);
    const newTodos = [];

    results.docs.forEach((doc) => {
      const data = doc.data();
      console.log(doc.data());
      newTodos.push({ id: doc.id, ...data, createdAt: data.createdAt ? data.createdAt.toDate() : new Date() });
    });

    setTodos(newTodos);
  }

  // addTodo 함수는 입력값을 이용하여 새로운 할 일을 목록에 추가하는 함수입니다.
  const addTodo = async () => {
    // 입력값이 비어있는 경우 함수를 종료합니다.
    if (input.trim() === "") return;
    // 기존 할 일 목록에 새로운 할 일을 추가하고, 입력값을 초기화합니다.
    // {
    //   id: 할일의 고유 id,
    //   text: 할일의 내용,
    //   completed: 완료 여부,
    // }
    // ...todos => {id: 1, text: "할일1", completed: false}, {id: 2, text: "할일2", completed: false}}, ..
    const docRef = await addDoc(todoCollection, {
      text: input,
      completed: false,
      createdAt: serverTimestamp()
    });
    setTodos([...todos, { id: docRef.id, text: input, completed: false, createdAt: new Date() }]);
    setInput("");
  };

  // toggleTodo 함수는 체크박스를 눌러 할 일의 완료 상태를 변경하는 함수입니다.
  const toggleTodo = (id) => {
    // 할 일 목록에서 해당 id를 가진 할 일의 완료 상태를 반전시킵니다.
    setTodos(
      // todos.map((todo) =>
      //   todo.id === id ? { ...todo, completed: !todo.completed } : todo
      // )
      // ...todo => id: 1, text: "할일1", completed: false
      todos.map((todo) => {
        if (todo.id === id) {
          const todoDoc = doc(todoCollection, id);
          updateDoc(todoDoc, { completed: !todo.compelted });
          return { ...todo, completed: !todo.completed };
        } else {
          return todo;
        }
      })
    );
  };

  // deleteTodo 함수는 할 일을 목록에서 삭제하는 함수입니다.
  const deleteTodo = (id) => {
    const todoDoc = doc(todoCollection, id);
    deleteDoc(todoDoc);
    // 해당 id를 가진 할 일을 제외한 나머지 목록을 새로운 상태로 저장합니다.
    // setTodos(todos.filter((todo) => todo.id !== id));
    setTodos(
      todos.filter((todo) => {
        return todo.id !== id;
      })
    );
  };

  // 입력 필드에서 엔터 키를 눌렀을 때 Todo 아이템을 추가하는 함수입니다.
  const handleKeyPress = (e) => {
    // 눌린 키가 엔터키(키코드 13)인지 확인합니다.
    if (e.key === 'Enter') {
      // 입력값이 비어있지 않다면 새로운 할 일을 추가합니다.
      if (input.trim() !== "") {
        addTodo();
      }
    }
  };

  // 컴포넌트를 렌더링합니다.
  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h1 className="font-mono font-bold text-center text-4xl mb-4">Todo List</h1>
      {/* 할 일을 입력받는 텍스트 필드입니다. */}
      <Input type="text" className="mb-4" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress}></Input>
      {/* <input
        type="text"
        className="w-full p-2 mb-4 border rounded focus:outline-none focust:shadow-outline"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      /> */}
      {/* 할 일을 추가하는 버튼입니다. */}
      <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded" onClick={addTodo}>
        Add Todo
      </button>
      {/* 할 일 목록을 렌더링합니다. */}
      <ul>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={() => toggleTodo(todo.id)}
            onDelete={() => deleteTodo(todo.id)}
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
