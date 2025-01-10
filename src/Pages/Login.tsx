import { useState } from "react";
import PasswordPrompt from "../components/PasswordPrompt";

interface Props {
    setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Login({ setShowPassword }: Props) {

    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setShowPassword(false);
    }

    return (
        <PasswordPrompt onSubmit={handleSubmit} error={error} setError={setError} />
    )
}