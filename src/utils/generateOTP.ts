import CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';

function base32Decode(base32: string): Buffer {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const padding = '='.repeat((8 - (base32.length % 8)) % 8);
    base32 = (base32 + padding).toUpperCase();
    const bytes: number[] = [];
    let buffer = 0;
    let bufferLength = 0;

    for (let i = 0; i < base32.length; i++) {
        const value = base32Chars.indexOf(base32[i]);
        if (value === -1) {
            throw new Error('Invalid base32 character');
        }
        buffer = (buffer << 5) | value;
        bufferLength += 5;
        if (bufferLength >= 8) {
            bufferLength -= 8;
            bytes.push(buffer >> bufferLength);
            buffer &= (1 << bufferLength) - 1;
        }
    }

    return Buffer.from(bytes);
}

function hotp(key: string, counter: string | number | bigint | boolean, digits = 6, digest = 'sha1') {
    // Decode the Base32 key into a byte array
    const decodedKey = new Uint8Array(base32Decode(key));

    // Create an 8-byte buffer for the counter
    const counterBuffer = new ArrayBuffer(8);
    const counterView = new DataView(counterBuffer);
    counterView.setBigUint64(0, BigInt(counter), false); // Big-endian

    // Convert the counter buffer to a WordArray
    const counterWordArray = CryptoJS.lib.WordArray.create(new Uint8Array(counterBuffer));

    // Convert the decoded key to a WordArray
    const keyWordArray = CryptoJS.lib.WordArray.create(decodedKey);

    // Generate the HMAC using the specified digest algorithm
    let hmac;
    if (digest === 'sha1') {
        hmac = CryptoJS.HmacSHA1(counterWordArray, keyWordArray);
    }/* else if (digest === 'sha256') {
        hmac = CryptoJS.HmacSHA256(counterWordArray, keyWordArray);
    } else if (digest === 'sha512') {
        hmac = CryptoJS.HmacSHA512(counterWordArray, keyWordArray);
    } */else {
        throw new Error('Unsupported digest algorithm');
    }

    // Convert the HMAC to a byte array
    const hmacBytes = CryptoJS.enc.Hex.parse(hmac.toString(CryptoJS.enc.Hex));
    const hmacArray = Array.from({ length: hmacBytes.sigBytes }, (_, i) =>
        (hmacBytes.words[(i / 4) | 0] >> (24 - (i % 4) * 8)) & 0xff
    );

    // Get the offset from the last byte of the HMAC
    const offset = hmacArray[hmacArray.length - 1] & 0x0f;

    // Extract a 4-byte dynamic binary code from the HMAC
    const binaryCode =
        ((hmacArray[offset] & 0x7f) << 24) |
        ((hmacArray[offset + 1] & 0xff) << 16) |
        ((hmacArray[offset + 2] & 0xff) << 8) |
        (hmacArray[offset + 3] & 0xff);

    // Generate the HOTP value and pad to the desired length
    const hotpValue = (binaryCode % 10 ** digits).toString().padStart(digits, '0');

    return hotpValue;
}


export default function totp(key: string, timeStep: number = 30, digits: number = 6, digest: string = 'sha1'): string {
    const counter = Math.floor(Date.now() / 1000 / timeStep);
    return hotp(key, counter, digits, digest);
}