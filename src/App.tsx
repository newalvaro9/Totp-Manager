import { useState, useEffect } from 'react';
 
import Secret from './components/Secret';
import "./assets/css/styles.css"

interface Key {
    name: string;
    secret: string;
}

export default function Main() {
    const [keys, setKeys] = useState<Key[]>([]);
    const [name, setName] = useState('');
    const [otpSecret, setOtpSecret] = useState('');

    useEffect(() => {
        (async () => {
            // load keys
        })();
    }, []);

    const addKey = async () => {
        if (!name || !otpSecret) return;

        const newKeys = [...keys, { name, secret: otpSecret }];
        setKeys(newKeys);
    };

    return (
        <div className="container">
            <div className="menu">
                <h1>TOTP Manager</h1>
                <input
                    type="text"
                    placeholder="Enter Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Enter OTP Secret"
                    value={otpSecret}
                    onChange={(e) => setOtpSecret(e.target.value)}
                />
                <button onClick={addKey}>Add Key</button>
            </div>

            <div className="container-secrets">
                {keys.length === 0 ? (
                    <></>
                ) : (
                    <>
                        <h2 className="stored-secrets-title">Stored Secrets</h2>
                        {keys.map((key, index) => (
                            <Secret key={index} keyObj={key} setKeys={setKeys} />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}