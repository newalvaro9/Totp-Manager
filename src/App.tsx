import { useState } from "react";
import Login from "./Pages/Login";
import Manager from "./Pages/Manager";
import "./assets/css/styles.css";
import "./assets/css/buttons.css";

export default function App() {
    const [showPassword, setShowPassword] = useState(true);

    return showPassword ? <Login setShowPassword={setShowPassword}/> : <Manager setShowPassword={setShowPassword}/>;
}