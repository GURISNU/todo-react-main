/*
  각각의 할 일 항목을 렌더링하는 컴포넌트입니다.
  각 할 일의 완료 상태에 따라 체크박스와 텍스트 스타일을 동기화하며,
  삭제 버튼을 통해 해당 할 일을 삭제할 수 있습니다.
  이 컴포넌트는 `TodoList.js`에서 사용되어 할 일 목록을 구성합니다.
*/
import React, { useState } from "react";
import styles from "@/styles/TodoList.module.css";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { format } from "date-fns"
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useSession } from "next-auth/react";



// TodoItem 컴포넌트를 정의합니다.
const TodoItem = ({ todo, onToggle, onDelete }) => {
  const [highlighted, setHighlighted] = useState(false);
  // 각 할 일 항목을 렌더링합니다.
  const formattedDate = todo.createdAt ? format(todo.createdAt, 'PPP p') : '날짜 없음';
  // const formattedDate = format(todo.createdAt.toDate(), 'PPP p');
  const onHighlight = () => {
    setHighlighted(!highlighted);
  }
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const { data: session, status } = useSession();

  const handleEdit = () => {
    console.log("session status: ", status);
    console.log("session data: ", typeof(session.user.name));
    console.log("Todo user: ", typeof(todo.userName))
    
    if (status === "loading") {
      return <div>Loading...</div>
    }
    if (todo.userName === session.user.name) {
      setIsEditing(true);
    } else {
      alert("You are not authorized to edit this item.");
    }
  };

  const handleEditChange = (e) => {
    setEditText(e.target.value);
  }

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter" && editText.trim() !== "") {
      updateTodo();
      setIsEditing(false);
    } else if (e.key === "Escape") {
      setEditText(todo.text);
      setIsEditing(false);
    }
    //   const todoDoc = doc(db, "todos", todo.id);
    //   updateDoc(todoDoc, { text: editText })
    //     .then(() => {
    //       setIsEditing(false);
    //     })
    //     .catch((error) => {
    //       console.error("Error updating todo item: ", error);
    //     });
    // } else if (e.key === "Escape") {
    //   setEditText(todo.text);
    //   setIsEditing(false);
    // }
  };

  const updateTodo = async () => {
    const todoDoc = doc(db, "todos", todo.id);
    try {
      await updateDoc(todoDoc, { text: editText });
      alert("Todo updated successfully.");
    } catch (error) {
      console.error("Error updating todo: ", error);
      alert("Failed to update todo.");
    }
  };

  return (
    <li className={`${styles.todoItem} ${highlighted && styles.highlighted}`}>
      {/* 체크박스를 렌더링하고, 체크박스의 상태를 할 일의 완료 상태와 동기화합니다.
          체크박스의 상태가 변경되면 onToggle 함수를 호출하여 완료 상태를 업데이트합니다. */}
      {/* <input type="checkbox" checked={todo.completed} onChange={onToggle} /> */}
      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={handleEditChange}
          onKeyDown={handleEditKeyDown}
          onBlur={() => setIsEditing(false)}
          autoFocus
        />
      ) : (
        <>
          <Checkbox checked={todo.completed} onCheckedChange={onToggle}/>
          {/* 할 일의 텍스트를 렌더링하고, 완료 상태에 따라 텍스트에 취소선을 적용합니다. */}
          <span
          className={styles.todoText}
          style={{ textDecoration: todo.completed ? "line-through" : "none" }}
          >
            {todo.text}
          </span>
          <span className={styles.dateText}>{formattedDate}</span>

          {/* <button className={styles.highlightButton} onClick={onHighlight}>Highlight</button> */}
          <Button variant="primary" onClick={handleEdit}>Edit</Button>
          <Button variant="secondary" onClick={onHighlight}>Highlight</Button>
          {/* 삭제 버튼을 렌더링하고, 클릭 시 onDelete 함수를 호출하여 해당 할 일을 삭제합니다. */}
          {/* <button className="border border-gray-300 rounded px-3 py-1 text-gray-700 hover:bg-gray-200"onClick={onDelete}>Delete</button> */}
          <Button variant="destructive" onClick={onDelete}>Delete</Button>

        </>
      )}      
    </li>
  );
};

// TodoItem 컴포넌트를 내보냅니다.
export default TodoItem;
