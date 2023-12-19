import React, { useState, useEffect } from 'react';
import { useId } from 'react';

const TextAreaInput: React.FC<any> = ({ label, longueur_max, ...props }: any) => {
    const id = useId();
    const [content, setContent] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    return (
        <div className="text-area-container">
            <textarea
                id={id}
                {...props}
                value={content}
                onChange={handleChange}
                maxLength={longueur_max}
                spellCheck="false"
            ></textarea>
            <label htmlFor={id}>{label}</label>
            {longueur_max && (
                <div className="character-counter">
                    {content.length}/{longueur_max}
                </div>
                )
            }
        </div>
    );
};

export default TextAreaInput;