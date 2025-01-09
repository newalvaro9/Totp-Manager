import React, { useEffect, useState } from 'react';
import Clipboard from 'clipboard-js';
import generateOTP from '../utils/generateOTP';

interface Key {
    name: string;
    secret: string;
}

interface SecretProps {
    keyObj: Key,
    setKeys: React.Dispatch<React.SetStateAction<Key[]>>,
}

export default function Secret({ keyObj, setKeys }: SecretProps) {
    const [token, setToken] = useState('Generating...');
    const [progress, setProgress] = useState(0);

    const updateOTP = async () => {
        const token = generateOTP(keyObj.secret);
        setToken(token);
    };

    useEffect(() => {
        updateOTP();
        const interval = setInterval(() => {
            updateOTP();
        }, 1000);

        return () => clearInterval(interval);
    }, [keyObj.secret]);

    const updateProgress = () => {
        const remaining = (30 - Math.floor(Date.now() / 1000) % 30);
        const progress = (remaining - (Date.now() % 1000) / 1000) / 30 * 100;
        setProgress(progress);
    };

    useEffect(() => {
        updateProgress();
        const interval = setInterval(() => {
            updateProgress();
        }, 25);

        return () => clearInterval(interval);
    }, [keyObj.secret]);

    const removeKey = (name: string) => {
        setKeys((prevKeys) => prevKeys.filter((key) => key.name !== name));
    };

    const copyKey = () => {
        Clipboard.copy(token);
    };

    return (
        <div
            className="secret-item"
            style={{
                background: `linear-gradient(to left, #08272e ${progress}%, #00404b ${progress}%)`
            }}
        >
            <span className="secret-name">{keyObj.name}</span>
            <span className="otp-code" onClick={copyKey}>{token}</span>

            <button className="delete-button" onClick={() => removeKey(keyObj.name)}>
                Delete
            </button>
        </div>
    );
}
