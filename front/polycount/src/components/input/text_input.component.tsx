import { useId, useState } from "react";

function TextInput({ label, longueur_max, valeur_defaut, ...props }: any) {
    const id: string = useId();

    const [contenu, set_contenu] = useState<string>(valeur_defaut ?? '');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        set_contenu(e.target.value);
    };

    return (
        <div className="input-container">
            <div className="input-border" style={ longueur_max != null ? {height: '60px'} : {}}>
                <input id={id} onChange={handleChange} value={contenu} maxLength={longueur_max} {...props} spellCheck="false" />
                {longueur_max && (
                    <div className="character-counter">
                        {contenu.length}/{longueur_max}
                    </div>
                    )
                }
            </div>
            <label htmlFor={id}>{label}</label>
        </div>
    );
}

export default TextInput;