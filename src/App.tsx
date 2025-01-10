import { useState } from "react";
import Login from "./Pages/Login";
import Manager from "./Pages/Manager";
import "./assets/css/styles.css";

export default function App() {
    const [showPassword, setShowPassword] = useState(true);

    return showPassword ? <Login setShowPassword={setShowPassword}/> : <Manager />;
}