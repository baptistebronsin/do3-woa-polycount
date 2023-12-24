import { useId } from "react";

function TextInput({ value, label, longueur_max, valeur_defaut, ...props }: any) {
    const id: string = useId();

    return (
        <div className="input-container">
            <div className="input-border" style={ longueur_max != null ? {height: '60px'} : {}}>
                <input id={id} value={value} maxLength={longueur_max} {...props} spellCheck="false" />
                {longueur_max && (
                    <div className="character-counter">
                        {value.length}/{longueur_max}
                    </div>
                    )
                }
            </div>
            <label htmlFor={id}>{label}</label>
        </div>
    );
}

export default TextInput;