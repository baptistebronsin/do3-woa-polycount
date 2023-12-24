import React from 'react';
import { useId } from 'react';

const TextAreaInput: React.FC<any> = ({ label, longueur_max, value, ...props }: any) => {
    const id = useId();

    return (
        <div className="text-area-container">
            <textarea
                id={id}
                {...props}
                value={value}
                maxLength={longueur_max}
                spellCheck="false"
            ></textarea>
            <label htmlFor={id}>{label}</label>
            {longueur_max && (
                <div className="character-counter">
                    {value.length}/{longueur_max}
                </div>
                )
            }
        </div>
    );
};

export default TextAreaInput;